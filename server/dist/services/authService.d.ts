import { IUserDocument } from '../models/User';
import { RegisterInput, LoginInput } from '../utils/validation';
import { AuthResponse } from '../types';
export declare class AuthService {
    static register(userData: RegisterInput): Promise<AuthResponse>;
    static login(credentials: LoginInput): Promise<AuthResponse>;
    static getUserProfile(userId: string): Promise<IUserDocument>;
    static updateUserProfile(userId: string, updateData: Partial<Pick<RegisterInput, 'name' | 'patientId'>>): Promise<IUserDocument>;
    static changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
    static refreshToken(refreshToken: string): Promise<{
        token: string;
    }>;
    static getAllUsers(page?: number, limit?: number, role?: 'patient' | 'admin'): Promise<{
        users: IUserDocument[];
        total: number;
        pages: number;
    }>;
    static deleteUser(userId: string): Promise<void>;
}
//# sourceMappingURL=authService.d.ts.map