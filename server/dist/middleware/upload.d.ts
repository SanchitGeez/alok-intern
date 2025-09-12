import multer from 'multer';
import { Request } from 'express';
declare global {
    namespace Express {
        interface Request {
            uploadedFilename?: string;
        }
    }
}
export declare const copyToPublicDirectory: (req: Request) => void;
export declare const uploadImage: multer.Multer;
export declare const handleUploadError: (error: any, req: Request, res: any, next: any) => any;
export declare const getFileUrl: (filename: string, type?: "image" | "report") => string;
export declare const getPublicImageUrl: (filename: string) => string;
export declare const deleteFile: (filePath: string) => boolean;
//# sourceMappingURL=upload.d.ts.map