"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTest = exports.isProduction = exports.isDevelopment = exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.string().default('5000').transform(Number),
    MONGODB_URI: zod_1.z.string().min(1, 'MongoDB URI is required'),
    JWT_SECRET: zod_1.z.string().min(32, 'JWT secret must be at least 32 characters'),
    JWT_EXPIRES_IN: zod_1.z.string().default('7d'),
    COOKIE_SECRET: zod_1.z.string().min(32, 'Cookie secret must be at least 32 characters'),
    CLIENT_URL: zod_1.z.string().url().default('http://localhost:5173'),
    UPLOAD_DIR: zod_1.z.string().default('./uploads'),
    MAX_FILE_SIZE: zod_1.z.string().default('10485760').transform(Number),
    PDF_OUTPUT_DIR: zod_1.z.string().default('./uploads/reports'),
    ALLOWED_IMAGE_TYPES: zod_1.z.string().default('image/jpeg,image/png,image/jpg'),
    RATE_LIMIT_WINDOW_MS: zod_1.z.string().default('900000').transform(Number),
    RATE_LIMIT_MAX_REQUESTS: zod_1.z.string().default('100').transform(Number),
});
const validateEnv = () => {
    try {
        return envSchema.parse(process.env);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            const missingVars = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
            console.error('❌ Invalid environment variables:');
            missingVars.forEach((msg) => console.error(`  - ${msg}`));
            console.error('\n📋 Please check your .env file and ensure all required variables are set.');
            process.exit(1);
        }
        throw error;
    }
};
exports.config = validateEnv();
exports.isDevelopment = exports.config.NODE_ENV === 'development';
exports.isProduction = exports.config.NODE_ENV === 'production';
exports.isTest = exports.config.NODE_ENV === 'test';
//# sourceMappingURL=environment.js.map