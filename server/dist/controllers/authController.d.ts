import { Request, Response } from 'express';
import { AuthenticatedRequest } from '@/types';
export declare class AuthController {
    static register(req: Request, res: Response): Promise<void>;
    static login(req: Request, res: Response): Promise<void>;
    static logout(req: Request, res: Response): Promise<void>;
    static getProfile(req: AuthenticatedRequest, res: Response): Promise<void>;
    static updateProfile(req: AuthenticatedRequest, res: Response): Promise<void>;
    static changePassword(req: AuthenticatedRequest, res: Response): Promise<void>;
    static verifyToken(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=authController.d.ts.map