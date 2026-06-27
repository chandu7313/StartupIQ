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
import { PdfService } from './pdf.service';
import { AuthGuard } from '../../common/guards/auth.guard';

import { HttpCacheInterceptor } from '../../common/redis/http-cache.interceptor';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
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
  @IsString() @IsOptional() language?: string;
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
    private readonly pdfService: PdfService,
  ) {}

  // ─────────────────────────────────────────────────
  // POST /api/v1/reports/generate
  // ─────────────────────────────────────────────────
  @Post('generate')

  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Trigger AI report generation (queues a background job)' })
  @ApiResponse({ status: 202, description: 'Job accepted' })
  @ApiResponse({ status: 402, description: 'Plan limit reached' })
  async generateReport(
    @CurrentUser() userId: string,
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
    const { report, jobId } = await this.reportsService.initiateGeneration(
      userId,
      dto,
      ideaHash,
    );

    // The comprehensive background job is removed.
    // Sections will be generated on-demand by the user via /generate-section.

    return {
      cached: false,
      reportId: report.id,
      message: 'Overview generated successfully.',
    };
  }

  // ─────────────────────────────────────────────────
  // POST /api/v1/reports/:id/generate/:section
  // ─────────────────────────────────────────────────
  @Post(':id/generate/:section')
  @ApiOperation({ summary: 'Generate a specific section of the report on-demand' })
  async generateSection(
    @CurrentUser() userId: string,
    @Param('id') id: string,
    @Param('section') section: string,
  ) {
    return this.reportsService.generateSection(userId, id, section);
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
    @CurrentUser() userId: string,
    @Query() query: PaginationDto,
  ) {
    return this.reportsService.getUserReports(userId, query.page, query.limit);
  }

  // ─────────────────────────────────────────────────
  // GET /api/v1/reports/compare?reportAId=...&reportBId=...
  // ─────────────────────────────────────────────────
  // ─────────────────────────────────────────────────
  @Get('compare')

  @ApiOperation({ summary: 'Compare two reports side-by-side with AI analysis' })
  @ApiQuery({ name: 'reportAId', required: true })
  @ApiQuery({ name: 'reportBId', required: true })
  async compareReports(
    @CurrentUser() userId: string,
    @Query('reportAId') reportAId: string,
    @Query('reportBId') reportBId: string,
  ) {
    if (!reportAId || !reportBId) throw new BadRequestException('Both reportAId and reportBId are required');
    if (reportAId === reportBId) throw new BadRequestException('Report IDs must be different');
    return this.reportsService.compareReports(userId, reportAId, reportBId);
  }

  // ─────────────────────────────────────────────────
  // POST /api/v1/reports/:id/share
  // ─────────────────────────────────────────────────
  // ─────────────────────────────────────────────────
  @Post(':id/share')

  @ApiOperation({ summary: 'Generate public share link for a report' })
  @ApiParam({ name: 'id', description: 'Report CUID' })
  async shareReport(
    @CurrentUser() userId: string,
    @Param('id') id: string,
  ) {
    return this.reportsService.shareReport(userId, id);
  }

  // ─────────────────────────────────────────────────
  // DELETE /api/v1/reports/:id/share
  // ─────────────────────────────────────────────────
  // ─────────────────────────────────────────────────
  @Delete(':id/share')

  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke public share link for a report' })
  @ApiParam({ name: 'id', description: 'Report CUID' })
  async unshareReport(
    @CurrentUser() userId: string,
    @Param('id') id: string,
  ) {
    await this.reportsService.unshareReport(userId, id);
  }

  // ─────────────────────────────────────────────────
  // GET /api/v1/reports/public/:token
  // ─────────────────────────────────────────────────
  @Get('public/:token')
  @UseInterceptors(HttpCacheInterceptor) // Cache public requests
  // NOTE: Apply ThrottlerGuard (rate limiting) here in production
  @ApiOperation({ summary: 'Fetch a public report using its share token' })
  @ApiParam({ name: 'token', description: 'nanoid share token' })
  async getPublicReport(@Param('token') token: string) {
    return this.reportsService.getPublicReport(token);
  }

  // ─────────────────────────────────────────────────
  // GET /api/v1/reports/:id
  // ─────────────────────────────────────────────────
  @Get(':id')
  @ApiOperation({ summary: 'Get report by ID (Redis cache → DB)' })
  @ApiParam({ name: 'id', description: 'Report CUID' })
  async getReport(
    @CurrentUser() userId: string,
    @Param('id') id: string,
  ) {
    const report = await this.reportsService.getReportById(userId, id);
    if (!report) throw new NotFoundException(`Report ${id} not found`);
    return report;
  }

  // ─────────────────────────────────────────────────
  // GET /api/v1/reports/:id/pdf
  // ─────────────────────────────────────────────────
  // ─────────────────────────────────────────────────
  @Get(':id/pdf')

  @ApiOperation({ summary: 'Generate and get PDF export link for a report' })
  @ApiParam({ name: 'id', description: 'Report CUID' })
  async getReportPdf(
    @CurrentUser() userId: string,
    @Param('id') id: string,
  ) {
    const report = await this.reportsService.getReportById(userId, id);
    if (!report) throw new NotFoundException(`Report ${id} not found`);
    if (report.status !== 'DONE') throw new BadRequestException(`Report is not yet generated. Current status: ${report.status}`);

    const userPlan = (report as any).user?.plan || 'FREE';
    
    // In a real app, we might handle watermarking here based on userPlan.
    // E.g., if userPlan === 'FREE', pass { watermark: true } to PdfService.

    const url = await this.pdfService.generatePDF(report, report.idea);
    return { url, expiresIn: 3600 };
  }

  // ─────────────────────────────────────────────────
  // DELETE /api/v1/reports/:id
  // ─────────────────────────────────────────────────
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete a report' })
  async deleteReport(
    @CurrentUser() userId: string,
    @Param('id') id: string,
  ) {
    await this.reportsService.softDeleteReport(userId, id);
  }

  // ─────────────────────────────────────────────────
  // GET /api/v1/reports/:id/pitch-deck
  // ─────────────────────────────────────────────────
  @Get(':id/pitch-deck')

  @ApiOperation({ summary: 'Generate pitch deck for a report (Premium)' })
  @ApiParam({ name: 'id', description: 'Report CUID' })
  async getPitchDeck(
    @CurrentUser() userId: string,
    @Param('id') id: string,
  ) {
    return { message: 'Pitch deck generation is a premium feature. Coming soon!' };
  }
}
