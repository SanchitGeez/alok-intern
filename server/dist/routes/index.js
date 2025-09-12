"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authRoutes_1 = __importDefault(require("./authRoutes"));
const submissions_1 = __importDefault(require("./submissions"));
const router = (0, express_1.Router)();
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'OralVis Healthcare API is running',
        data: {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
        },
    });
});
router.use('/auth', authRoutes_1.default);
router.use('/submissions', submissions_1.default);
router.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to OralVis Healthcare API',
        data: {
            version: '1.0.0',
            documentation: '/api/docs',
            endpoints: {
                auth: '/api/auth',
                submissions: '/api/submissions',
                users: '/api/users',
            },
        },
    });
});
exports.default = router;
//# sourceMappingURL=index.js.map