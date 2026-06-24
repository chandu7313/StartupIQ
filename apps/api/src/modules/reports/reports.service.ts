import {
  Injectable, HttpException, HttpStatus, NotFoundException, Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ReportRepository } from '../../prisma/report.repository';
import { RedisService, CacheKeys, CacheTTL } from '../../common/redis/redis.service';
import { IdeaDedupService } from './idea-dedup.service';
import { ReportStatus } from '@prisma/client';
import { GenerateReportDto } from './reports.controller';

import { UsersService } from '../users/users.service';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly reports: ReportRepository,
    private readonly redis: RedisService,
    private readonly dedup: IdeaDedupService,
    private readonly usersService: UsersService,
  ) {}

  // ─────────────────────────────────────────────────
  // Called by controller: validates user, creates Report row,
  // logs usage, returns report + plan for producer
  // ─────────────────────────────────────────────────
  async initiateGeneration(
    userId: string,
    dto: GenerateReportDto,
    ideaHash: string,
  ): Promise<{ report: any; jobId: null }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    // Enforce credit limit using UsersService
    const hasCredits = await this.usersService.hasEnoughCredits(userId, 100);
    if (!hasCredits) {
      throw new HttpException(
        'Insufficient credits to generate report. Please top up your balance.',
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    // Verify idea belongs to this user
    const idea = await this.prisma.idea.findFirst({
      where: { id: dto.ideaId, userId: user.id },
    });
    if (!idea) throw new NotFoundException('Idea not found');

    // Create the pending report record
    const report = await this.prisma.report.create({
      data: {
        ideaId: idea.id,
        userId: user.id,
        status: ReportStatus.PENDING,
      },
    });

    // Deduct 100 credits
    await this.usersService.deductCredits(userId, 100);

    // Log usage
    await this.prisma.usageLog.create({
      data: {
        userId: user.id,
        action: 'report.generate',
        metadata: { reportId: report.id, ideaId: idea.id, ideaHash },
      },
    });

    // Invalidate user report count cache
    await this.redis.del(CacheKeys.userReportCount(user.id));

    return { report, jobId: null };
  }

  // ─────────────────────────────────────────────────
  // GET by ID — Redis first, then DB
  // ─────────────────────────────────────────────────
  async getReportById(userId: string, reportId: string) {
    const cacheKey = CacheKeys.report(reportId);
    const cached = await this.redis.get<any>(cacheKey);
    if (cached) {
      this.logger.debug(`Cache HIT: ${cacheKey}`);
      return cached;
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    const report = await this.prisma.report.findFirst({
      where: { id: reportId, userId: user.id, deletedAt: null },
      include: { idea: true },
    });

    if (report?.status === ReportStatus.DONE) {
      await this.redis.set(cacheKey, report, CacheTTL.REPORT);
    }

    return report;
  }

  // ─────────────────────────────────────────────────
  // GET paginated user reports
  // ─────────────────────────────────────────────────
  async getUserReports(userId: string, page = 1, limit = 10) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    return this.reports.findByUser(user.id, page, limit);
  }

  // ─────────────────────────────────────────────────
  // Compare two reports
  // ─────────────────────────────────────────────────
  async compareReports(userId: string, reportAId: string, reportBId: string) {
    // Check cache first
    const cacheKey = CacheKeys.compare(reportAId, reportBId);
    const cached = await this.redis.get<any>(cacheKey);
    if (cached) {
      this.logger.debug(`Cache HIT: ${cacheKey}`);
      return cached;
    }

    const [reportA, reportB] = await Promise.all([
      this.getReportById(userId, reportAId),
      this.getReportById(userId, reportBId),
    ]);

    if (!reportA) throw new NotFoundException(`Report ${reportAId} not found`);
    if (!reportB) throw new NotFoundException(`Report ${reportBId} not found`);
    if (reportA.status !== ReportStatus.DONE) throw new HttpException(`Report A is not yet complete (status: ${reportA.status})`, HttpStatus.BAD_REQUEST);
    if (reportB.status !== ReportStatus.DONE) throw new HttpException(`Report B is not yet complete (status: ${reportB.status})`, HttpStatus.BAD_REQUEST);

    // Compute per-dimension winners
    const dimensions = ['ideaScore', 'marketScore', 'moatScore', 'riskScore', 'investorScore'] as const;
    const winners: Record<string, 'A' | 'B' | 'TIE'> = {};
    const deltas: Record<string, number> = {};

    for (const dim of dimensions) {
      const a = reportA[dim] ?? 0;
      const b = reportB[dim] ?? 0;
      deltas[dim] = Math.abs(a - b);
      
      if (dim === 'riskScore') {
        // Lower risk is better
        winners[dim] = a < b ? 'A' : b < a ? 'B' : 'TIE';
      } else {
        winners[dim] = a > b ? 'A' : b > a ? 'B' : 'TIE';
      }
    }

    // Generate AI recommendation using Claude
    let recommendation = '';
    let summary = '';
    try {
      const Anthropic = (await import('@anthropic-ai/sdk')).default;
      const client = new Anthropic({
        apiKey: this.prisma['configService']?.get?.('ANTHROPIC_API_KEY') || process.env.ANTHROPIC_API_KEY,
      });

      const prompt = `You are a startup advisor. Compare these two startup analysis reports and in EXACTLY 2 sentences, recommend which idea the founder should pursue and why.

Report A — "${reportA.idea?.name || 'Idea A'}" (${reportA.idea?.industry || 'Unknown'}):
Investor Score: ${reportA.investorScore}/100, Market Score: ${reportA.marketScore}/100, Verdict: ${reportA.verdict}

Report B — "${reportB.idea?.name || 'Idea B'}" (${reportB.idea?.industry || 'Unknown'}):
Investor Score: ${reportB.investorScore}/100, Market Score: ${reportB.marketScore}/100, Verdict: ${reportB.verdict}

Return ONLY a JSON object: {"recommendation": "<2-sentence recommendation>", "summary": "<1-sentence summary of the key differentiator>"}`;

      const response = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 256,
        messages: [{ role: 'user', content: prompt }],
      });
      const rawText = (response.content[0] as any).text;
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        recommendation = parsed.recommendation || '';
        summary = parsed.summary || '';
      }
    } catch (err) {
      this.logger.warn(`AI comparison summary failed: ${(err as Error).message}`);
      recommendation = `Based on the scores, ${winners.investorScore === 'A' ? reportA.idea?.name : reportB.idea?.name} shows stronger overall investment potential.`;
      summary = `Investor score delta: ${deltas.investorScore} points.`;
    }

    // Persist comparison record
    const comparison = await this.prisma.comparison.create({
      data: {
        userId,
        reportAId,
        reportBId,
        winner: winners.investorScore === 'A' ? reportAId : winners.investorScore === 'B' ? reportBId : null,
        analysis: { winners, deltas, recommendation, summary },
      },
    });

    const result = {
      reportA,
      reportB,
      winners,
      deltas,
      recommendation,
      summary,
      comparisonId: comparison.id,
    };

    // Cache for 1 hour
    await this.redis.set(cacheKey, result, CacheTTL.COMPARE);
    return result;
  }

  // ─────────────────────────────────────────────────
  // Share report — generate public token
  // ─────────────────────────────────────────────────
  async shareReport(userId: string, reportId: string) {
    const { nanoid } = await import('nanoid');
    
    const report = await this.prisma.report.findFirst({
      where: { id: reportId, userId, deletedAt: null },
    });
    if (!report) throw new NotFoundException(`Report ${reportId} not found`);
    if (report.status !== ReportStatus.DONE) {
      throw new HttpException('Only completed reports can be shared', HttpStatus.BAD_REQUEST);
    }

    // If already shared, return existing token
    if (report.shareToken && report.isPublic) {
      return { shareUrl: `https://ventureforge.in/share/${report.shareToken}`, token: report.shareToken };
    }

    const token = nanoid(10);
    await this.prisma.report.update({
      where: { id: reportId },
      data: { shareToken: token, isPublic: true, sharedAt: new Date() },
    });

    return { shareUrl: `https://ventureforge.in/share/${token}`, token };
  }

  // ─────────────────────────────────────────────────
  // Unshare report — revoke public access
  // ─────────────────────────────────────────────────
  async unshareReport(userId: string, reportId: string) {
    const report = await this.prisma.report.findFirst({
      where: { id: reportId, userId, deletedAt: null },
    });
    if (!report) throw new NotFoundException(`Report ${reportId} not found`);

    await this.prisma.report.update({
      where: { id: reportId },
      data: { shareToken: null, isPublic: false, sharedAt: null },
    });
  }

  // ─────────────────────────────────────────────────
  // Get public report by share token (no auth required)
  // ─────────────────────────────────────────────────
  async getPublicReport(token: string) {
    const report = await this.prisma.report.findFirst({
      where: { shareToken: token, isPublic: true, deletedAt: null },
      include: { idea: true },
    });
    if (!report) throw new NotFoundException('Report not found or sharing has been disabled');

    // Return safe data — strip userId and internal metadata
    const { userId, errorMessage, tokensUsed, ...safeReport } = report;
    return safeReport;
  }

  // ─────────────────────────────────────────────────
  // Soft delete report + bust cache
  // ─────────────────────────────────────────────────
  async softDeleteReport(userId: string, reportId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    await this.reports.softDelete(reportId, user.id);
    await this.redis.del(CacheKeys.report(reportId));
  }
}

