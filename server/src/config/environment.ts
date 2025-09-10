import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Environment validation schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('5000'),
  MONGODB_URI: z.string().min(1, 'MongoDB URI is required'),
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  COOKIE_SECRET: z.string().min(32, 'Cookie secret must be at least 32 characters'),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  UPLOAD_DIR: z.string().default('./uploads'),
  MAX_FILE_SIZE: z.string().transform(Number).default('10485760'),
  PDF_OUTPUT_DIR: z.string().default('./uploads/reports'),
  ALLOWED_IMAGE_TYPES: z.string().default('image/jpeg,image/png,image/jpg'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
});

// Validate environment variables
const validateEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      console.error('❌ Invalid environment variables:');
      missingVars.forEach(msg => console.error(`  - ${msg}`));
      console.error('\n📋 Please check your .env file and ensure all required variables are set.');
      process.exit(1);
    }
    throw error;
  }
};

export const config = validateEnv();

export const isDevelopment = config.NODE_ENV === 'development';
export const isProduction = config.NODE_ENV === 'production';
export const isTest = config.NODE_ENV === 'test';