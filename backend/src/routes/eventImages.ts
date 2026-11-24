import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { upload, deleteImage, fileToUploadMeta } from '../services/uploadService';
import { query } from '../database/db';
import { normalizeEventImageCaption } from '../utils/eventImageCaption';
import { isOwnerOrCoHost } from '../utils/coHostHelpers';

const router = Router();

/**
 * Upload event image
 * POST /api/event-images/upload
 */
router.post('/upload', authenticate, upload.single('image'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const file = req.file as Express.Multer.File;
    const meta = fileToUploadMeta(file, req);

    res.json({
      success: true,
      ...meta,
      message: 'Image uploaded successfully',
    });
  } catch (error: unknown) {
    console.error('Image upload error:', error);
    res.status(500).json({
      error: error.message || 'Failed to upload image'
    });
  }
});

/**
 * Update event with uploaded image
 * PUT /api/event-images/event/:eventId
 */
router.put('/event/:eventId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { eventId } = req.params;
    const { imageUrl, publicId, caption: captionRaw } = req.body;
    const updateCaption = Object.prototype.hasOwnProperty.call(req.body, 'caption');
    const caption = updateCaption ? normalizeEventImageCaption(captionRaw) : undefined;
    const userId = req.user!.id;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    const eventCheck = await query(
      'SELECT id, event_image_public_id FROM events WHERE id = $1',
      [eventId]
    );

    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const hasAccess = await isOwnerOrCoHost(userId, Number(eventId), req.user!.email);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const oldPublicId = eventCheck.rows[0].event_image_public_id;
    const nextPublicId = publicId || null;

    // Update event with new image
    if (updateCaption) {
      await query(
        `UPDATE events
         SET event_image_url = $1, event_image_public_id = $2, event_image_caption = $3::jsonb, updated_at = CURRENT_TIMESTAMP
         WHERE id = $4`,
        [imageUrl, publicId || null, caption ? JSON.stringify(caption) : null, eventId]
      );
    } else {
      await query(
        `UPDATE events
         SET event_image_url = $1, event_image_public_id = $2, updated_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [imageUrl, publicId || null, eventId]
      );
    }

    if (oldPublicId && oldPublicId !== nextPublicId) {
      await deleteImage(oldPublicId);
    }

    res.json({
      success: true,
      message: 'Event image updated successfully'
    });
  } catch (error: unknown) {
    console.error('Update event image error:', error);
    res.status(500).json({
      error: error.message || 'Failed to update event image'
    });
  }
});

/**
 * Delete event image
 * DELETE /api/event-images/event/:eventId
 */
router.delete('/event/:eventId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { eventId } = req.params;
    const userId = req.user!.id;

    // Verify event ownership and get image public ID
    const eventCheck = await query(
      'SELECT id, event_image_public_id FROM events WHERE id = $1 AND user_id = $2',
      [eventId, userId]
    );

    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found or unauthorized' });
    }

    const publicId = eventCheck.rows[0].event_image_public_id;

    // Remove image from event
    await query(
      `UPDATE events
       SET event_image_url = NULL, event_image_public_id = NULL, event_image_caption = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [eventId]
    );

    // Delete stored file when applicable
    if (publicId) {
      await deleteImage(publicId);
    }

    res.json({
      success: true,
      message: 'Event image removed successfully'
    });
  } catch (error: unknown) {
    console.error('Delete event image error:', error);
    res.status(500).json({
      error: error.message || 'Failed to delete event image'
    });
  }
});

export default router;
