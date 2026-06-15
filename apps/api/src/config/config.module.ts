import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import configuration from './configuration';
import { validationSchema } from './validation';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false, // Fail fast: show ALL missing variables on startup
      },
      expandVariables: true, // Allow ${VAR} interpolation in .env
    }),
  ],
})
export class AppConfigModule {}
