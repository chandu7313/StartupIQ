import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from './metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    
    const method = req.method;
    const route = req.route ? req.route.path : req.url;
    
    const startTime = process.hrtime();

    return next.handle().pipe(
      tap({
        next: () => {
          const diff = process.hrtime(startTime);
          const duration = diff[0] + diff[1] / 1e9;
          this.metricsService.recordHttpRequest(method, route, res.statusCode, duration);
        },
        error: (error) => {
          const diff = process.hrtime(startTime);
          const duration = diff[0] + diff[1] / 1e9;
          const status = error.status || 500;
          this.metricsService.recordHttpRequest(method, route, status, duration);
        }
      })
    );
  }
}
