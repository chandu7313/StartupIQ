import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { AiOrchestrator } from '../ai/orchestrator';
import { ReportRepository } from '../../prisma/report.repository';
import { RedisService, CacheKeys, CacheTTL } from '../../common/redis/redis.service';
import { GenerateReportJobData } from './report.producer';

@Processor('report-generation', {
  concurrency: 3, // process up to 3 jobs simultaneously
})
export class ReportWorker extends WorkerHost {
  private readonly logger = new Logger(ReportWorker.name);

  constructor(
    private readonly orchestrator: AiOrchestrator,
    private readonly reports: ReportRepository,
    private readonly redis: RedisService,
  ) {
    super();
  }

  async process(job: Job<GenerateReportJobData>): Promise<void> {
    const { reportId, ideaDescription, industry, geography, stage, teamSize, budget } = job.data;
    const startTime = Date.now();

    this.logger.log(`[ReportWorker] Processing job ${job.id} → report ${reportId}`);

    await this.reports.updateStatus(reportId, 'PROCESSING');
    await job.updateProgress(5);

    try {
      const result = await this.orchestrator.run({
        reportId,
        ideaId: job.data.ideaId,
        ideaDescription,
        industry,
        geography,
        stage,
        teamSize,
        budget,
      });

      const generationTimeMs = Date.now() - startTime;

      await this.reports.updateStatus(reportId, 'DONE', {
        marketScore: result.market.sam?.inrCr ? Math.min(100, Math.round((result.market.sam.inrCr / 10000) * 100)) : result.vc.investorScore,
        investorScore: result.vc.investorScore,
        verdict: result.vc.verdict?.toUpperCase() as any,
        marketData: result.market as any,
        competitorData: result.competitors as any,
        riskData: result.product.risks as any,
        monetizationData: { monetization: result.vc.monetization, recommendation: result.vc.fundingRecommendation } as any,
        mvpData: result.product.mvp as any,
        gtmData: result.product.gtm as any,
        investorData: result.vc.dimensions as any,
        pitchData: result.vc.pitch as any,
        generationTimeMs,
      });

      // Cache full report for 24h
      await this.redis.set(CacheKeys.report(reportId), result, CacheTTL.REPORT);

      await job.updateProgress(100);
      this.logger.log(`[ReportWorker] ✅ Job ${job.id} completed in ${generationTimeMs}ms`);
    } catch (err) {
      const msg = (err as Error).message;
      this.logger.error(`[ReportWorker] ❌ Job ${job.id} failed: ${msg}`);
      await this.reports.updateStatus(reportId, 'FAILED', { errorMessage: msg } as any);
      throw err; // Re-throw so BullMQ records it and applies retry/backoff
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`[BullMQ] Job ${job.id} marked COMPLETED`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    this.logger.error(`[BullMQ] Job ${job.id} marked FAILED after ${job.attemptsMade} attempts: ${err.message}`);
  }

  @OnWorkerEvent('stalled')
  onStalled(jobId: string) {
    this.logger.warn(`[BullMQ] Job ${jobId} STALLED — check worker health`);
  }
}
