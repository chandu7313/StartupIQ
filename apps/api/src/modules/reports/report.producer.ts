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
}

/** Priority values: lower number = higher priority in BullMQ */
const PLAN_PRIORITY: Record<Plan, number> = {
  PREMIUM: 1,
  PRO: 5,
  FREE: 10,
};

@Injectable()
export class ReportProducer {
  private readonly logger = new Logger(ReportProducer.name);

  constructor(
    @InjectQueue('report-generation') private readonly queue: Queue,
  ) {}

  async addJob(data: GenerateReportJobData): Promise<string> {
    const priority = PLAN_PRIORITY[data.userPlan];

    const job = await this.queue.add('generate-report', data, {
      priority,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 30_000, // 30s → 2m → 10m
      },
      removeOnComplete: { count: 100 }, // keep last 100 completed
      removeOnFail: false, // keep ALL failed for DLQ inspection
    });

    this.logger.log(
      `[ReportProducer] Job ${job.id} queued for report ${data.reportId} (plan: ${data.userPlan}, priority: ${priority})`,
    );

    return job.id as string;
  }
}
