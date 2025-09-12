import { IUserPayload, IJwtPayload } from '../types';
export declare class JWTService {
    private static readonly JWT_SECRET;
    private static readonly JWT_EXPIRES_IN;
    static generateToken(payload: IUserPayload): string;
    static verifyToken(token: string): IJwtPayload;
    static generateRefreshToken(payload: IUserPayload): string;
    static verifyRefreshToken(token: string): IJwtPayload;
    static extractTokenFromHeader(authHeader: string | undefined): string | null;
}
//# sourceMappingURL=jwt.d.ts.map