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
    `INSERT INTO guests (event_id, email, name, rsvp_status, rsvp_at)
     VALUES ($1, $2, $3, 'attending', CURRENT_TIMESTAMP)
     ON CONFLICT (event_id, email) DO NOTHING`,
    [eventId, user.email.toLowerCase(), name]
  );
}