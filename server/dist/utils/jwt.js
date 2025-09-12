"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWTService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const environment_1 = require("@/config/environment");
class JWTService {
    static generateToken(payload) {
        return jsonwebtoken_1.default.sign(payload, this.JWT_SECRET, {
            expiresIn: this.JWT_EXPIRES_IN,
            issuer: 'oralvis-healthcare',
            audience: 'oralvis-users',
        });
    }
    static verifyToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, this.JWT_SECRET, {
                issuer: 'oralvis-healthcare',
                audience: 'oralvis-users',
            });
            return decoded;
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                throw new Error('Token has expired');
            }
            if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                throw new Error('Invalid token');
            }
            throw new Error('Token verification failed');
        }
    }
    static generateRefreshToken(payload) {
        return jsonwebtoken_1.default.sign(payload, this.JWT_SECRET, {
            expiresIn: '30d',
            issuer: 'oralvis-healthcare',
            audience: 'oralvis-refresh',
        });
    }
    static verifyRefreshToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, this.JWT_SECRET, {
                issuer: 'oralvis-healthcare',
                audience: 'oralvis-refresh',
            });
            return decoded;
        }
        catch (error) {
            throw new Error('Invalid refresh token');
        }
    }
    static extractTokenFromHeader(authHeader) {
        if (!authHeader)
            return null;
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer')
            return null;
        return parts[1] || null;
    }
}
exports.JWTService = JWTService;
JWTService.JWT_SECRET = environment_1.config.JWT_SECRET;
JWTService.JWT_EXPIRES_IN = environment_1.config.JWT_EXPIRES_IN;
//# sourceMappingURL=jwt.js.map