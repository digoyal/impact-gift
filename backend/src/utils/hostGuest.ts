import { query } from '../database/db';
import type { UserPayload } from '../types';

/** Record the event creator as attending (no invitation required). */
export async function insertCreatorAsAttendingGuest(
  eventId: number,
  user: UserPayload,
  hostDisplayName?: string | null
): Promise<void> {
  const name =
    hostDisplayName?.trim() ||
    [user.first_name, user.last_name].filter(Boolean).join(' ').trim() ||
    null;

  await query(
    `INSERT INTO guests (event_id, email, name, rsvp_status, rsvp_at, invitation_sent, invitation_sent_at)
     VALUES ($1, $2, $3, 'attending', CURRENT_TIMESTAMP, true, CURRENT_TIMESTAMP)
     ON CONFLICT (event_id, email) DO UPDATE SET
       rsvp_status = 'attending',
       invitation_sent = true,
       invitation_sent_at = COALESCE(guests.invitation_sent_at, CURRENT_TIMESTAMP)`,
    [eventId, user.email.toLowerCase(), name]
  );
}