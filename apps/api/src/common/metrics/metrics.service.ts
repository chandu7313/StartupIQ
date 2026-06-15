import { Injectable } from '@nestjs/common';
import {
  InjectMetric,
  makeCounterProvider,
  makeGaugeProvider,
  makeHistogramProvider,
} from '@willsoto/nestjs-prometheus';
import { Counter, Gauge, Histogram } from 'prom-client';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

// ── Provider definitions (register in MetricsModule) ──────────────
export const metricsProviders = [
  makeHistogramProvider({
    name: 'report_generation_duration_seconds',
    help: 'Duration of AI report generation in seconds',
    labelNames: ['industry', 'plan'],
    buckets: [5, 10, 20, 30, 45, 60, 90, 120],
  }),
  makeCounterProvider({
    name: 'report_generation_total',
    help: 'Total number of report generation attempts',
    labelNames: ['status', 'plan'],
  }),
  makeCounterProvider({
    name: 'ai_tokens_used_total',
    help: 'Total AI tokens consumed by agent',
    labelNames: ['agent'],
  }),
  makeGaugeProvider({
    name: 'active_report_jobs',
    help: 'Number of active jobs in the report-generation BullMQ queue',
    labelNames: [],
  }),
  makeCounterProvider({
    name: 'http_requests_total',
    help: 'Total HTTP requests handled',
    labelNames: ['method', 'route', 'status_code'],
  }),
  makeCounterProvider({
    name: 'cache_hits_total',
    help: 'Total Redis cache hits',
    labelNames: ['key_type'],
  }),
  makeCounterProvider({
    name: 'cache_misses_total',
    help: 'Total Redis cache misses',
    labelNames: ['key_type'],
  }),
  makeCounterProvider({
    name: 'razorpay_payment_total',
    help: 'Total Razorpay payment events',
    labelNames: ['plan', 'status'],
  }),
];

// ── Service ────────────────────────────────────────────────────────
@Injectable()
export class MetricsService {
  constructor(
    @InjectMetric('report_generation_duration_seconds')
    private readonly reportDuration: Histogram<string>,

    @InjectMetric('report_generation_total')
    private readonly reportTotal: Counter<string>,

    @InjectMetric('ai_tokens_used_total')
    private readonly aiTokens: Counter<string>,

    @InjectMetric('active_report_jobs')
    private readonly activeJobs: Gauge<string>,

    @InjectMetric('http_requests_total')
    private readonly httpRequests: Counter<string>,

    @InjectMetric('cache_hits_total')
    private readonly cacheHits: Counter<string>,

    @InjectMetric('cache_misses_total')
    private readonly cacheMisses: Counter<string>,

    @InjectMetric('razorpay_payment_total')
    private readonly razorpayPayments: Counter<string>,

    @InjectQueue('report-generation')
    private readonly reportQueue: Queue,
  ) {}

  // ── Report generation ─────────────────────────────────────────
  observeReportDuration(durationSeconds: number, industry: string, plan: string) {
    this.reportDuration.observe({ industry, plan }, durationSeconds);
  }

  incrementReportTotal(status: 'success' | 'failed', plan: string) {
    this.reportTotal.inc({ status, plan });
  }

  // ── AI token tracking ─────────────────────────────────────────
  recordAgentTokens(agent: 'market' | 'competitor' | 'product' | 'vc', tokens: number) {
    this.aiTokens.inc({ agent }, tokens);
  }

  // ── Queue depth gauge ─────────────────────────────────────────
  async refreshQueueDepth() {
    const [active, waiting] = await Promise.all([
      this.reportQueue.getActiveCount(),
      this.reportQueue.getWaitingCount(),
    ]);
    this.activeJobs.set(active + waiting);
  }

  // ── HTTP metrics ──────────────────────────────────────────────
  incrementHttpRequest(method: string, route: string, statusCode: number) {
    this.httpRequests.inc({ method, route, status_code: String(statusCode) });
  }

  // ── Cache metrics ─────────────────────────────────────────────
  recordCacheHit(keyType: string) {
    this.cacheHits.inc({ key_type: keyType });
  }

  recordCacheMiss(keyType: string) {
    this.cacheMisses.inc({ key_type: keyType });
  }

  // ── Payments ──────────────────────────────────────────────────
  recordPayment(plan: string, status: 'success' | 'failed' | 'refunded') {
    this.razorpayPayments.inc({ plan, status });
  }
}
