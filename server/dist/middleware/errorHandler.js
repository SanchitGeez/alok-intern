"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createError = exports.asyncHandler = exports.notFoundHandler = exports.globalErrorHandler = void 0;
const zod_1 = require("zod");
const environment_1 = require("../config/environment");
const globalErrorHandler = (error, req, res, next) => {
    let statusCode = error.statusCode || 500;
    let message = error.message || 'Internal server error';
    let validationErrors = null;
    if (error instanceof zod_1.ZodError) {
        statusCode = 400;
        message = 'Validation failed';
        validationErrors = error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
        }));
    }
    if (error.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation failed';
        validationErrors = Object.values(error.errors).map((err) => ({
            field: err.path,
            message: err.message,
        }));
    }
    if (error.name === 'MongoServerError' && error.code === 11000) {
        statusCode = 409;
        message = 'Resource already exists';
        const field = Object.keys(error.keyValue)[0];
        validationErrors = [{
                field,
                message: `${field} already exists`,
            }];
    }
    if (error.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }
    if (error.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }
    if (error.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid ID format';
    }
    if (environment_1.config.NODE_ENV === 'development') {
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
    const response = {
        success: false,
        message,
        error: environment_1.config.NODE_ENV === 'production' && statusCode === 500
            ? 'Internal server error'
            : message,
    };
    if (validationErrors) {
        response.validationErrors = validationErrors;
    }
    if (environment_1.config.NODE_ENV === 'development' && error.stack) {
        response.stack = error.stack;
    }
    res.status(statusCode).json(response);
};
exports.globalErrorHandler = globalErrorHandler;
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
        error: 'Not Found',
    });
};
exports.notFoundHandler = notFoundHandler;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
const createError = (message, statusCode = 500) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
};
exports.createError = createError;
//# sourceMappingURL=errorHandler.js.map