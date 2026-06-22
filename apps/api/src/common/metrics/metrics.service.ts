import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram, Gauge } from 'prom-client';

@Injectable()
export class MetricsService {
  constructor(
    @InjectMetric('http_requests_total')
    public readonly httpRequestsTotal: Counter<string>,
    
    @InjectMetric('http_request_duration_seconds')
    public readonly httpRequestDurationSeconds: Histogram<string>,
    
    @InjectMetric('report_generation_total')
    public readonly reportGenerationTotal: Counter<string>,
    
    @InjectMetric('report_generation_duration_seconds')
    public readonly reportGenerationDurationSeconds: Histogram<string>,
    
    @InjectMetric('ai_tokens_used_total')
    public readonly aiTokensUsedTotal: Counter<string>,
    
    @InjectMetric('active_report_jobs')
    public readonly activeReportJobs: Gauge<string>,
  ) {}

  recordHttpRequest(method: string, route: string, statusCode: number, duration: number) {
    this.httpRequestsTotal.inc({ method, route, status_code: statusCode.toString() });
    this.httpRequestDurationSeconds.observe({ method, route }, duration);
  }

  recordReportGeneration(status: 'success' | 'failed', plan: string, industry: string, duration?: number) {
    this.reportGenerationTotal.inc({ status, plan, industry });
    if (duration !== undefined) {
      this.reportGenerationDurationSeconds.observe({ industry }, duration);
    }
  }

  recordAiTokens(agent: string, tokens: number) {
    this.aiTokensUsedTotal.inc({ agent }, tokens);
  }

  updateActiveReportJobs(count: number) {
    this.activeReportJobs.set(count);
  }
}
