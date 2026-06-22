import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';


@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prisma: PrismaService) {}

  async getCurrentUser(userId: string) {
    let user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: { reports: true, ideas: true }
        }
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, data: any) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  async getCredits(userId: string): Promise<number> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    return user?.credits || 0;
  }

  async hasEnoughCredits(userId: string, amount: number = 100): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return false;

    return user.credits >= amount;
  }

  async deductCredits(userId: string, amount: number): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: amount } }
    });
  }

  async addCredits(userId: string, amount: number): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { credits: { increment: amount } }
    });
  }
}
