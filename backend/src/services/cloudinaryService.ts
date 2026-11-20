import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import type { Request, Response, NextFunction } from 'express';

const CLOUDINARY_PLACEHOLDER_PATTERNS = ['your_cloud', 'your_api', 'your_secret', 'changeme'];

function isPlaceholderValue(value: string | undefined): boolean {
  if (!value?.trim()) return true;
  const lower = value.toLowerCase();
  return CLOUDINARY_PLACEHOLDER_PATTERNS.some((p) => lower.includes(p));
}

/** True when all three Cloudinary env vars are set to real values (not .env.example placeholders). */
export function isCloudinaryConfigured(): boolean {
  const name = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (isPlaceholderValue(name) || isPlaceholderValue(key) || isPlaceholderValue(secret)) {
    return false;
  }
  return !!(name && key && secret);
}

const CLOUDINARY_NOT_CONFIGURED_MESSAGE =
  'Image uploads are not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to backend/.env (Cloudinary dashboard → Programmable Media).';

/** Run before multer so uploads fail fast without calling Cloudinary with placeholder keys. */
export function requireCloudinaryUpload(req: Request, res: Response, next: NextFunction) {
  if (!isCloudinaryConfigured()) {
    return res.status(503).json({
      error: CLOUDINARY_NOT_CONFIGURED_MESSAGE,
      code: 'CLOUDINARY_NOT_CONFIGURED',
    });
  }
  next();
}

// Configure Cloudinary only when credentials are real
if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Create Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'impact-gift/events',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [
        { width: 1200, height: 630, crop: 'limit' }, // Limit max size
        { quality: 'auto:good' }, // Auto optimize quality
        { fetch_format: 'auto' } // Auto format (WebP when supported)
      ],
    };
  },
});

// Create multer upload middleware
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed!'));
      return;
    }
    cb(null, true);
  },
});

/**
 * Delete an image from Cloudinary
 */
export async function deleteImage(publicId: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!publicId) {
      return { success: false, error: 'No public ID provided' };
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      console.log('Image deleted successfully:', publicId);
      return { success: true };
    } else {
      console.warn('Image deletion result:', result);
      return { success: false, error: result.result };
    }
  } catch (error: unknown) {
    console.error('Failed to delete image:', error);
    return { success: false, error: error.message };
  }
}

export default {
  upload,
  deleteImage,
  isCloudinaryConfigured,
  requireCloudinaryUpload,
  cloudinary,
};
