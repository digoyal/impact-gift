import api from './api';
import type { Guest } from '../types';

/** Returns the event guest for an invite email, or null if not on the list. */
export async function findGuestByEmail(eventId: number, email: string): Promise<Guest | null> {
  const trimmed = email.trim();
  if (!trimmed) return null;
  try {
    const response = await api.get(`/guests/find-by-email/${eventId}/${encodeURIComponent(trimmed)}`);
    return response.data as Guest;
  } catch {
    return null;
  }
}