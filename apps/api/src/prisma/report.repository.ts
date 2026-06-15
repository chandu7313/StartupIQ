import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Report, ReportStatus, Prisma } from '@prisma/client';

export interface PaginatedReports {
  data: Report[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class ReportRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.ReportCreateInput): Promise<Report> {
    return this.prisma.report.create({ data });
  }

  async findById(id: string): Promise<Report | null> {
    return this.prisma.report.findFirst({
      where: { id, deletedAt: null },
      include: { idea: true },
    });
  }

  async findByUser(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedReports> {
    const where: Prisma.ReportWhereInput = { userId, deletedAt: null };
    const [data, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        include: { idea: { select: { name: true, industry: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.report.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async updateStatus(
    id: string,
    status: ReportStatus,
    extra?: Partial<Prisma.ReportUpdateInput>,
  ): Promise<Report> {
    return this.prisma.report.update({
      where: { id },
      data: { status, ...extra },
    });
  }

  async softDelete(id: string, userId: string): Promise<void> {
    await this.prisma.report.updateMany({
      where: { id, userId },
      data: { deletedAt: new Date() },
    });
  }

  async getMonthlyCount(userId: string): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    return this.prisma.report.count({
      where: {
        userId,
        createdAt: { gte: startOfMonth },
        deletedAt: null,
      },
    });
  }

  async findByIdeaHash(ideaHash: string): Promise<Report | null> {
    // Stored in idea metadata — look for a matching completed report
    return this.prisma.report.findFirst({
      where: {
        status: 'DONE',
        deletedAt: null,
        // idea hash stored as a JSON field in marketData for dedup
        marketData: { path: ['_ideaHash'], equals: ideaHash },
      },
    });
  }
}
