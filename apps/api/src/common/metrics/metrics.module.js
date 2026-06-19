"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsModule = void 0;
var common_1 = require("@nestjs/common");
var nestjs_prometheus_1 = require("@willsoto/nestjs-prometheus");
var metrics_service_1 = require("./metrics.service");
var bullmq_1 = require("@nestjs/bullmq");
var MetricsModule = /** @class */ (function () {
    function MetricsModule() {
    }
    MetricsModule = __decorate([
        (0, common_1.Global)(),
        (0, common_1.Module)({
            imports: [
                nestjs_prometheus_1.PrometheusModule.register({
                    path: '/metrics',
                    defaultMetrics: { enabled: true },
                }),
                bullmq_1.BullModule.registerQueue({ name: 'report-generation' }),
            ],
            providers: __spreadArray(__spreadArray([], metrics_service_1.metricsProviders, true), [metrics_service_1.MetricsService], false),
            exports: [metrics_service_1.MetricsService],
        })
    ], MetricsModule);
    return MetricsModule;
}());
exports.MetricsModule = MetricsModule;
