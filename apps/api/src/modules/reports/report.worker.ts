import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Inject, forwardRef, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { AiOrchestrator } from '../ai/ai.orchestrator';
import { ReportRepository } from '../../prisma/report.repository';
import { RedisService, CacheKeys, CacheTTL } from '../../common/redis/redis.service';
import { IdeaDedupService } from './idea-dedup.service';
import { ReportProducer, GenerateReportJobData } from './report.producer';
import { ReportStatus, Verdict } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * ReportWorker is a BullMQ Background Processor.
 * It consumes `GenerateReportJobData` from the Redis queue.
 * 
 * Flow:
 * 1. Updates DB status to PROCESSING.
 * 2. Invokes AiOrchestrator to generate the comprehensive report.
 * 3. Maps Orchestrator output to Prisma Report models and JSON fields.
 * 4. Caches the final report in Redis for 24 hours.
 * 5. Handles transient failures using BullMQ exponential backoff and moves to Dead Letter Queue (DLQ) if exhausted.
 */
@Processor('report-generation', { concurrency: 3 })
export class ReportWorker extends WorkerHost {
  private readonly logger = new Logger(ReportWorker.name);

  constructor(
    @Inject(forwardRef(() => AiOrchestrator)) private readonly orchestrator: AiOrchestrator,
    private readonly reportRepo: ReportRepository,
    private readonly redis: RedisService,
    private readonly dedup: IdeaDedupService,
    private readonly producer: ReportProducer,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  /**
   * Processes an individual job pulled from the BullMQ Queue.
   * This is executed outside the HTTP request lifecycle.
   * 
   * @param job BullMQ Job containing user and idea payload context.
   */
  async process(job: Job<GenerateReportJobData>): Promise<void> {
    const data = job.data;
    const startTime = Date.now();

    this.logger.log(`⚙️  Processing job ${job.id} → report ${data.reportId}`);
    await job.updateProgress(5);

    await this.reportRepo.updateStatus(data.reportId, ReportStatus.PROCESSING);

    try {
      // ── Run all 4 agents via orchestrator ─────────────────────────────
      const result = await this.orchestrator.run({
        reportId: data.reportId,
        // removed ideaId
        ideaDescription: data.ideaDescription,
        industry: data.industry,
        geography: data.geography,
        stage: data.stage,
        teamSize: data.teamSize,
        budget: data.budget,
        language: data.language,
      });

      await job.updateProgress(90);

      const generationTimeMs = Date.now() - startTime;

      // ── Map orchestrator output → Report DB fields ─────────────────────
      const verdictMap: Record<string, Verdict> = {
        Fund: Verdict.FUND,
        Watch: Verdict.WATCH,
        Pass: Verdict.PASS,
      };

      const marketScoreRaw = result.market.sam?.inrCr
        ? Math.min(100, Math.round((result.market.sam.inrCr / 50000) * 100))
        : 70;

      await this.reportRepo.updateStatus(data.reportId, ReportStatus.DONE, {
        ideaScore: Math.round((result.vc.investorScore + marketScoreRaw) / 2),
        marketScore: marketScoreRaw,
        moatScore: result.vc.dimensions?.find(d => d.name === 'Defensibility')?.score
          ? Math.round(result.vc.dimensions.find(d => d.name === 'Defensibility')!.score * 10)
          : null,
        riskScore: result.product.risks?.filter(r => r.severity === 'High').length
          ? Math.max(0, 100 - result.product.risks.filter(r => r.severity === 'High').length * 20)
          : 80,
        investorScore: result.vc.investorScore,
        verdict: verdictMap[result.vc.verdict] ?? Verdict.WATCH,
        marketData: result.market as any,
        competitorData: result.competitors as any,
        riskData: result.product.risks as any,
        monetizationData: {
          monetization: result.vc.monetization,
          fundingRecommendation: result.vc.fundingRecommendation,
        } as any,
        mvpData: result.product.mvp as any,
        gtmData: result.product.gtm as any,
        investorData: result.vc.dimensions as any,
        pitchData: result.vc.pitch as any,
        // New VentureForge AI fields
        businessFormationData: result.businessFormation as any,
        complianceData: result.compliance as any,
        financialData: result.financial as any,
        sopData: result.operations as any,
        teamData: result.operations.teamPlan as any,
        technologyData: result.operations.technologyStack as any,
        fundingData: result.financial.fundingOptions as any,
        launchChecklistData: result.operations.launchChecklist as any,
        generationTimeMs,
      });

      // ── Cache full report JSON for 24 hours ───────────────────────────
      const finalReport = await this.prisma.report.findUnique({
        where: { id: data.reportId },
        include: { idea: true },
      });
      await this.redis.set(CacheKeys.report(data.reportId), finalReport, CacheTTL.REPORT);

      // ── Store idea hash → reportId for dedup ──────────────────────────
      if (data.ideaHash) {
        await this.dedup.storeHash(data.ideaHash, data.reportId);
      }

      await job.updateProgress(100);
      this.logger.log(`✅ Job ${job.id} done in ${generationTimeMs}ms`);

    } catch (err) {
      const msg = (err as Error).message;
      this.logger.error(`❌ Job ${job.id} failed (attempt ${job.attemptsMade}): ${msg}`);

      // If this is the last retry, update DB and move to DLQ
      if (job.attemptsMade >= (job.opts.attempts ?? 3)) {
        await this.reportRepo.updateStatus(data.reportId, ReportStatus.FAILED, {
          errorMessage: msg,
        } as any);
        await this.producer.moveToDlq(data, msg);
      } else {
        // Transient failure — keep status as PROCESSING for next retry
        this.logger.warn(`↩️  Retrying job ${job.id} (${job.attemptsMade}/${job.opts.attempts})`);
      }

      throw err; // Re-throw so BullMQ applies backoff and retry
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`🏁 [BullMQ] Job ${job.id} COMPLETED`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    this.logger.error(`💀 [BullMQ] Job ${job.id} permanently FAILED after ${job.attemptsMade} attempts: ${err.message}`);
  }

  @OnWorkerEvent('stalled')
  onStalled(jobId: string) {
    this.logger.warn(`⚠️  [BullMQ] Job ${jobId} STALLED — possible worker crash`);
  }

  @OnWorkerEvent('progress')
  onProgress(job: Job, progress: number) {
    this.logger.debug(`📊 [BullMQ] Job ${job.id} progress: ${progress}%`);
  }
}
