"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingInterceptor = void 0;
var common_1 = require("@nestjs/common");
var operators_1 = require("rxjs/operators");
var LoggingInterceptor = /** @class */ (function () {
    function LoggingInterceptor() {
        this.logger = new common_1.Logger(LoggingInterceptor_1.name);
    }
    LoggingInterceptor_1 = LoggingInterceptor;
    LoggingInterceptor.prototype.intercept = function (context, next) {
        var _this = this;
        var request = context.switchToHttp().getRequest();
        var method = request.method;
        var url = request.url;
        var now = Date.now();
        return next
            .handle()
            .pipe((0, operators_1.tap)(function () { return _this.logger.log("".concat(method, " ").concat(url, " ").concat(Date.now() - now, "ms")); }));
    };
    var LoggingInterceptor_1;
    LoggingInterceptor = LoggingInterceptor_1 = __decorate([
        (0, common_1.Injectable)()
    ], LoggingInterceptor);
    return LoggingInterceptor;
}());
exports.LoggingInterceptor = LoggingInterceptor;
