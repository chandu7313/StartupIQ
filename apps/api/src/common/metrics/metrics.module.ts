import { Global, Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { MetricsService, metricsProviders } from './metrics.service';
import { BullModule } from '@nestjs/bullmq';

@Global()
@Module({
  imports: [
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: { enabled: true },
    }),
    BullModule.registerQueue({ name: 'report-generation' }),
  ],
  providers: [...metricsProviders, MetricsService],
  exports: [MetricsService],
})
export class MetricsModule {}
