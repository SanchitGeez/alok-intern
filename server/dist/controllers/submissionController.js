"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReport = exports.deleteSubmission = exports.updateSubmission = exports.getSubmission = exports.getAllSubmissions = exports.getPatientSubmissions = exports.createSubmission = void 0;
const zod_1 = require("zod");
const Submission_1 = require("../models/Submission");
const User_1 = require("../models/User");
const upload_1 = require("../middleware/upload");
const pdfService_1 = require("../services/pdfService");
const path_1 = __importDefault(require("path"));
const createSubmissionSchema = zod_1.z.object({
    patientDetails: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Patient name is required').trim(),
        patientId: zod_1.z.string().min(1, 'Patient ID is required').trim(),
        email: zod_1.z.string().email('Invalid email format').toLowerCase().trim(),
        note: zod_1.z.string().optional()
    })
});
const updateSubmissionSchema = zod_1.z.object({
    annotationData: zod_1.z.any().optional(),
    reviewText: zod_1.z.string().optional(),
    status: zod_1.z.enum(['uploaded', 'annotated', 'reported']).optional()
});
const createSubmission = async (req, res) => {
    try {
        const validatedData = createSubmissionSchema.parse(req.body);
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Image file is required'
            });
        }
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }
        const user = await User_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        if (user.role !== 'patient') {
            return res.status(403).json({
                success: false,
                message: 'Only patients can create submissions'
            });
        }
        (0, upload_1.copyToPublicDirectory)(req);
        const submission = new Submission_1.Submission({
            patientId: userId,
            patientDetails: validatedData.patientDetails,
            originalImagePath: req.file.path,
            status: 'uploaded'
        });
        await submission.save();
        const submissionWithUrl = {
            ...submission.toJSON(),
            originalImageUrl: (0, upload_1.getFileUrl)(path_1.default.basename(submission.originalImagePath), 'image')
        };
        res.status(201).json({
            success: true,
            message: 'Submission created successfully',
            data: submissionWithUrl
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.errors
            });
        }
        console.error('Error creating submission:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.createSubmission = createSubmission;
const getPatientSubmissions = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }
        const user = await User_1.User.findById(userId);
        if (!user || user.role !== 'patient') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }
        const submissions = await Submission_1.Submission.find({ patientId: userId })
            .sort({ createdAt: -1 });
        const pdfService = pdfService_1.PDFService.getInstance();
        const submissionsWithUrls = submissions.map(submission => ({
            ...submission.toJSON(),
            originalImageUrl: (0, upload_1.getFileUrl)(path_1.default.basename(submission.originalImagePath), 'image'),
            annotatedImageUrl: submission.annotatedImagePath ?
                (0, upload_1.getFileUrl)(path_1.default.basename(submission.annotatedImagePath), 'image') : null,
            reportUrl: submission.reportPath ?
                pdfService.getReportUrl(path_1.default.basename(submission.reportPath)) : null
        }));
        res.json({
            success: true,
            data: submissionsWithUrls,
            count: submissionsWithUrls.length
        });
    }
    catch (error) {
        console.error('Error fetching patient submissions:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.getPatientSubmissions = getPatientSubmissions;
const getAllSubmissions = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }
        const user = await User_1.User.findById(userId);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }
        const { status, page = 1, limit = 10 } = req.query;
        const filter = {};
        if (status && typeof status === 'string') {
            filter.status = status;
        }
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;
        const [submissions, total] = await Promise.all([
            Submission_1.Submission.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .populate('patientId', 'name email'),
            Submission_1.Submission.countDocuments(filter)
        ]);
        const pdfService = pdfService_1.PDFService.getInstance();
        const submissionsWithUrls = submissions.map(submission => ({
            ...submission.toJSON(),
            originalImageUrl: (0, upload_1.getFileUrl)(path_1.default.basename(submission.originalImagePath), 'image'),
            annotatedImageUrl: submission.annotatedImagePath ?
                (0, upload_1.getFileUrl)(path_1.default.basename(submission.annotatedImagePath), 'image') : null,
            reportUrl: submission.reportPath ?
                pdfService.getReportUrl(path_1.default.basename(submission.reportPath)) : null
        }));
        res.json({
            success: true,
            data: submissionsWithUrls,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        });
    }
    catch (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.getAllSubmissions = getAllSubmissions;
const getSubmission = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        const userRole = req.user?.role;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }
        const submission = await Submission_1.Submission.findById(id).populate('patientId', 'name email');
        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });
        }
        if (userRole === 'patient' && submission.patientId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }
        const pdfService = pdfService_1.PDFService.getInstance();
        const submissionWithUrls = {
            ...submission.toJSON(),
            originalImageUrl: (0, upload_1.getFileUrl)(path_1.default.basename(submission.originalImagePath), 'image'),
            annotatedImageUrl: submission.annotatedImagePath ?
                (0, upload_1.getFileUrl)(path_1.default.basename(submission.annotatedImagePath), 'image') : null,
            reportUrl: submission.reportPath ?
                pdfService.getReportUrl(path_1.default.basename(submission.reportPath)) : null
        };
        res.json({
            success: true,
            data: submissionWithUrls
        });
    }
    catch (error) {
        console.error('Error fetching submission:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.getSubmission = getSubmission;
const updateSubmission = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }
        const user = await User_1.User.findById(userId);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }
        const validatedData = updateSubmissionSchema.parse(req.body);
        const submission = await Submission_1.Submission.findByIdAndUpdate(id, validatedData, { new: true, runValidators: true });
        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });
        }
        const pdfService = pdfService_1.PDFService.getInstance();
        const submissionWithUrls = {
            ...submission.toJSON(),
            originalImageUrl: (0, upload_1.getFileUrl)(path_1.default.basename(submission.originalImagePath), 'image'),
            annotatedImageUrl: submission.annotatedImagePath ?
                (0, upload_1.getFileUrl)(path_1.default.basename(submission.annotatedImagePath), 'image') : null,
            reportUrl: submission.reportPath ?
                pdfService.getReportUrl(path_1.default.basename(submission.reportPath)) : null
        };
        res.json({
            success: true,
            message: 'Submission updated successfully',
            data: submissionWithUrls
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.errors
            });
        }
        console.error('Error updating submission:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.updateSubmission = updateSubmission;
const deleteSubmission = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }
        const user = await User_1.User.findById(userId);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }
        const submission = await Submission_1.Submission.findByIdAndDelete(id);
        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });
        }
        res.json({
            success: true,
            message: 'Submission deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting submission:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.deleteSubmission = deleteSubmission;
const generateReport = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }
        const user = await User_1.User.findById(userId);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }
        const submission = await Submission_1.Submission.findById(id);
        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });
        }
        const { findings, recommendations } = req.body;
        if (!findings || !recommendations) {
            return res.status(400).json({
                success: false,
                message: 'Findings and recommendations are required'
            });
        }
        const reportData = {
            submissionId: submission._id.toString(),
            patientDetails: submission.patientDetails,
            originalImagePath: submission.originalImagePath,
            annotatedImagePath: submission.annotatedImagePath,
            annotationData: submission.annotationData,
            findings,
            recommendations,
            doctorName: user.name || 'Dr. ' + user.email.split('@')[0],
            reportDate: new Date()
        };
        const pdfService = pdfService_1.PDFService.getInstance();
        const reportPath = await pdfService.generateReport(reportData);
        await Submission_1.Submission.findByIdAndUpdate(id, {
            reportPath,
            status: 'reported'
        });
        const reportFileName = path_1.default.basename(reportPath);
        const reportUrl = pdfService.getReportUrl(reportFileName);
        res.json({
            success: true,
            message: 'Report generated successfully',
            data: {
                reportPath,
                reportUrl,
                fileName: reportFileName
            }
        });
    }
    catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating report'
        });
    }
};
exports.generateReport = generateReport;
//# sourceMappingURL=submissionController.js.map