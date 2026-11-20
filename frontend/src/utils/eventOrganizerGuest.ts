import type { Event, Guest } from '../types';

export function getEventOwnerEmail(event: Pick<Event, 'owner_email'> | null | undefined): string | null {
  const email = event?.owner_email;
  return email ? email.toLowerCase() : null;
}

export function isOrganizerGuest(
  guest: Pick<Guest, 'email'>,
  ownerEmail: string | null | undefined
): boolean {
  if (!ownerEmail) return false;
  return guest.email.toLowerCase() === ownerEmail.toLowerCase();
}

/** Guests who should receive invitation emails / show in pending counts. */
export function isInvitableGuest(
  guest: Pick<Guest, 'email' | 'invitation_sent'>,
  ownerEmail: string | null | undefined
): boolean {
  if (isOrganizerGuest(guest, ownerEmail)) return false;
  return !guest.invitation_sent;
}