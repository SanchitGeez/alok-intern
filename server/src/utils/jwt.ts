import jwt from 'jsonwebtoken';
import { config } from '../config/environment';
import { IUserPayload, IJwtPayload } from '../types';

export class JWTService {
  private static readonly JWT_SECRET = config.JWT_SECRET;
  private static readonly JWT_EXPIRES_IN = config.JWT_EXPIRES_IN;

  /**
   * Generate JWT token for user
   */
  static generateToken(payload: IUserPayload): string {
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN as string,
      issuer: 'oralvis-healthcare',
      audience: 'oralvis-users',
    } as jwt.SignOptions);
  }

  /**
   * Verify JWT token and return payload
   */
  static verifyToken(token: string): IJwtPayload {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET, {
        issuer: 'oralvis-healthcare',
        audience: 'oralvis-users',
      }) as IJwtPayload;

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      }
      throw new Error('Token verification failed');
    }
  }

  /**
   * Generate refresh token (longer expiry)
   */
  static generateRefreshToken(payload: IUserPayload): string {
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: '30d',
      issuer: 'oralvis-healthcare',
      audience: 'oralvis-refresh',
    });
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): IJwtPayload {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET, {
        issuer: 'oralvis-healthcare',
        audience: 'oralvis-refresh',
      }) as IJwtPayload;

      return decoded;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Extract token from Authorization header
   */
  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) return null;
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
    
    return parts[1] || null;
  }
}