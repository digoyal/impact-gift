import { query } from '../database/db';

export const GUEST_LIST_FORBIDDEN_MESSAGE =
  "You're not on the guest list for this event";

/** True when the email is an invited guest row for this event. */
export async function isGuestOnList(eventId: number, email: string): Promise<boolean> {
  const trimmed = (email || '').trim();
  if (!trimmed) return false;
  const result = await query(
    'SELECT id FROM guests WHERE event_id = $1 AND LOWER(email) = LOWER($2)',
    [eventId, trimmed]
  );
  return result.rows.length > 0;
}