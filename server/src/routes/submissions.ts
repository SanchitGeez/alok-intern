import express from 'express';
import { 
  createSubmission, 
  getPatientSubmissions, 
  getAllSubmissions,
  getSubmission,
  updateSubmission,
  deleteSubmission
} from '../controllers/submissionController';
import { authenticate, authorize } from '../middleware/auth';
import { uploadImage, handleUploadError } from '../middleware/upload';

const router = express.Router();

// POST /api/submissions - Create new submission (patients only)
router.post(
  '/',
  authenticate,
  authorize('patient'),
  uploadImage.single('image'),
  handleUploadError,
  createSubmission
);

// GET /api/submissions/my - Get current patient's submissions
router.get(
  '/my',
  authenticate,
  authorize('patient'),
  getPatientSubmissions
);

// GET /api/submissions - Get all submissions (admin only)
router.get(
  '/',
  authenticate,
  authorize('admin'),
  getAllSubmissions
);

// GET /api/submissions/:id - Get specific submission
router.get(
  '/:id',
  authenticate,
  getSubmission
);

// PUT /api/submissions/:id - Update submission (admin only)
router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  updateSubmission
);

// DELETE /api/submissions/:id - Delete submission (admin only)
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  deleteSubmission
);

export default router;