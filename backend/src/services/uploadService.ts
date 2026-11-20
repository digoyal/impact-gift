import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import type { Request } from 'express';

/** Directory for uploaded event images (gitignored). */
export const LOCAL_UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');
export const LOCAL_EVENTS_SUBDIR = 'events';

export function ensureLocalUploadsDir(): void {
  fs.mkdirSync(path.join(LOCAL_UPLOADS_DIR, LOCAL_EVENTS_SUBDIR), { recursive: true });
}

function imageExtension(mimetype: string, originalname: string): string {
  const fromName = path.extname(originalname || '').toLowerCase();
  if (fromName && /^\.[a-z0-9]+$/.test(fromName)) {
    return fromName;
  }
  const map: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
  };
  return map[mimetype] || '.jpg';
}

/** Public base URL for uploaded files (no trailing slash). */
export function getPublicBaseUrl(req?: Request): string {
  const fromEnv = process.env.BACKEND_PUBLIC_URL?.replace(/\/$/, '');
  if (fromEnv) return fromEnv;
  if (req) {
    const host = req.get('host');
    if (host) return `${req.protocol}://${host}`;
  }
  return `http://localhost:${process.env.PORT || 5000}`;
}

export function fileToUploadMeta(
  file: Express.Multer.File,
  req?: Request
): { imageUrl: string; publicId: string; url: string } {
  const relative = `${LOCAL_EVENTS_SUBDIR}/${file.filename}`;
  const publicId = `local/${relative}`;
  const imageUrl = `${getPublicBaseUrl(req)}/api/uploads/${relative}`;
  return { imageUrl, publicId, url: imageUrl };
}

const multerLimits = { fileSize: 5 * 1024 * 1024 };

const imageFileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    cb(new Error('Only image files are allowed!'));
    return;
  }
  cb(null, true);
};

ensureLocalUploadsDir();

const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(LOCAL_UPLOADS_DIR, LOCAL_EVENTS_SUBDIR));
  },
  filename: (_req, file, cb) => {
    cb(null, `${randomUUID()}${imageExtension(file.mimetype, file.originalname)}`);
  },
});

export const upload = multer({
  storage: diskStorage,
  limits: multerLimits,
  fileFilter: imageFileFilter,
});

/**
 * Delete a locally stored image (public_id `local/events/...`).
 * Legacy non-local ids are no-ops (success).
 */
export async function deleteImage(publicId: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!publicId) {
      return { success: false, error: 'No public ID provided' };
    }

    if (!publicId.startsWith('local/')) {
      return { success: true };
    }

    const relative = publicId.slice('local/'.length);
    const fullPath = path.join(LOCAL_UPLOADS_DIR, relative);
    const uploadsRoot = path.resolve(LOCAL_UPLOADS_DIR);
    const resolved = path.resolve(fullPath);
    if (!resolved.startsWith(uploadsRoot + path.sep) && resolved !== uploadsRoot) {
      return { success: false, error: 'Invalid local public id' };
    }

    try {
      await fs.promises.unlink(resolved);
      return { success: true };
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err && (err as NodeJS.ErrnoException).code === 'ENOENT') {
        return { success: true };
      }
      throw err;
    }
  } catch (error: unknown) {
    console.error('Failed to delete image:', error);
    const message = error instanceof Error ? error.message : 'Delete failed';
    return { success: false, error: message };
  }
}