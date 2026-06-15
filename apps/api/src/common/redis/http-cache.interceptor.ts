import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RedisService } from './redis.service';

const CACHE_TTL = 60 * 5; // 5 minute default for GET routes

@Injectable()
export class HttpCacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(HttpCacheInterceptor.name);

  constructor(private readonly redis: RedisService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();

    // Only cache GET requests
    if (request.method !== 'GET') return next.handle();

    const userId = request.user?.clerkUserId ?? 'anon';
    const cacheKey = `http:${userId}:${request.url}`;

    const cached = await this.redis.get<unknown>(cacheKey);
    if (cached !== null) {
      this.logger.debug(`Cache HIT — ${cacheKey}`);
      return of(cached);
    }

    return next.handle().pipe(
      tap(async (response) => {
        if (response !== null && response !== undefined) {
          await this.redis.set(cacheKey, response, CACHE_TTL);
          this.logger.debug(`Cache SET — ${cacheKey}`);
        }
      }),
    );
  }
}
