import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { IdeaRepository } from './idea.repository';
import { ReportRepository } from './report.repository';

@Global()
@Module({
  providers: [PrismaService, IdeaRepository, ReportRepository],
  exports: [PrismaService, IdeaRepository, ReportRepository],
})
export class PrismaModule {}
