import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { IoAdapter } from '@nestjs/platform-socket.io';
import helmet from 'helmet';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // ── WebSocket Adapter (Socket.IO) ───────────────────────────────────
  app.useWebSocketAdapter(new IoAdapter(app));

  // ── CORS (must be BEFORE helmet) ────────────────────────────────────
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-razorpay-signature'],
  });

  // ── Security ───────────────────────────────────────────────────────────
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],  // Required for Bull Board UI
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
    }),
  );

  // ── Global Pipes, Filters, Interceptors ────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,           // Strip unknown properties
      forbidNonWhitelisted: true,
      stopAtFirstError: false,
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // ── Swagger API Documentation ──────────────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle('VentureForge AI — Backend API')
    .setDescription(
      'Multi-agent AI startup validator for Indian founders. ' +
      'Authenticate with a Clerk JWT Bearer token.',
    )
    .setVersion('1.0')
    .addServer('/api/v1', 'V1 Endpoints')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .addTag('Reports', 'AI-powered startup validation reports')
    .addTag('Ideas', 'Startup idea management')
    .addTag('Users', 'User profile and plan management')
    .addTag('Payments', 'Razorpay payments and webhooks')
    .addTag('Analytics', 'Usage metrics')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  // ── Graceful Shutdown ─────────────────────────────────────────────────
  app.enableShutdownHooks();

  // ── Start Server ──────────────────────────────────────────────────────
  const port = parseInt(process.env.PORT ?? '3001');
  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 API running on http://localhost:${port}`);
  logger.log(`📖 Swagger docs at http://localhost:${port}/api/docs`);
  logger.log(`🐂 Bull Board at http://localhost:${port}/admin/queues`);
}

bootstrap();
