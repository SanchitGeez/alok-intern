import { Router } from 'express';
import authRoutes from './authRoutes';
import submissionRoutes from './submissions';
import { ApiResponse } from '../types';

const router = Router();

// Health check endpoint
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
  } as ApiResponse);
});

// API routes
router.use('/auth', authRoutes);
router.use('/submissions', submissionRoutes);

// API info endpoint
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
  } as ApiResponse);
});

export default router;