import { Module } from '@nestjs/common';
import { PrometheusModule, makeCounterProvider, makeHistogramProvider, makeGaugeProvider } from '@willsoto/nestjs-prometheus';
import { MetricsService } from './metrics.service';
import { MetricsInterceptor } from './metrics.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    PrometheusModule.register({
      path: '/metrics',
    }),
  ],
  providers: [
    MetricsService,
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
    makeCounterProvider({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
    }),
    makeHistogramProvider({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route'],
    }),
    makeCounterProvider({
      name: 'report_generation_total',
      help: 'Total number of report generation jobs',
      labelNames: ['status', 'plan', 'industry'],
    }),
    makeHistogramProvider({
      name: 'report_generation_duration_seconds',
      help: 'Duration of report generation jobs',
      labelNames: ['industry'],
    }),
    makeCounterProvider({
      name: 'ai_tokens_used_total',
      help: 'Total number of AI tokens used',
      labelNames: ['agent'],
    }),
    makeGaugeProvider({
      name: 'active_report_jobs',
      help: 'Number of currently active report generation jobs',
    }),
  ],
  exports: [MetricsService],
})
export class MetricsModule {}
