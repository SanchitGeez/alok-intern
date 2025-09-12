import { Request, Response } from 'express';
import { z } from 'zod';
import { Submission } from '../models/Submission';
import { User } from '../models/User';
import { getFileUrl, getPublicImageUrl, copyToPublicDirectory } from '../middleware/upload';
import { PDFService } from '../services/pdfService';
import path from 'path';

// Validation schemas
const createSubmissionSchema = z.object({
  patientDetails: z.object({
    name: z.string().min(1, 'Patient name is required').trim(),
    patientId: z.string().min(1, 'Patient ID is required').trim(),
    email: z.string().email('Invalid email format').toLowerCase().trim(),
    note: z.string().optional()
  })
});

const updateSubmissionSchema = z.object({
  annotationData: z.any().optional(),
  reviewText: z.string().optional(),
  status: z.enum(['uploaded', 'annotated', 'reported']).optional()
});

// Create a new submission
export const createSubmission = async (req: Request, res: Response): Promise<any> => {
  try {
    // Validate request body
    const validatedData = createSubmissionSchema.parse(req.body);
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image file is required'
      });
    }

    // Get user ID from authenticated request
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Verify user exists and is a patient
    const user = await User.findById(userId);
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

    // Copy image to public directory for better accessibility
    copyToPublicDirectory(req);

    // Create the submission
    const submission = new Submission({
      patientId: userId,
      patientDetails: validatedData.patientDetails,
      originalImagePath: req.file.path,
      status: 'uploaded'
    });

    await submission.save();

    // Return submission with file URL
    const submissionWithUrl = {
      ...submission.toJSON(),
      originalImageUrl: getFileUrl(path.basename(submission.originalImagePath), 'image')
    };

    res.status(201).json({
      success: true,
      message: 'Submission created successfully',
      data: submissionWithUrl
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: (error as any).errors
      });
    }

    console.error('Error creating submission:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get submissions for the current patient
export const getPatientSubmissions = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Verify user is a patient
    const user = await User.findById(userId);
    if (!user || user.role !== 'patient') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get submissions for this patient
    const submissions = await Submission.find({ patientId: userId })
      .sort({ createdAt: -1 });

    // Add file URLs to submissions
    const pdfService = PDFService.getInstance();
    const submissionsWithUrls = submissions.map(submission => ({
      ...submission.toJSON(),
      originalImageUrl: getFileUrl(path.basename(submission.originalImagePath), 'image'),
      annotatedImageUrl: submission.annotatedImagePath ? 
        getFileUrl(path.basename(submission.annotatedImagePath), 'image') : null,
      reportUrl: submission.reportPath ? 
        pdfService.getReportUrl(path.basename(submission.reportPath)) : null
    }));

    res.json({
      success: true,
      data: submissionsWithUrls,
      count: submissionsWithUrls.length
    });

  } catch (error) {
    console.error('Error fetching patient submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all submissions (admin only)
export const getAllSubmissions = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Verify user is an admin
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Get query parameters for filtering
    const { status, page = 1, limit = 10 } = req.query;
    const filter: any = {};
    
    if (status && typeof status === 'string') {
      filter.status = status;
    }

    // Calculate pagination
    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    // Get submissions with pagination
    const [submissions, total] = await Promise.all([
      Submission.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('patientId', 'name email'),
      Submission.countDocuments(filter)
    ]);

    // Add file URLs to submissions
    const pdfService = PDFService.getInstance();
    const submissionsWithUrls = submissions.map(submission => ({
      ...submission.toJSON(),
      originalImageUrl: getFileUrl(path.basename(submission.originalImagePath), 'image'),
      annotatedImageUrl: submission.annotatedImagePath ? 
        getFileUrl(path.basename(submission.annotatedImagePath), 'image') : null,
      reportUrl: submission.reportPath ? 
        pdfService.getReportUrl(path.basename(submission.reportPath)) : null
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

  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get a specific submission
export const getSubmission = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;
    const userRole = (req as any).user?.role;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Find the submission
    const submission = await Submission.findById(id).populate('patientId', 'name email');
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Check access permissions
    if (userRole === 'patient' && submission.patientId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Add file URLs to submission
    const pdfService = PDFService.getInstance();
    const submissionWithUrls = {
      ...submission.toJSON(),
      originalImageUrl: getFileUrl(path.basename(submission.originalImagePath), 'image'),
      annotatedImageUrl: submission.annotatedImagePath ? 
        getFileUrl(path.basename(submission.annotatedImagePath), 'image') : null,
      reportUrl: submission.reportPath ? 
        pdfService.getReportUrl(path.basename(submission.reportPath)) : null
    };

    res.json({
      success: true,
      data: submissionWithUrls
    });

  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update submission (admin only - for annotations)
export const updateSubmission = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Verify user is an admin
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Validate request body
    const validatedData = updateSubmissionSchema.parse(req.body);

    // Find and update the submission
    const submission = await Submission.findByIdAndUpdate(
      id,
      validatedData,
      { new: true, runValidators: true }
    );

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Add file URLs to submission
    const pdfService = PDFService.getInstance();
    const submissionWithUrls = {
      ...submission.toJSON(),
      originalImageUrl: getFileUrl(path.basename(submission.originalImagePath), 'image'),
      annotatedImageUrl: submission.annotatedImagePath ? 
        getFileUrl(path.basename(submission.annotatedImagePath), 'image') : null,
      reportUrl: submission.reportPath ? 
        pdfService.getReportUrl(path.basename(submission.reportPath)) : null
    };

    res.json({
      success: true,
      message: 'Submission updated successfully',
      data: submissionWithUrls
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: (error as any).errors
      });
    }

    console.error('Error updating submission:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete submission (admin only)
export const deleteSubmission = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Verify user is an admin
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Find and delete the submission
    const submission = await Submission.findByIdAndDelete(id);

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

  } catch (error) {
    console.error('Error deleting submission:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Generate PDF report for submission (admin only)
export const generateReport = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Verify user is an admin
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Find the submission
    const submission = await Submission.findById(id);
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Extract report data from request body
    const { findings, recommendations } = req.body;
    
    if (!findings || !recommendations) {
      return res.status(400).json({
        success: false,
        message: 'Findings and recommendations are required'
      });
    }

    // Prepare report data
    const reportData = {
      submissionId: (submission._id as any).toString(),
      patientDetails: submission.patientDetails,
      originalImagePath: submission.originalImagePath,
      annotatedImagePath: submission.annotatedImagePath,
      annotationData: submission.annotationData,
      findings,
      recommendations,
      doctorName: user.name || 'Dr. ' + user.email.split('@')[0],
      reportDate: new Date()
    };

    // Generate PDF report
    const pdfService = PDFService.getInstance();
    const reportPath = await pdfService.generateReport(reportData);
    
    // Update submission with report path and status
    await Submission.findByIdAndUpdate(id, {
      reportPath,
      status: 'reported'
    });

    // Return success response with download URL
    const reportFileName = path.basename(reportPath);
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

  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating report'
    });
  }
};