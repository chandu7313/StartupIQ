import { Controller, Post, Body, Headers, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Payments')
@Controller('api/v1/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('order')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Create Razorpay order' })
  async createOrder(@CurrentUser() userId: string, @Body() data: { amount: number }) {
    return this.paymentsService.createOrder(userId, data.amount);
  }

  @Post('verify')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Verify payment signature' })
  async verifyPayment(@Body() data: { orderId: string; paymentId: string; signature: string }) {
    const isValid = this.paymentsService.verifySignature(data.orderId, data.paymentId, data.signature);
    if (!isValid) throw new BadRequestException('Invalid signature');
    return { success: true };
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Razorpay webhook handler' })
  async webhook(@Body() body: any, @Headers('x-razorpay-signature') signature: string) {
    return this.paymentsService.handleWebhook(body, signature);
  }
}
