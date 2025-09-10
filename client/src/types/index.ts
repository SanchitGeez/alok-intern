// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'admin';
  patientId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'patient' | 'admin';
  patientId?: string;
}

// Submission types
export interface Submission {
  id: string;
  patientId: string;
  patientDetails: {
    name: string;
    patientId: string;
    email: string;
    note?: string;
  };
  originalImagePath: string;
  annotatedImagePath?: string;
  annotationData?: AnnotationData;
  reportPath?: string;
  status: 'uploaded' | 'annotated' | 'reported';
  createdAt: string;
  updatedAt: string;
}

export interface AnnotationData {
  annotations: Annotation[];
  canvasWidth: number;
  canvasHeight: number;
}

export interface Annotation {
  id: string;
  type: 'rectangle' | 'circle' | 'arrow' | 'freehand';
  data: Record<string, any>;
  timestamp: string;
  color?: string;
  strokeWidth?: number;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  validationErrors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

// Form types
export interface UploadFormData {
  patientDetails: {
    name: string;
    patientId: string;
    email: string;
    note?: string;
  };
  image: File;
}