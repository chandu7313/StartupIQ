import { Module, Global } from '@nestjs/common';
import { RedisService } from './redis.service';
import { HttpCacheInterceptor } from './http-cache.interceptor';

@Global()
@Module({
  providers: [RedisService, HttpCacheInterceptor],
  exports: [RedisService, HttpCacheInterceptor],
})
export class RedisModule {}
