export declare const config: {
    NODE_ENV: "development" | "production" | "test";
    PORT: number;
    MONGODB_URI: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    COOKIE_SECRET: string;
    CLIENT_URL: string;
    UPLOAD_DIR: string;
    MAX_FILE_SIZE: number;
    PDF_OUTPUT_DIR: string;
    ALLOWED_IMAGE_TYPES: string;
    RATE_LIMIT_WINDOW_MS: number;
    RATE_LIMIT_MAX_REQUESTS: number;
};
export declare const isDevelopment: boolean;
export declare const isProduction: boolean;
export declare const isTest: boolean;
//# sourceMappingURL=environment.d.ts.map