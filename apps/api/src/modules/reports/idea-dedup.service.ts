import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { RedisService, CacheKeys, CacheTTL } from '../../common/redis/redis.service';
import { ReportRepository } from '../../prisma/report.repository';
import { Report } from '@prisma/client';

export interface IdeaHashInput {
  description: string;
  industry: string;
  geography: string;
  stage: string;
}

@Injectable()
export class IdeaDedupService {
  private readonly logger = new Logger(IdeaDedupService.name);

  constructor(
    private readonly redis: RedisService,
    private readonly reports: ReportRepository,
  ) {}

  /** Deterministic SHA-256 hash of idea inputs */
  computeHash(input: IdeaHashInput): string {
    const normalized = JSON.stringify({
      description: input.description.trim().toLowerCase(),
      industry: input.industry,
      geography: input.geography,
      stage: input.stage,
    });
    return crypto.createHash('sha256').update(normalized).digest('hex');
  }

  /** Check Redis first, then DB, for an identical completed report */
  async findDuplicate(hash: string): Promise<string | null> {
    const cacheKey = CacheKeys.ideaDedup(hash);
    const cached = await this.redis.get<{ reportId: string }>(cacheKey);

    if (cached) {
      this.logger.log(`[IdeaDedup] Cache HIT for hash ${hash.slice(0, 12)}...`);
      return cached.reportId;
    }

    // Fallback to DB lookup
    const report = await this.reports.findByIdeaHash(hash);
    if (report) {
      // Repopulate cache for next time
      await this.redis.set(cacheKey, { reportId: report.id }, CacheTTL.IDEA_DEDUP);
      this.logger.log(`[IdeaDedup] DB HIT for hash ${hash.slice(0, 12)}... → ${report.id}`);
      return report.id;
    }

    return null;
  }

  /** Store the hash → reportId mapping after successful generation */
  async storeHash(hash: string, reportId: string): Promise<void> {
    const cacheKey = CacheKeys.ideaDedup(hash);
    await this.redis.set(cacheKey, { reportId }, CacheTTL.IDEA_DEDUP);
    this.logger.log(`[IdeaDedup] Stored hash ${hash.slice(0, 12)}... → ${reportId}`);
  }
}
