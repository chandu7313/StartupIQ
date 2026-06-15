import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

const ADMIN_TOKENS = (process.env.ADMIN_TOKENS ?? '').split(',').filter(Boolean);

/**
 * Guards the Bull Board admin UI at /admin/queues.
 * Expects an `Authorization: Bearer <ADMIN_TOKEN>` header
 * matching any token in the ADMIN_TOKENS env variable.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const authHeader = req.headers['authorization'] ?? '';
    const token = authHeader.replace('Bearer ', '').trim();

    if (!token || !ADMIN_TOKENS.includes(token)) {
      throw new UnauthorizedException('Invalid or missing admin token');
    }

    return true;
  }
}
