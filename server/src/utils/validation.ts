import { z } from 'zod';

// User validation schemas
export const registerSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .trim(),
  
  email: z.string()
    .email('Please provide a valid email address')
    .toLowerCase()
    .trim(),
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  role: z.enum(['patient', 'admin']).default('patient'),
  
  patientId: z.string()
    .min(1, 'Patient ID is required for patients')
    .trim()
    .optional(),
}).refine((data) => {
  // If role is patient, patientId is required
  if (data.role === 'patient' && !data.patientId) {
    return false;
  }
  return true;
}, {
  message: 'Patient ID is required for patients',
  path: ['patientId'],
});

export const loginSchema = z.object({
  email: z.string()
    .email('Please provide a valid email address')
    .toLowerCase()
    .trim(),
  
  password: z.string()
    .min(1, 'Password is required'),
});

// Submission validation schemas
export const createSubmissionSchema = z.object({
  patientDetails: z.object({
    name: z.string()
      .min(2, 'Patient name must be at least 2 characters')
      .max(100, 'Patient name must be less than 100 characters')
      .trim(),
    
    patientId: z.string()
      .min(1, 'Patient ID is required')
      .trim(),
    
    email: z.string()
      .email('Please provide a valid email address')
      .toLowerCase()
      .trim(),
    
    note: z.string()
      .max(500, 'Note must be less than 500 characters')
      .trim()
      .optional(),
  }),
});

export const updateSubmissionStatusSchema = z.object({
  status: z.enum(['uploaded', 'annotated', 'reported']),
});

export const annotationDataSchema = z.object({
  annotations: z.array(z.object({
    type: z.enum(['rectangle', 'circle', 'arrow', 'freehand']),
    data: z.record(z.any()),
    timestamp: z.string().datetime(),
  })),
  canvasWidth: z.number().positive(),
  canvasHeight: z.number().positive(),
});

// Query validation schemas
export const paginationSchema = z.object({
  page: z.string()
    .transform(Number)
    .refine(n => n > 0, 'Page must be greater than 0')
    .default('1'),
  
  limit: z.string()
    .transform(Number)
    .refine(n => n > 0 && n <= 100, 'Limit must be between 1 and 100')
    .default('10'),
});

export const submissionFilterSchema = z.object({
  status: z.enum(['uploaded', 'annotated', 'reported']).optional(),
  patientId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// File validation
export const imageFileSchema = z.object({
  mimetype: z.enum(['image/jpeg', 'image/png', 'image/jpg']),
  size: z.number().max(10 * 1024 * 1024, 'File size must be less than 10MB'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;
export type UpdateSubmissionStatusInput = z.infer<typeof updateSubmissionStatusSchema>;
export type AnnotationDataInput = z.infer<typeof annotationDataSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type SubmissionFilterInput = z.infer<typeof submissionFilterSchema>;