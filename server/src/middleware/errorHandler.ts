import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiResponse } from '../types';
import { config } from '../config/environment';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

/**
 * Global error handling middleware
 */
export const globalErrorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal server error';
  let validationErrors: any = null;

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed';
    validationErrors = (error as any).errors.map((err: any) => ({
      field: err.path.join('.'),
      message: err.message,
    }));
  }

  // Handle MongoDB validation errors
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    validationErrors = Object.values((error as any).errors).map((err: any) => ({
      field: err.path,
      message: err.message,
    }));
  }

  // Handle MongoDB duplicate key errors
  if (error.name === 'MongoServerError' && (error as any).code === 11000) {
    statusCode = 409;
    message = 'Resource already exists';
    const field = Object.keys((error as any).keyValue)[0];
    validationErrors = [{
      field,
      message: `${field} already exists`,
    }];
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Handle MongoDB cast errors (invalid ObjectId)
  if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  // Log error in development
  if (config.NODE_ENV === 'development') {
    console.error('🔥 Error:', {
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      body: req.body,
      params: req.params,
      query: req.query,
    });
  }

  const response: ApiResponse = {
    success: false,
    message,
    error: config.NODE_ENV === 'production' && statusCode === 500 
      ? 'Internal server error' 
      : message,
  };

  if (validationErrors) {
    (response as any).validationErrors = validationErrors;
  }

  // Include stack trace in development
  if (config.NODE_ENV === 'development' && error.stack) {
    (response as any).stack = error.stack;
  }

  res.status(statusCode).json(response);
};

/**
 * Catch-all for 404 routes
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    error: 'Not Found',
  } as ApiResponse);
};

/**
 * Async error wrapper to catch async errors
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Create custom application error
 */
export const createError = (message: string, statusCode: number = 500): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};