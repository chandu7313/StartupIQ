"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsService = exports.metricsProviders = void 0;
var common_1 = require("@nestjs/common");
var nestjs_prometheus_1 = require("@willsoto/nestjs-prometheus");
var prom_client_1 = require("prom-client");
var bullmq_1 = require("@nestjs/bullmq");
var bullmq_2 = require("bullmq");
// ── Provider definitions (register in MetricsModule) ──────────────
exports.metricsProviders = [
    (0, nestjs_prometheus_1.makeHistogramProvider)({
        name: 'report_generation_duration_seconds',
        help: 'Duration of AI report generation in seconds',
        labelNames: ['industry', 'plan'],
        buckets: [5, 10, 20, 30, 45, 60, 90, 120],
    }),
    (0, nestjs_prometheus_1.makeCounterProvider)({
        name: 'report_generation_total',
        help: 'Total number of report generation attempts',
        labelNames: ['status', 'plan'],
    }),
    (0, nestjs_prometheus_1.makeCounterProvider)({
        name: 'ai_tokens_used_total',
        help: 'Total AI tokens consumed by agent',
        labelNames: ['agent'],
    }),
    (0, nestjs_prometheus_1.makeGaugeProvider)({
        name: 'active_report_jobs',
        help: 'Number of active jobs in the report-generation BullMQ queue',
        labelNames: [],
    }),
    (0, nestjs_prometheus_1.makeCounterProvider)({
        name: 'http_requests_total',
        help: 'Total HTTP requests handled',
        labelNames: ['method', 'route', 'status_code'],
    }),
    (0, nestjs_prometheus_1.makeCounterProvider)({
        name: 'cache_hits_total',
        help: 'Total Redis cache hits',
        labelNames: ['key_type'],
    }),
    (0, nestjs_prometheus_1.makeCounterProvider)({
        name: 'cache_misses_total',
        help: 'Total Redis cache misses',
        labelNames: ['key_type'],
    }),
    (0, nestjs_prometheus_1.makeCounterProvider)({
        name: 'razorpay_payment_total',
        help: 'Total Razorpay payment events',
        labelNames: ['plan', 'status'],
    }),
];
// ── Service ────────────────────────────────────────────────────────
var MetricsService = /** @class */ (function () {
    function MetricsService(reportDuration, reportTotal, aiTokens, activeJobs, httpRequests, cacheHits, cacheMisses, razorpayPayments, reportQueue) {
        this.reportDuration = reportDuration;
        this.reportTotal = reportTotal;
        this.aiTokens = aiTokens;
        this.activeJobs = activeJobs;
        this.httpRequests = httpRequests;
        this.cacheHits = cacheHits;
        this.cacheMisses = cacheMisses;
        this.razorpayPayments = razorpayPayments;
        this.reportQueue = reportQueue;
    }
    // ── Report generation ─────────────────────────────────────────
    MetricsService.prototype.observeReportDuration = function (durationSeconds, industry, plan) {
        this.reportDuration.observe({ industry: industry, plan: plan }, durationSeconds);
    };
    MetricsService.prototype.incrementReportTotal = function (status, plan) {
        this.reportTotal.inc({ status: status, plan: plan });
    };
    // ── AI token tracking ─────────────────────────────────────────
    MetricsService.prototype.recordAgentTokens = function (agent, tokens) {
        this.aiTokens.inc({ agent: agent }, tokens);
    };
    // ── Queue depth gauge ─────────────────────────────────────────
    MetricsService.prototype.refreshQueueDepth = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, active, waiting;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, Promise.all([
                            this.reportQueue.getActiveCount(),
                            this.reportQueue.getWaitingCount(),
                        ])];
                    case 1:
                        _a = _b.sent(), active = _a[0], waiting = _a[1];
                        this.activeJobs.set(active + waiting);
                        return [2 /*return*/];
                }
            });
        });
    };
    // ── HTTP metrics ──────────────────────────────────────────────
    MetricsService.prototype.incrementHttpRequest = function (method, route, statusCode) {
        this.httpRequests.inc({ method: method, route: route, status_code: String(statusCode) });
    };
    // ── Cache metrics ─────────────────────────────────────────────
    MetricsService.prototype.recordCacheHit = function (keyType) {
        this.cacheHits.inc({ key_type: keyType });
    };
    MetricsService.prototype.recordCacheMiss = function (keyType) {
        this.cacheMisses.inc({ key_type: keyType });
    };
    // ── Payments ──────────────────────────────────────────────────
    MetricsService.prototype.recordPayment = function (plan, status) {
        this.razorpayPayments.inc({ plan: plan, status: status });
    };
    var _a, _b, _c, _d, _e, _f, _g, _h;
    MetricsService = __decorate([
        (0, common_1.Injectable)(),
        __param(0, (0, nestjs_prometheus_1.InjectMetric)('report_generation_duration_seconds')),
        __param(1, (0, nestjs_prometheus_1.InjectMetric)('report_generation_total')),
        __param(2, (0, nestjs_prometheus_1.InjectMetric)('ai_tokens_used_total')),
        __param(3, (0, nestjs_prometheus_1.InjectMetric)('active_report_jobs')),
        __param(4, (0, nestjs_prometheus_1.InjectMetric)('http_requests_total')),
        __param(5, (0, nestjs_prometheus_1.InjectMetric)('cache_hits_total')),
        __param(6, (0, nestjs_prometheus_1.InjectMetric)('cache_misses_total')),
        __param(7, (0, nestjs_prometheus_1.InjectMetric)('razorpay_payment_total')),
        __param(8, (0, bullmq_1.InjectQueue)('report-generation')),
        __metadata("design:paramtypes", [typeof (_a = typeof prom_client_1.Histogram !== "undefined" && prom_client_1.Histogram) === "function" ? _a : Object, typeof (_b = typeof prom_client_1.Counter !== "undefined" && prom_client_1.Counter) === "function" ? _b : Object, typeof (_c = typeof prom_client_1.Counter !== "undefined" && prom_client_1.Counter) === "function" ? _c : Object, typeof (_d = typeof prom_client_1.Gauge !== "undefined" && prom_client_1.Gauge) === "function" ? _d : Object, typeof (_e = typeof prom_client_1.Counter !== "undefined" && prom_client_1.Counter) === "function" ? _e : Object, typeof (_f = typeof prom_client_1.Counter !== "undefined" && prom_client_1.Counter) === "function" ? _f : Object, typeof (_g = typeof prom_client_1.Counter !== "undefined" && prom_client_1.Counter) === "function" ? _g : Object, typeof (_h = typeof prom_client_1.Counter !== "undefined" && prom_client_1.Counter) === "function" ? _h : Object, bullmq_2.Queue])
    ], MetricsService);
    return MetricsService;
}());
exports.MetricsService = MetricsService;
