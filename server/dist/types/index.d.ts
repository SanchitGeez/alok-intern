import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';
export interface IUser {
    _id: string;
    name: string;
    email: string;
    password: string;
    role: 'patient' | 'admin';
    patientId?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface IUserPayload {
    userId: string;
    email: string;
    role: 'patient' | 'admin';
    patientId?: string;
}
export interface IJwtPayload extends JwtPayload {
    userId: string;
    email: string;
    role: 'patient' | 'admin';
    patientId?: string;
}
export interface AuthenticatedRequest extends Request {
    user?: IUserPayload;
}
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}
export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    role: 'patient' | 'admin';
    patientId?: string;
}
export interface LoginRequest {
    email: string;
    password: string;
}
export interface AuthResponse {
    user: {
        id: string;
        name: string;
        email: string;
        role: 'patient' | 'admin';
        patientId?: string;
    };
    token: string;
}
export interface ISubmission {
    _id: string;
    patientId: string;
    patientDetails: {
        name: string;
        patientId: string;
        email: string;
        note?: string;
    };
    originalImagePath: string;
    annotatedImagePath?: string;
    annotationData?: object;
    reviewText?: string;
    reportPath?: string;
    status: 'uploaded' | 'annotated' | 'reported';
    createdAt: Date;
    updatedAt: Date;
}
export interface CreateSubmissionRequest {
    patientDetails: {
        name: string;
        patientId: string;
        email: string;
        note?: string;
    };
}
//# sourceMappingURL=index.d.ts.map