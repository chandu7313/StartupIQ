import { Injectable, Logger } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService {
  private readonly client: RedisClientType;
  private readonly logger = new Logger(RedisService.name);

  constructor(private readonly config: ConfigService) {
    this.client = createClient({
      url: `redis://${this.config.get('REDIS_HOST')}:${this.config.get('REDIS_PORT')}`,
      socket: { reconnectStrategy: (retries) => Math.min(retries * 50, 2000) },
    }) as RedisClientType;

    this.client.on('error', (err) => this.logger.error('Redis error', err));
    this.client.connect().then(() => this.logger.log('✅ Redis connected'));
  }

  /** Get and JSON-parse a cached value. Falls back gracefully on error. */
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await this.client.get(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch (err) {
      this.logger.warn(`Redis GET failed for key "${key}": ${(err as Error).message}`);
      return null;
    }
  }

  /** JSON-stringify and set with optional TTL in seconds. */
  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    try {
      const payload = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.setEx(key, ttlSeconds, payload);
      } else {
        await this.client.set(key, payload);
      }
    } catch (err) {
      this.logger.warn(`Redis SET failed for key "${key}": ${(err as Error).message}`);
    }
  }

  /** Delete one or more keys. */
  async del(...keys: string[]): Promise<void> {
    try {
      await this.client.del(keys);
    } catch (err) {
      this.logger.warn(`Redis DEL failed: ${(err as Error).message}`);
    }
  }

  /** Atomically increment a counter. Returns the new value. */
  async incr(key: string): Promise<number> {
    try {
      return await this.client.incr(key);
    } catch (err) {
      this.logger.warn(`Redis INCR failed for key "${key}": ${(err as Error).message}`);
      return 0;
    }
  }

  /** Set key TTL (expiry) in seconds. */
  async expire(key: string, seconds: number): Promise<void> {
    try {
      await this.client.expire(key, seconds);
    } catch (err) {
      this.logger.warn(`Redis EXPIRE failed for key "${key}": ${(err as Error).message}`);
    }
  }

  /** Helper: returns seconds remaining until end of current UTC month. */
  static ttlUntilEndOfMonth(): number {
    const now = new Date();
    const endOfMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0),
    );
    return Math.floor((endOfMonth.getTime() - now.getTime()) / 1000);
  }
}

/** Canonical cache key builders — single source of truth */
export const CacheKeys = {
  report: (reportId: string) => `report:${reportId}`,
  userReportCount: (userId: string) => `user:${userId}:report-count`,
  ideaDedup: (hash: string) => `idea:${hash}:report`,
  userPlan: (userId: string) => `user:${userId}:plan`,
};

/** Cache TTLs in seconds */
export const CacheTTL = {
  REPORT: 60 * 60 * 24,      // 24 hours
  IDEA_DEDUP: 60 * 60 * 24 * 7, // 7 days
  USER_PLAN: 60 * 60,         // 1 hour
};
