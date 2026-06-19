import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  private razorpay: any;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.razorpay = new Razorpay({
      key_id: this.configService.get<string>('RAZORPAY_KEY_ID'),
      key_secret: this.configService.get<string>('RAZORPAY_KEY_SECRET'),
    });
  }

  async createOrder(userId: string, amount: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    const options = {
      amount: amount * 100, // amount in smallest currency unit
      currency: "INR",
      receipt: `receipt_${user.id}`,
    };

    return this.razorpay.orders.create(options);
  }

  verifySignature(orderId: string, paymentId: string, signature: string) {
    const text = orderId + "|" + paymentId;
    const secret = this.configService.get<string>('RAZORPAY_KEY_SECRET');
    
    const expectedSignature = crypto.createHmac('sha256', secret).update(text).digest('hex');
    
    return expectedSignature === signature;
  }

  async handleWebhook(body: any, signature: string) {
    const secret = this.configService.get<string>('RAZORPAY_WEBHOOK_SECRET');
    const expectedSignature = crypto.createHmac('sha256', secret).update(JSON.stringify(body)).digest('hex');

    if (expectedSignature !== signature) {
      throw new BadRequestException('Invalid webhook signature');
    }

    // Process webhook event e.g., payment.captured -> upgrade plan
    const event = body.event;
    if (event === 'payment.captured') {
      const email = body.payload.payment.entity.email; // assuming email is passed
      if (email) {
        await this.prisma.user.update({
          where: { email },
          data: { plan: 'PRO' },
        });
      }
    }
    return { status: 'ok' };
  }
}
