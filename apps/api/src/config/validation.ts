import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3001),
  APP_URL: Joi.string().uri().required(),
  CORS_ORIGINS: Joi.string().required(),

  DATABASE_URL: Joi.string().uri().required(),
  DATABASE_POOL_MIN: Joi.number().default(2),
  DATABASE_POOL_MAX: Joi.number().default(10),

  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_TTL_REPORT: Joi.number().default(86400),
  REDIS_TTL_USER: Joi.number().default(3600),
  REDIS_TTL_IDEA_DEDUP: Joi.number().default(604800),

  CLERK_SECRET_KEY: Joi.string().required(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: Joi.string().required(),
  CLERK_WEBHOOK_SECRET: Joi.string().optional(), // Optional for dev

  ANTHROPIC_API_KEY: Joi.string().required(),
  ANTHROPIC_MODEL: Joi.string().default('claude-sonnet-4-5'),
  ANTHROPIC_MAX_TOKENS: Joi.number().default(3072),
  ANTHROPIC_TIMEOUT_MS: Joi.number().default(120000),

  RAZORPAY_KEY_ID: Joi.string().required(),
  RAZORPAY_KEY_SECRET: Joi.string().required(),
  RAZORPAY_WEBHOOK_SECRET: Joi.string().optional(),
  RAZORPAY_PRO_PRICE_PAISE: Joi.number().default(49900),
  RAZORPAY_PREMIUM_PRICE_PAISE: Joi.number().default(149900),

  AWS_REGION: Joi.string().default('ap-south-1'),
  AWS_ACCESS_KEY_ID: Joi.string().optional(),
  AWS_SECRET_ACCESS_KEY: Joi.string().optional(),
  S3_BUCKET_NAME: Joi.string().required(),
  S3_PRESIGNED_URL_EXPIRES: Joi.number().default(3600),

  PROMETHEUS_PORT: Joi.number().default(9090),
  LOKI_URL: Joi.string().uri().optional(),
  SLACK_WEBHOOK_URL: Joi.string().uri().optional(),

  ADMIN_TOKENS: Joi.string().allow('').default(''),
  BULL_BOARD_ENABLED: Joi.boolean().default(true),
});
