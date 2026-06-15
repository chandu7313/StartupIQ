import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Idea, Prisma } from '@prisma/client';

@Injectable()
export class IdeaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.IdeaCreateInput): Promise<Idea> {
    return this.prisma.idea.create({ data });
  }

  async findById(id: string): Promise<Idea | null> {
    return this.prisma.idea.findUnique({ where: { id } });
  }

  async findManyByUser(
    userId: string,
    opts: { skip?: number; take?: number } = {},
  ): Promise<Idea[]> {
    return this.prisma.idea.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: opts.skip ?? 0,
      take: opts.take ?? 20,
    });
  }

  async countByUser(userId: string): Promise<number> {
    return this.prisma.idea.count({ where: { userId } });
  }

  async update(id: string, data: Prisma.IdeaUpdateInput): Promise<Idea> {
    return this.prisma.idea.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.idea.delete({ where: { id } });
  }
}
