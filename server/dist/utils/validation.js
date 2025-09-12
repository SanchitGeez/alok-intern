"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageFileSchema = exports.submissionFilterSchema = exports.paginationSchema = exports.annotationDataSchema = exports.updateSubmissionStatusSchema = exports.createSubmissionSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name must be less than 50 characters')
        .trim(),
    email: zod_1.z.string()
        .email('Please provide a valid email address')
        .toLowerCase()
        .trim(),
    password: zod_1.z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    role: zod_1.z.enum(['patient', 'admin']).default('patient'),
    patientId: zod_1.z.string()
        .min(1, 'Patient ID is required for patients')
        .trim()
        .optional(),
}).refine((data) => {
    if (data.role === 'patient' && !data.patientId) {
        return false;
    }
    return true;
}, {
    message: 'Patient ID is required for patients',
    path: ['patientId'],
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string()
        .email('Please provide a valid email address')
        .toLowerCase()
        .trim(),
    password: zod_1.z.string()
        .min(1, 'Password is required'),
});
exports.createSubmissionSchema = zod_1.z.object({
    patientDetails: zod_1.z.object({
        name: zod_1.z.string()
            .min(2, 'Patient name must be at least 2 characters')
            .max(100, 'Patient name must be less than 100 characters')
            .trim(),
        patientId: zod_1.z.string()
            .min(1, 'Patient ID is required')
            .trim(),
        email: zod_1.z.string()
            .email('Please provide a valid email address')
            .toLowerCase()
            .trim(),
        note: zod_1.z.string()
            .max(500, 'Note must be less than 500 characters')
            .trim()
            .optional(),
    }),
});
exports.updateSubmissionStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['uploaded', 'annotated', 'reported']),
});
exports.annotationDataSchema = zod_1.z.object({
    annotations: zod_1.z.array(zod_1.z.object({
        type: zod_1.z.enum(['rectangle', 'circle', 'arrow', 'freehand']),
        data: zod_1.z.record(zod_1.z.string(), zod_1.z.any()),
        timestamp: zod_1.z.string(),
    })),
    canvasWidth: zod_1.z.number().positive(),
    canvasHeight: zod_1.z.number().positive(),
});
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.string()
        .default('1')
        .transform(Number)
        .refine(n => n > 0, 'Page must be greater than 0'),
    limit: zod_1.z.string()
        .default('10')
        .transform(Number)
        .refine(n => n > 0 && n <= 100, 'Limit must be between 1 and 100'),
});
exports.submissionFilterSchema = zod_1.z.object({
    status: zod_1.z.enum(['uploaded', 'annotated', 'reported']).optional(),
    patientId: zod_1.z.string().optional(),
    startDate: zod_1.z.string().optional(),
    endDate: zod_1.z.string().optional(),
});
exports.imageFileSchema = zod_1.z.object({
    mimetype: zod_1.z.enum(['image/jpeg', 'image/png', 'image/jpg']),
    size: zod_1.z.number().max(10 * 1024 * 1024, 'File size must be less than 10MB'),
});
//# sourceMappingURL=validation.js.map