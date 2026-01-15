import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

/**
 * Image Upload Configuration
 * 
 * Options:
 * 1. Local Storage (for development)
 * 2. Cloud Storage (AWS S3, Cloudinary, etc.) - Recommended for production
 * 3. Direct URL (accept image URLs from frontend) - Simplest option
 */

// Option 1: Local Storage Configuration
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads', 'images');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // Generate unique filename: timestamp-random-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

// File filter for images only
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'));
  }
};

// Multer configuration for local storage
export const uploadLocal = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter,
});

// Option 2: Memory Storage (for cloud uploads)
// Use this if you want to upload to AWS S3, Cloudinary, etc.
export const uploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter,
});

/**
 * Helper function to get image URL
 * For local storage, returns relative path
 * For cloud storage, returns full URL
 */
export const getImageUrl = (filename: string, isLocal: boolean = true): string => {
  if (isLocal) {
    // Return URL path for local storage
    return `/uploads/images/${filename}`;
  }
  // For cloud storage, return the full URL
  return filename; // Assuming filename is already a full URL
};

/**
 * Example: Upload to Cloudinary
 * 
 * import cloudinary from 'cloudinary';
 * 
 * export const uploadToCloudinary = async (buffer: Buffer, folder: string = 'inventory'): Promise<string> => {
 *   return new Promise((resolve, reject) => {
 *     cloudinary.v2.uploader.upload_stream(
 *       { folder, resource_type: 'image' },
 *       (error, result) => {
 *         if (error) reject(error);
 *         else resolve(result.secure_url);
 *       }
 *     ).end(buffer);
 *   });
 * };
 */

/**
 * Example: Upload to AWS S3
 * 
 * import AWS from 'aws-sdk';
 * 
 * const s3 = new AWS.S3({
 *   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
 *   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
 * });
 * 
 * export const uploadToS3 = async (buffer: Buffer, filename: string, folder: string = 'inventory'): Promise<string> => {
 *   const params = {
 *     Bucket: process.env.AWS_BUCKET_NAME!,
 *     Key: `${folder}/${filename}`,
 *     Body: buffer,
 *     ContentType: 'image/jpeg',
 *     ACL: 'public-read',
 *   };
 * 
 *   const result = await s3.upload(params).promise();
 *   return result.Location;
 * };
 */

