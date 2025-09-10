import { Request, Response, NextFunction } from 'express';
import { JWTService } from '@/utils/jwt';
import { AuthenticatedRequest, ApiResponse } from '@/types';
import { User } from '@/models/User';

/**
 * Middleware to authenticate user using JWT token
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header or cookies
    let token = JWTService.extractTokenFromHeader(req.headers.authorization);
    
    // If no token in header, check cookies
    if (!token && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      } as ApiResponse);
      return;
    }

    // Verify token
    const decoded = JWTService.verifyToken(token);

    // Verify user still exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Token is no longer valid. User not found.',
      } as ApiResponse);
      return;
    }

    // Add user info to request
    req.user = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      patientId: user.patientId,
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error instanceof Error ? error.message : 'Invalid token',
    } as ApiResponse);
  }
};

/**
 * Middleware to authorize user based on roles
 */
export const authorize = (...roles: ('patient' | 'admin')[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      } as ApiResponse);
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`,
      } as ApiResponse);
      return;
    }

    next();
  };
};

/**
 * Middleware to ensure patient can only access their own data
 */
export const ensureOwnData = (resourceUserIdParam: string = 'userId') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      } as ApiResponse);
      return;
    }

    // Admins can access any data
    if (req.user.role === 'admin') {
      next();
      return;
    }

    // Patients can only access their own data
    const resourceUserId = req.params[resourceUserIdParam];
    if (req.user.role === 'patient' && req.user.userId !== resourceUserId) {
      res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own data.',
      } as ApiResponse);
      return;
    }

    next();
  };
};

/**
 * Optional authentication - doesn't fail if no token provided
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token = JWTService.extractTokenFromHeader(req.headers.authorization);
    
    if (!token && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      const decoded = JWTService.verifyToken(token);
      const user = await User.findById(decoded.userId);
      
      if (user) {
        req.user = {
          userId: user._id.toString(),
          email: user.email,
          role: user.role,
          patientId: user.patientId,
        };
      }
    }

    next();
  } catch (error) {
    // Ignore auth errors in optional auth
    next();
  }
};