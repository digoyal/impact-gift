/** @deprecated Resend removed — use SMTP via `services/mail.ts` */
import { getSmtpFrom, smtpConfigured, SMTP_NOT_CONFIGURED_NOTE } from '../services/mail';

export function isResendConfigured(): boolean {
  return smtpConfigured();
}

export function getResendFromEmail(): string {
  return getSmtpFrom();
}

export { SMTP_NOT_CONFIGURED_NOTE };