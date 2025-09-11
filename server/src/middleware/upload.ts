import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { Request } from 'express';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      uploadedFilename?: string;
    }
  }
}

// Ensure upload directories exist
const ensureDirectoryExists = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Initialize upload directories
const uploadsDir = process.env.UPLOAD_DIR || './uploads';
const imagesDir = path.join(uploadsDir, 'images');
const reportsDir = path.join(uploadsDir, 'reports');

// Initialize public directories (accessible to all origins)
const publicDir = './public';
const publicImagesDir = path.join(publicDir, 'images');

ensureDirectoryExists(uploadsDir);
ensureDirectoryExists(imagesDir);
ensureDirectoryExists(reportsDir);
ensureDirectoryExists(publicDir);
ensureDirectoryExists(publicImagesDir);

// Storage configuration for images
const imageStorage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, imagesDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // Generate unique filename with timestamp and random string
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const filename = `image_${timestamp}_${uniqueSuffix}${extension}`;
    
    // Store filename in request for later copying to public directory
    req.uploadedFilename = filename;
    
    cb(null, filename);
  }
});

// Function to copy image to public directory after upload
export const copyToPublicDirectory = (req: Request) => {
  if (req.uploadedFilename && req.file) {
    const originalPath = req.file.path;
    const publicPath = path.join(publicImagesDir, req.uploadedFilename);
    
    try {
      fs.copyFileSync(originalPath, publicPath);
      console.log(`Image copied to public directory: ${publicPath}`);
    } catch (error) {
      console.error('Error copying image to public directory:', error);
    }
  }
};

// File filter for images
const imageFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/jpg').split(',');
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and JPG files are allowed.'));
  }
};

// Image upload configuration
export const uploadImage = multer({
  storage: imageStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
    files: 1
  }
});

// Middleware for handling upload errors
export const handleUploadError = (error: any, req: Request, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: 'File size too large. Maximum size is 10MB.'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Too many files. Only one file is allowed.'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Unexpected field name. Use "image" as the field name.'
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'File upload error.'
        });
    }
  }
  
  if (error.message === 'Invalid file type. Only JPEG, PNG, and JPG files are allowed.') {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
};

// Helper function to get file URL
export const getFileUrl = (filename: string, type: 'image' | 'report' = 'image') => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  return `${baseUrl}/uploads/${type}s/${filename}`;
};

// Helper function to get public image URL (accessible to all origins)
export const getPublicImageUrl = (filename: string) => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  return `${baseUrl}/public/images/${filename}`;
};

// Helper function to delete file
export const deleteFile = (filePath: string) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};