import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  PORT: Joi.number().default(3001),

  // Database
  DATABASE_URL: Joi.string().uri().required(),

  // Redis
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),

  // Clerk
  CLERK_SECRET_KEY: Joi.string().required(),

  // Frontend / CORS
  FRONTEND_URL: Joi.string().uri().required(),

  // Razorpay
  RAZORPAY_KEY_ID: Joi.string().required(),
  RAZORPAY_KEY_SECRET: Joi.string().required(),
  RAZORPAY_WEBHOOK_SECRET: Joi.string().required(),

  // Anthropic
  ANTHROPIC_API_KEY: Joi.string().required(),

  // Admin (Bull Board protection — comma-separated tokens)
  ADMIN_TOKENS: Joi.string().default(''),

  // Environment
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
});
