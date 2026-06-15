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

@Module({
  imports: [
    AiModule,
    BullModule.registerQueue({ name: 'report-generation' }),
    BullBoardModule.forFeature({
      name: 'report-generation',
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
  exports: [ReportProducer, IdeaDedupService],
})
export class ReportsModule {}
