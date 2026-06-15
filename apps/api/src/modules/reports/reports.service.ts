import {
  Injectable, HttpException, HttpStatus, NotFoundException, Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ReportRepository } from '../../prisma/report.repository';
import { RedisService, CacheKeys, CacheTTL } from '../../common/redis/redis.service';
import { IdeaDedupService } from './idea-dedup.service';
import { Plan, ReportStatus } from '@prisma/client';
import { GenerateReportDto } from './reports.controller';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly reports: ReportRepository,
    private readonly redis: RedisService,
    private readonly dedup: IdeaDedupService,
  ) {}

  // ─────────────────────────────────────────────────
  // Called by controller: validates user, creates Report row,
  // logs usage, returns report + plan for producer
  // ─────────────────────────────────────────────────
  async initiateGeneration(
    clerkUserId: string,
    dto: GenerateReportDto,
    ideaHash: string,
  ): Promise<{ report: any; jobId: null; userPlan: Plan }> {
    const user = await this.prisma.user.findUnique({ where: { clerkId: clerkUserId } });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    // Enforce FREE tier limit (reportsLimit of -1 = unlimited)
    if (user.reportsLimit !== -1 && user.reportsUsed >= user.reportsLimit) {
      throw new HttpException(
        'Monthly report limit reached. Upgrade to Pro to generate more.',
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

    // Increment usage counter
    await this.prisma.user.update({
      where: { id: user.id },
      data: { reportsUsed: { increment: 1 } },
    });

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

    return { report, jobId: null, userPlan: user.plan };
  }

  // ─────────────────────────────────────────────────
  // GET by ID — Redis first, then DB
  // ─────────────────────────────────────────────────
  async getReportById(clerkUserId: string, reportId: string) {
    const cacheKey = CacheKeys.report(reportId);
    const cached = await this.redis.get<any>(cacheKey);
    if (cached) {
      this.logger.debug(`Cache HIT: ${cacheKey}`);
      return cached;
    }

    const user = await this.prisma.user.findUnique({ where: { clerkId: clerkUserId } });
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
  async getUserReports(clerkUserId: string, page = 1, limit = 10) {
    const user = await this.prisma.user.findUnique({ where: { clerkId: clerkUserId } });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    return this.reports.findByUser(user.id, page, limit);
  }

  // ─────────────────────────────────────────────────
  // Compare two reports
  // ─────────────────────────────────────────────────
  async compareReports(clerkUserId: string, id1: string, id2: string) {
    const [r1, r2] = await Promise.all([
      this.getReportById(clerkUserId, id1),
      this.getReportById(clerkUserId, id2),
    ]);

    if (!r1) throw new NotFoundException(`Report ${id1} not found`);
    if (!r2) throw new NotFoundException(`Report ${id2} not found`);

    // Determine winner by investorScore
    let winner: string | null = null;
    if (r1.investorScore != null && r2.investorScore != null) {
      winner = r1.investorScore >= r2.investorScore ? id1 : id2;
    }

    // Persist comparison record
    const comparison = await this.prisma.comparison.create({
      data: {
        userId: (await this.prisma.user.findUnique({ where: { clerkId: clerkUserId } }))!.id,
        reportAId: id1,
        reportBId: id2,
        winner,
        analysis: {
          scoreDelta: (r1.investorScore ?? 0) - (r2.investorScore ?? 0),
          marketScoreDelta: (r1.marketScore ?? 0) - (r2.marketScore ?? 0),
          verdictA: r1.verdict,
          verdictB: r2.verdict,
        },
      },
    });

    return { reportA: r1, reportB: r2, winner, comparisonId: comparison.id };
  }

  // ─────────────────────────────────────────────────
  // Soft delete report + bust cache
  // ─────────────────────────────────────────────────
  async softDeleteReport(clerkUserId: string, reportId: string) {
    const user = await this.prisma.user.findUnique({ where: { clerkId: clerkUserId } });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    await this.reports.softDelete(reportId, user.id);
    await this.redis.del(CacheKeys.report(reportId));
  }
}
