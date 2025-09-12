import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@/types';
export declare const authenticate: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const authorize: (...roles: ("patient" | "admin")[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const ensureOwnData: (resourceUserIdParam?: string) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const optionalAuth: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.d.ts.map