import { Controller, Post, Body, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IdeasService } from './ideas.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { LoggingInterceptor } from '../../common/interceptors/logging.interceptor';
import { IsString, IsOptional } from 'class-validator';

export class CreateIdeaDto {
  @IsString() name: string;
  @IsString() description: string;
  @IsString() @IsOptional() targetAudience?: string;
  @IsString() @IsOptional() monetization?: string;
}

@ApiTags('Ideas')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@UseInterceptors(LoggingInterceptor)
@Controller('api/v1/ideas')
export class IdeasController {
  constructor(private readonly ideasService: IdeasService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new startup idea' })
  async createIdea(@CurrentUser() userId: string, @Body() data: CreateIdeaDto) {
    return this.ideasService.createIdea(userId, data);
  }
}
