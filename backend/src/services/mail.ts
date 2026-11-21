import nodemailer from 'nodemailer';

export const SMTP_NOT_CONFIGURED_NOTE =
  'SMTP not configured. Email preview was written to the API server log.';

export function smtpConfigured(): boolean {
  return Boolean((process.env.SMTP_HOST || '').trim());
}

export function getSmtpFrom(): string {
  const from = (process.env.SMTP_FROM || '').trim();
  if (from) return from;
  const user = (process.env.SMTP_USER || '').trim();
  if (user) return user;
  return 'Impact Gift <noreply@localhost>';
}

export type MailSendResult = {
  success: boolean;
  note?: string;
  error?: string;
  message?: string;
};

export type SendMailParams = {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  from?: string;
  replyTo?: string;
};

function formatPreviewBody(text: string, html?: string): string {
  if (!html) return text;
  return `${text}\n\n--- HTML body ---\n${html}`;
}

/** Map common SMTP auth failures to actionable copy (no secrets). */
function userFacingSmtpError(errMsg: string): string {
  const lower = errMsg.toLowerCase();
  const gmailAuthRejected =
    lower.includes('535') ||
    lower.includes('badcredentials') ||
    lower.includes('username and password not accepted');
  if (gmailAuthRejected && (process.env.SMTP_HOST || '').includes('gmail')) {
  const passLen = (process.env.SMTP_PASSWORD || '').trim().length;
  const appPasswordHint =
    passLen !== 16
      ? ` SMTP_PASSWORD is ${passLen} characters; Google App Passwords are 16 characters.`
      : '';
    return `Gmail SMTP: use a Google App Password in SMTP_PASSWORD (not your account password).${appPasswordHint}`;
  }
  return errMsg;
}

/**
 * Send email via SMTP, or log full message to stdout when SMTP_HOST is unset (local/dev).
 */
export async function sendEmail(params: SendMailParams): Promise<MailSendResult> {
  const { to, subject, text, html, from, replyTo } = params;
  const recipients = Array.isArray(to) ? to.join(', ') : to;
  const fromAddr = from || getSmtpFrom();

  if (!smtpConfigured()) {
    const preview = formatPreviewBody(text, html);
    const msg = `SMTP not configured — email not sent.\nTo: ${recipients}\nSubject: ${subject}\n\n${preview}`;
    console.log(msg);
    console.warn('[mail]', msg);
    return {
      success: false,
      note: SMTP_NOT_CONFIGURED_NOTE,
      message: 'SMTP not configured',
    };
  }

  try {
    const host = process.env.SMTP_HOST!.trim();
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const useTls =
      process.env.SMTP_USE_TLS === undefined ||
      process.env.SMTP_USE_TLS === '' ||
      process.env.SMTP_USE_TLS === 'true' ||
      process.env.SMTP_USE_TLS === '1';
    const user = (process.env.SMTP_USER || '').trim();
    const password = process.env.SMTP_PASSWORD || '';

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: user ? { user, pass: password } : undefined,
      ...(useTls && port !== 465 ? { requireTLS: true } : {}),
    });

    const info = await transporter.sendMail({
      from: fromAddr,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      text,
      ...(html ? { html } : {}),
      ...(replyTo ? { replyTo } : {}),
    });

    console.log('[mail] sent:', info.messageId);
    return { success: true, message: 'Email sent' };
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Failed to send email';
    console.error('[mail] send failed:', errMsg);
    const friendly = userFacingSmtpError(errMsg);
    return { success: false, error: friendly, message: friendly };
  }
}