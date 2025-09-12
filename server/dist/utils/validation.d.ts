import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    role: z.ZodDefault<z.ZodEnum<{
        patient: "patient";
        admin: "admin";
    }>>;
    patientId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const createSubmissionSchema: z.ZodObject<{
    patientDetails: z.ZodObject<{
        name: z.ZodString;
        patientId: z.ZodString;
        email: z.ZodString;
        note: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateSubmissionStatusSchema: z.ZodObject<{
    status: z.ZodEnum<{
        uploaded: "uploaded";
        annotated: "annotated";
        reported: "reported";
    }>;
}, z.core.$strip>;
export declare const annotationDataSchema: z.ZodObject<{
    annotations: z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<{
            rectangle: "rectangle";
            circle: "circle";
            arrow: "arrow";
            freehand: "freehand";
        }>;
        data: z.ZodRecord<z.ZodString, z.ZodAny>;
        timestamp: z.ZodString;
    }, z.core.$strip>>;
    canvasWidth: z.ZodNumber;
    canvasHeight: z.ZodNumber;
}, z.core.$strip>;
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodPipe<z.ZodDefault<z.ZodString>, z.ZodTransform<number, string>>;
    limit: z.ZodPipe<z.ZodDefault<z.ZodString>, z.ZodTransform<number, string>>;
}, z.core.$strip>;
export declare const submissionFilterSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<{
        uploaded: "uploaded";
        annotated: "annotated";
        reported: "reported";
    }>>;
    patientId: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const imageFileSchema: z.ZodObject<{
    mimetype: z.ZodEnum<{
        "image/jpeg": "image/jpeg";
        "image/png": "image/png";
        "image/jpg": "image/jpg";
    }>;
    size: z.ZodNumber;
}, z.core.$strip>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;
export type UpdateSubmissionStatusInput = z.infer<typeof updateSubmissionStatusSchema>;
export type AnnotationDataInput = z.infer<typeof annotationDataSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type SubmissionFilterInput = z.infer<typeof submissionFilterSchema>;
//# sourceMappingURL=validation.d.ts.map