"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFile = exports.getPublicImageUrl = exports.getFileUrl = exports.handleUploadError = exports.uploadImage = exports.copyToPublicDirectory = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const crypto_1 = __importDefault(require("crypto"));
const ensureDirectoryExists = (dirPath) => {
    try {
        if (!fs_1.default.existsSync(dirPath)) {
            fs_1.default.mkdirSync(dirPath, { recursive: true });
        }
    }
    catch (error) {
        console.warn(`Warning: Could not create directory ${dirPath}:`, error);
    }
};
const getUploadDirs = () => {
    const uploadsDir = process.env.UPLOAD_DIR || (process.env.NODE_ENV === 'production' ? '/tmp/uploads' : './uploads');
    const imagesDir = path_1.default.join(uploadsDir, 'images');
    const reportsDir = path_1.default.join(uploadsDir, 'reports');
    const publicDir = process.env.NODE_ENV === 'production' ? '/tmp/public' : './public';
    const publicImagesDir = path_1.default.join(publicDir, 'images');
    return { uploadsDir, imagesDir, reportsDir, publicDir, publicImagesDir };
};
const imageStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const { imagesDir } = getUploadDirs();
        ensureDirectoryExists(imagesDir);
        cb(null, imagesDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = crypto_1.default.randomBytes(16).toString('hex');
        const timestamp = Date.now();
        const extension = path_1.default.extname(file.originalname);
        const filename = `image_${timestamp}_${uniqueSuffix}${extension}`;
        req.uploadedFilename = filename;
        cb(null, filename);
    }
});
const copyToPublicDirectory = (req) => {
    if (req.uploadedFilename && req.file) {
        const { publicImagesDir } = getUploadDirs();
        const originalPath = req.file.path;
        const publicPath = path_1.default.join(publicImagesDir, req.uploadedFilename);
        try {
            ensureDirectoryExists(publicImagesDir);
            fs_1.default.copyFileSync(originalPath, publicPath);
            console.log(`Image copied to public directory: ${publicPath}`);
        }
        catch (error) {
            console.error('Error copying image to public directory:', error);
        }
    }
};
exports.copyToPublicDirectory = copyToPublicDirectory;
const imageFileFilter = (req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/jpg').split(',');
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and JPG files are allowed.'));
    }
};
exports.uploadImage = (0, multer_1.default)({
    storage: imageStorage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'),
        files: 1
    }
});
const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer_1.default.MulterError) {
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
exports.handleUploadError = handleUploadError;
const getFileUrl = (filename, type = 'image') => {
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    return `${baseUrl}/uploads/${type}s/${filename}`;
};
exports.getFileUrl = getFileUrl;
const getPublicImageUrl = (filename) => {
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    return `${baseUrl}/public/images/${filename}`;
};
exports.getPublicImageUrl = getPublicImageUrl;
const deleteFile = (filePath) => {
    try {
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
            return true;
        }
        return false;
    }
    catch (error) {
        console.error('Error deleting file:', error);
        return false;
    }
};
exports.deleteFile = deleteFile;
//# sourceMappingURL=upload.js.map