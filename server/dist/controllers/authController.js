"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const authService_1 = require("../services/authService");
const validation_1 = require("../utils/validation");
const environment_1 = require("../config/environment");
class AuthController {
    static async register(req, res) {
        try {
            const validatedData = validation_1.registerSchema.parse(req.body);
            const authResponse = await authService_1.AuthService.register(validatedData);
            res.cookie('token', authResponse.token, {
                httpOnly: true,
                secure: environment_1.config.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: authResponse,
            });
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(400).json({
                    success: false,
                    message: 'Registration failed',
                    error: error.message,
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    message: 'Internal server error',
                    error: 'Unknown error occurred',
                });
            }
        }
    }
    static async login(req, res) {
        try {
            const validatedData = validation_1.loginSchema.parse(req.body);
            const authResponse = await authService_1.AuthService.login(validatedData);
            res.cookie('token', authResponse.token, {
                httpOnly: true,
                secure: environment_1.config.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: authResponse,
            });
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(401).json({
                    success: false,
                    message: 'Login failed',
                    error: error.message,
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    message: 'Internal server error',
                    error: 'Unknown error occurred',
                });
            }
        }
    }
    static async logout(req, res) {
        try {
            res.clearCookie('token');
            res.status(200).json({
                success: true,
                message: 'Logout successful',
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Logout failed',
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            });
        }
    }
    static async getProfile(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                });
                return;
            }
            const user = await authService_1.AuthService.getUserProfile(req.user.userId);
            res.status(200).json({
                success: true,
                message: 'Profile retrieved successfully',
                data: { user },
            });
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(404).json({
                    success: false,
                    message: 'Profile not found',
                    error: error.message,
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    message: 'Internal server error',
                    error: 'Unknown error occurred',
                });
            }
        }
    }
    static async updateProfile(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                });
                return;
            }
            const { name, patientId } = req.body;
            const updateData = {};
            if (name)
                updateData.name = name;
            if (patientId)
                updateData.patientId = patientId;
            const user = await authService_1.AuthService.updateUserProfile(req.user.userId, updateData);
            res.status(200).json({
                success: true,
                message: 'Profile updated successfully',
                data: { user },
            });
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(400).json({
                    success: false,
                    message: 'Profile update failed',
                    error: error.message,
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    message: 'Internal server error',
                    error: 'Unknown error occurred',
                });
            }
        }
    }
    static async changePassword(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                });
                return;
            }
            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
                res.status(400).json({
                    success: false,
                    message: 'Current password and new password are required',
                });
                return;
            }
            await authService_1.AuthService.changePassword(req.user.userId, currentPassword, newPassword);
            res.status(200).json({
                success: true,
                message: 'Password changed successfully',
            });
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(400).json({
                    success: false,
                    message: 'Password change failed',
                    error: error.message,
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    message: 'Internal server error',
                    error: 'Unknown error occurred',
                });
            }
        }
    }
    static async verifyToken(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid token',
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Token is valid',
                data: { user: req.user },
            });
        }
        catch (error) {
            res.status(401).json({
                success: false,
                message: 'Token verification failed',
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            });
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=authController.js.map