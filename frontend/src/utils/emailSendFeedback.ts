import toast from 'react-hot-toast';

export type EmailSendResponse = {
  message?: string;
  email_sent?: boolean;
  email_note?: string;
  error?: string;
  errors?: unknown[];
};

export function toastEmailSendResult(data: EmailSendResponse | undefined) {
  if (!data) {
    toast.error('No response from server');
    return;
  }

  if (data.email_sent === false) {
    toast.error(
      data.email_note ||
        data.error ||
        'No emails were sent. Without SMTP_HOST, check the API server console for the message preview.'
    );
    return;
  }

  const base = data.message || 'Sent successfully';
  if (data.email_note) {
    toast.success(`${base} ${data.email_note}`);
  } else {
    toast.success(base);
  }
}

export function toastEmailSendError(data: Record<string, unknown> | undefined, fallback: string) {
  const note = typeof data?.email_note === 'string' ? data.email_note : undefined;
  const err = typeof data?.error === 'string' ? data.error : undefined;
  toast.error(note || err || fallback);
}