import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

// User related types
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

// JWT related types
export interface IJwtPayload extends JwtPayload {
  userId: string;
  email: string;
  role: 'patient' | 'admin';
  patientId?: string;
}

// Request with authenticated user
export interface AuthenticatedRequest extends Request {
  user?: IUserPayload;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Auth request types
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

// Submission related types
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