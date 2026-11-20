const PLACEHOLDER_RESEND_KEY_PATTERNS = [
  'your_resend',
  're_your_resend_api_key',
  'changeme',
];

/** True when RESEND_API_KEY is set to a real key (not empty / .env.example placeholder). */
export function isResendConfigured(): boolean {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return false;
  const lower = key.toLowerCase();
  return !PLACEHOLDER_RESEND_KEY_PATTERNS.some((p) => lower.includes(p));
}

export function getResendFromEmail(): string {
  return (
    process.env.RESEND_FROM_EMAIL ||
    process.env.FROM_EMAIL ||
    'Impact Gift <noreply@giftwithimpact.com>'
  );
}