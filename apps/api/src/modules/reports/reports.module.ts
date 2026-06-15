import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { ReportGateway } from './report.gateway';
import { ReportWorker } from './report.worker';
import { ReportProducer } from './report.producer';
import { IdeaDedupService } from './idea-dedup.service';
import { AiModule } from '../ai/ai.module';

const REPORT_QUEUE = 'report-generation';
const DLQ_NAME = 'report-generation-dlq';

@Module({
  imports: [
    AiModule,
    // Main queue
    BullModule.registerQueue({ name: REPORT_QUEUE }),
    // Dead Letter Queue — failed jobs land here after all retries exhausted
    BullModule.registerQueue({ name: DLQ_NAME }),
    // Bull Board admin panel entries
    BullBoardModule.forFeature({
      name: REPORT_QUEUE,
      adapter: BullMQAdapter,
    }),
    BullBoardModule.forFeature({
      name: DLQ_NAME,
      adapter: BullMQAdapter,
    }),
  ],
  providers: [
    ReportsService,
    ReportGateway,
    ReportWorker,
    ReportProducer,
    IdeaDedupService,
  ],
  controllers: [ReportsController],
  exports: [ReportProducer, IdeaDedupService, ReportsService],
})
export class ReportsModule {}
