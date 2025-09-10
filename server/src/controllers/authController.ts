import { Request, Response } from 'express';
import { AuthService } from '@/services/authService';
import { registerSchema, loginSchema } from '@/utils/validation';
import { AuthenticatedRequest, ApiResponse } from '@/types';
import { config } from '@/config/environment';

export class AuthController {
  /**
   * Register new user
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const validatedData = registerSchema.parse(req.body);

      // Register user
      const authResponse = await AuthService.register(validatedData);

      // Set HTTP-only cookie
      res.cookie('token', authResponse.token, {
        httpOnly: true,
        secure: config.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: authResponse,
      } as ApiResponse);

    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: 'Registration failed',
          error: error.message,
        } as ApiResponse);
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: 'Unknown error occurred',
        } as ApiResponse);
      }
    }
  }

  /**
   * Login user
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const validatedData = loginSchema.parse(req.body);

      // Login user
      const authResponse = await AuthService.login(validatedData);

      // Set HTTP-only cookie
      res.cookie('token', authResponse.token, {
        httpOnly: true,
        secure: config.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: authResponse,
      } as ApiResponse);

    } catch (error) {
      if (error instanceof Error) {
        res.status(401).json({
          success: false,
          message: 'Login failed',
          error: error.message,
        } as ApiResponse);
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: 'Unknown error occurred',
        } as ApiResponse);
      }
    }
  }

  /**
   * Logout user
   */
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      // Clear the cookie
      res.clearCookie('token');

      res.status(200).json({
        success: true,
        message: 'Logout successful',
      } as ApiResponse);

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Logout failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      } as ApiResponse);
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        } as ApiResponse);
        return;
      }

      const user = await AuthService.getUserProfile(req.user.userId);

      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: { user },
      } as ApiResponse);

    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json({
          success: false,
          message: 'Profile not found',
          error: error.message,
        } as ApiResponse);
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: 'Unknown error occurred',
        } as ApiResponse);
      }
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        } as ApiResponse);
        return;
      }

      const { name, patientId } = req.body;
      const updateData: { name?: string; patientId?: string } = {};

      if (name) updateData.name = name;
      if (patientId) updateData.patientId = patientId;

      const user = await AuthService.updateUserProfile(req.user.userId, updateData);

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: { user },
      } as ApiResponse);

    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: 'Profile update failed',
          error: error.message,
        } as ApiResponse);
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: 'Unknown error occurred',
        } as ApiResponse);
      }
    }
  }

  /**
   * Change password
   */
  static async changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        } as ApiResponse);
        return;
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        res.status(400).json({
          success: false,
          message: 'Current password and new password are required',
        } as ApiResponse);
        return;
      }

      await AuthService.changePassword(req.user.userId, currentPassword, newPassword);

      res.status(200).json({
        success: true,
        message: 'Password changed successfully',
      } as ApiResponse);

    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: 'Password change failed',
          error: error.message,
        } as ApiResponse);
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: 'Unknown error occurred',
        } as ApiResponse);
      }
    }
  }

  /**
   * Verify token and get user info
   */
  static async verifyToken(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Invalid token',
        } as ApiResponse);
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Token is valid',
        data: { user: req.user },
      } as ApiResponse);

    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Token verification failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      } as ApiResponse);
    }
  }
}