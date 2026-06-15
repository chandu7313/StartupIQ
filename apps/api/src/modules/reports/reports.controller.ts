import {
  Controller, Post, Get, Delete, Body, Param, Query,
  UseGuards, UseInterceptors, HttpCode, HttpStatus,
  NotFoundException, ForbiddenException, BadRequestException,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
  ApiQuery, ApiParam,
} from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ReportsService } from './reports.service';
import { ReportProducer } from './report.producer';
import { IdeaDedupService } from './idea-dedup.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { PlanGuard } from '../../common/guards/plan.guard';
import { HttpCacheInterceptor } from '../../common/redis/http-cache.interceptor';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequiresPlan } from '../../common/decorators/requires-plan.decorator';
import { LoggingInterceptor } from '../../common/interceptors/logging.interceptor';
import { Plan } from '@prisma/client';

export class GenerateReportDto {
  @IsString() ideaId: string;
  @IsString() ideaDescription: string;
  @IsString() industry: string;
  @IsString() @IsOptional() geography?: string;
  @IsString() @IsOptional() stage?: string;
  @IsNumber() @IsOptional() @Type(() => Number) teamSize?: number;
  @IsString() @IsOptional() budget?: string;
}

export class PaginationDto {
  @IsOptional() @Type(() => Number) @IsNumber() @Min(1) page?: number = 1;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(1) @Max(50) limit?: number = 10;
}

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@UseInterceptors(LoggingInterceptor)
@Controller('api/v1/reports')
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly producer: ReportProducer,
    private readonly dedup: IdeaDedupService,
  ) {}

  // ─────────────────────────────────────────────────
  // POST /api/v1/reports/generate
  // ─────────────────────────────────────────────────
  @Post('generate')
  @UseGuards(PlanGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Trigger AI report generation (queues a background job)' })
  @ApiResponse({ status: 202, description: 'Job accepted' })
  @ApiResponse({ status: 402, description: 'Plan limit reached' })
  async generateReport(
    @CurrentUser() user: { clerkUserId: string },
    @Body() dto: GenerateReportDto,
  ) {
    // 1. Deduplication check — return cached report if same idea already analyzed
    const ideaHash = this.dedup.computeHash({
      description: dto.ideaDescription,
      industry: dto.industry,
      geography: dto.geography ?? 'PAN_INDIA',
      stage: dto.stage ?? 'idea',
    });

    const existingReportId = await this.dedup.findDuplicate(ideaHash);
    if (existingReportId) {
      return {
        cached: true,
        reportId: existingReportId,
        message: 'Identical idea found — returning existing report.',
      };
    }

    // 2. Create the report record + queue the job
    const { report, jobId, userPlan } = await this.reportsService.initiateGeneration(
      user.clerkUserId,
      dto,
      ideaHash,
    );

    // 3. Enqueue with plan-based priority
    await this.producer.addJob({
      reportId: report.id,
      ideaId: dto.ideaId,
      ideaDescription: dto.ideaDescription,
      industry: dto.industry,
      geography: dto.geography ?? 'PAN_INDIA',
      stage: dto.stage ?? 'idea',
      teamSize: dto.teamSize ?? 1,
      budget: dto.budget ?? '< ₹5L',
      userPlan: userPlan as Plan,
    });

    return {
      cached: false,
      reportId: report.id,
      message: 'Report generation queued.',
    };
  }

  // ─────────────────────────────────────────────────
  // GET /api/v1/reports
  // ─────────────────────────────────────────────────
  @Get()
  @UseInterceptors(HttpCacheInterceptor)
  @ApiOperation({ summary: 'Get paginated list of user reports' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getUserReports(
    @CurrentUser() user: { clerkUserId: string },
    @Query() query: PaginationDto,
  ) {
    return this.reportsService.getUserReports(user.clerkUserId, query.page, query.limit);
  }

  // ─────────────────────────────────────────────────
  // GET /api/v1/reports/compare?id1=...&id2=...
  // ─────────────────────────────────────────────────
  @Get('compare')
  @ApiOperation({ summary: 'Compare two reports side-by-side' })
  @ApiQuery({ name: 'id1', required: true })
  @ApiQuery({ name: 'id2', required: true })
  async compareReports(
    @CurrentUser() user: { clerkUserId: string },
    @Query('id1') id1: string,
    @Query('id2') id2: string,
  ) {
    if (!id1 || !id2) throw new BadRequestException('Both id1 and id2 are required');
    if (id1 === id2) throw new BadRequestException('Report IDs must be different');
    return this.reportsService.compareReports(user.clerkUserId, id1, id2);
  }

  // ─────────────────────────────────────────────────
  // GET /api/v1/reports/:id
  // ─────────────────────────────────────────────────
  @Get(':id')
  @ApiOperation({ summary: 'Get report by ID (Redis cache → DB)' })
  @ApiParam({ name: 'id', description: 'Report CUID' })
  async getReport(
    @CurrentUser() user: { clerkUserId: string },
    @Param('id') id: string,
  ) {
    const report = await this.reportsService.getReportById(user.clerkUserId, id);
    if (!report) throw new NotFoundException(`Report ${id} not found`);
    return report;
  }

  // ─────────────────────────────────────────────────
  // DELETE /api/v1/reports/:id
  // ─────────────────────────────────────────────────
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete a report' })
  async deleteReport(
    @CurrentUser() user: { clerkUserId: string },
    @Param('id') id: string,
  ) {
    await this.reportsService.softDeleteReport(user.clerkUserId, id);
  }
}
