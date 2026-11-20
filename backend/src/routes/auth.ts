import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { body, validationResult } from 'express-validator';
import { query } from '../database/db';
import { User, UserPayload } from '../types';
import { authenticate, AuthRequest } from '../middleware/auth';
import { sendEmail as sendMail, smtpConfigured } from '../services/mail';

const router = Router();

// Helper function to link co-host invitations to user account
async function linkCoHostInvitations(userId: number, email: string): Promise<void> {
  try {
    // Link any accepted co-host invitations that match this user's email
    // Only link invitations that have been accepted (accepted_at IS NOT NULL)
    await query(
      `UPDATE co_hosts
       SET user_id = $1
       WHERE email = $2 AND user_id IS NULL AND accepted_at IS NOT NULL`,
      [userId, email]
    );
    console.log(`Linked co-host invitations for ${email} to user ${userId}`);
  } catch (error) {
    console.error('Error linking co-host invitations:', error);
    // Don't throw - this shouldn't block login/signup
  }
}

router.post(
  '/signup',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('first_name').trim().notEmpty().withMessage('First name is required'),
    body('last_name').trim().notEmpty().withMessage('Last name is required')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).json({
          error: errors.array()[0].msg,
          errors: errors.array()
        });
      }

      const { email, password, first_name, last_name } = req.body;

      console.log('Signup attempt for email:', email);

      // Check JWT_SECRET is configured
      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET not configured!');
        return res.status(500).json({ error: 'Server configuration error - please contact support' });
      }

      const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
      if (existingUser.rows.length > 0) {
        console.log('Email already exists:', email);
        return res.status(400).json({ error: 'Email already registered' });
      }

      const password_hash = await bcrypt.hash(password, 10);

      const result = await query(
        'INSERT INTO users (email, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING id, email, first_name, last_name, charity_page_slug',
        [email, password_hash, first_name, last_name]
      );

      const user = result.rows[0];
      const token = jwt.sign(
        { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name } as UserPayload,
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      // Link any pending co-host invitations
      await linkCoHostInvitations(user.id, user.email);

      console.log('User created successfully:', user.email);
      res.status(201).json({
        token,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          charity_page_slug: user.charity_page_slug
        }
      });
    } catch (error: unknown) {
      console.error('Signup error details:', {
        message: error.message,
        code: error.code,
        detail: error.detail,
        stack: error.stack
      });

      // Provide more specific error messages
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Email already registered' });
      }
      if (error.code === '42P01') {
        return res.status(500).json({ error: 'Database not initialized - please contact support' });
      }
      if (error.code === 'ECONNREFUSED') {
        return res.status(500).json({ error: 'Database connection error - please try again later' });
      }

      res.status(500).json({ error: 'Server error - please try again or contact support' });
    }
  }
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      const result = await query('SELECT id, email, first_name, last_name, password_hash, charity_page_slug FROM users WHERE email = $1', [email]);
      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user: User = result.rows[0];

      const isValidPassword = await bcrypt.compare(password, user.password_hash);

      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name } as UserPayload,
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      // Link any pending co-host invitations
      await linkCoHostInvitations(user.id, user.email);

      const userPayload = {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        charity_page_slug: user.charity_page_slug
      };

      res.json({ token, user: userPayload });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Forgot password - generate reset token
router.post(
  '/forgot-password',
  [body('email').isEmail().normalizeEmail()],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email } = req.body;

      const result = await query('SELECT id, email, first_name FROM users WHERE email = $1', [email]);

      // Always return success to prevent email enumeration
      if (result.rows.length === 0) {
        return res.json({ message: 'If that email exists, a password reset link has been sent.' });
      }

      const user = result.rows[0];

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

      await query(
        'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE email = $3',
        [resetToken, resetTokenExpires, email]
      );

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

      const resetText = `You requested a password reset for your Impact Gift account.

Open this link to set a new password (expires in 1 hour):
${resetUrl}

If you did not request this, you can ignore this email.
`;

      const mailResult = await sendMail({
        to: email,
        subject: 'Reset Your Password - Impact Gift',
        text: resetText,
        html: resetText.replace(/\n/g, '<br>'),
      });

      if (mailResult.success) {
        console.log('Password reset email sent to:', email);
      }

      const response: Record<string, unknown> = {
        message: 'If that email exists, a password reset link has been sent.',
      };

      if (!smtpConfigured()) {
        response.resetUrl = resetUrl;
      }

      res.json(response);
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Reset password with token
router.post(
  '/reset-password',
  [
    body('token').trim().notEmpty(),
    body('password').isLength({ min: 6 })
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { token, password } = req.body;

      const result = await query(
        'SELECT id FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()',
        [token]
      );

      if (result.rows.length === 0) {
        return res.status(400).json({ error: 'Invalid or expired reset token' });
      }

      const user = result.rows[0];
      const password_hash = await bcrypt.hash(password, 10);

      await query(
        'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
        [password_hash, user.id]
      );

      res.json({ message: 'Password reset successfully' });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Get current user - used to validate token
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      'SELECT id, email, first_name, last_name, charity_page_slug FROM users WHERE id = $1',
      [req.user!.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
