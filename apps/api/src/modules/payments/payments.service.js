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
exports.PaymentsService = void 0;
var common_1 = require("@nestjs/common");
var config_1 = require("@nestjs/config");
var Razorpay = require("razorpay");
var crypto = require("crypto");
var prisma_service_1 = require("../../prisma/prisma.service");
var PaymentsService = /** @class */ (function () {
    function PaymentsService(configService, prisma) {
        this.configService = configService;
        this.prisma = prisma;
        this.razorpay = new Razorpay({
            key_id: this.configService.get('RAZORPAY_KEY_ID'),
            key_secret: this.configService.get('RAZORPAY_KEY_SECRET'),
        });
    }
    PaymentsService.prototype.createOrder = function (userId, amount) {
        return __awaiter(this, void 0, void 0, function () {
            var user, options;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.user.findUnique({ where: { id: userId } })];
                    case 1:
                        user = _a.sent();
                        if (!user)
                            throw new common_1.BadRequestException('User not found');
                        options = {
                            amount: amount * 100, // amount in smallest currency unit
                            currency: "INR",
                            receipt: "receipt_".concat(user.id),
                        };
                        return [2 /*return*/, this.razorpay.orders.create(options)];
                }
            });
        });
    };
    PaymentsService.prototype.verifySignature = function (orderId, paymentId, signature) {
        var text = orderId + "|" + paymentId;
        var secret = this.configService.get('RAZORPAY_KEY_SECRET');
        var expectedSignature = crypto.createHmac('sha256', secret).update(text).digest('hex');
        return expectedSignature === signature;
    };
    PaymentsService.prototype.handleWebhook = function (body, signature) {
        return __awaiter(this, void 0, void 0, function () {
            var secret, expectedSignature, event, email;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        secret = this.configService.get('RAZORPAY_WEBHOOK_SECRET');
                        expectedSignature = crypto.createHmac('sha256', secret).update(JSON.stringify(body)).digest('hex');
                        if (expectedSignature !== signature) {
                            throw new common_1.BadRequestException('Invalid webhook signature');
                        }
                        event = body.event;
                        if (!(event === 'payment.captured')) return [3 /*break*/, 2];
                        email = body.payload.payment.entity.email;
                        if (!email) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.prisma.user.update({
                                where: { email: email },
                                data: { plan: 'PRO' },
                            })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/, { status: 'ok' }];
                }
            });
        });
    };
    PaymentsService = __decorate([
        (0, common_1.Injectable)(),
        __metadata("design:paramtypes", [config_1.ConfigService,
            prisma_service_1.PrismaService])
    ], PaymentsService);
    return PaymentsService;
}());
exports.PaymentsService = PaymentsService;
