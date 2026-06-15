import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Plan } from '@prisma/client';

export interface GenerateReportJobData {
  reportId: string;
  ideaId: string;
  ideaDescription: string;
  industry: string;
  geography: string;
  stage: string;
  teamSize: number;
  budget: string;
  userPlan: Plan;
  ideaHash?: string;
}

/** Lower number = higher priority in BullMQ */
const PLAN_PRIORITY: Record<Plan, number> = {
  PREMIUM: 1,
  PRO: 5,
  FREE: 10,
};

/** Exponential backoff delays in ms: 30s, 2m, 10m */
const BACKOFF_DELAYS = [30_000, 120_000, 600_000];

@Injectable()
export class ReportProducer {
  private readonly logger = new Logger(ReportProducer.name);

  constructor(
    @InjectQueue('report-generation') private readonly queue: Queue,
    @InjectQueue('report-generation-dlq') private readonly dlq: Queue,
  ) {}

  async addJob(data: GenerateReportJobData): Promise<string> {
    const priority = PLAN_PRIORITY[data.userPlan];

    const job = await this.queue.add('generate-report', data, {
      priority,
      attempts: 3,
      backoff: { type: 'exponential', delay: BACKOFF_DELAYS[0] },
      removeOnComplete: { count: 200, age: 60 * 60 * 24 * 7 }, // keep 200 or 7 days
      removeOnFail: false, // keep ALL failed jobs — inspectable via Bull Board
    });

    this.logger.log(
      `📥 Job ${job.id} queued | report: ${data.reportId} | plan: ${data.userPlan} | priority: ${priority}`,
    );

    return job.id as string;
  }

  /** Move a permanently failed job to the Dead Letter Queue for manual review */
  async moveToDlq(jobData: GenerateReportJobData, failReason: string): Promise<void> {
    await this.dlq.add('dead-report', { ...jobData, failReason }, {
      attempts: 1,
      removeOnFail: false,
    });
    this.logger.warn(
      `☠️  Job for report ${jobData.reportId} moved to DLQ. Reason: ${failReason}`,
    );
  }
}
