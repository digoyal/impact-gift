import type { Event } from '../types';

type ImpactGiftFields = Pick<Event, 'impact_gift_enabled' | 'charities' | 'charity_id'>;

type CharityLinkedFields = Pick<Event, 'charities' | 'charity_id'>;

/** True when the event has at least one charity configured (junction or legacy charity_id). */
export function eventHasSelectedCharity(event: CharityLinkedFields | null | undefined): boolean {
  if (!event) return false;
  return !!(event.charities?.length || event.charity_id);
}

/** Impact Gift is on when flag is true, or legacy events with linked charities. */
export function isImpactGiftEnabled(event: ImpactGiftFields | null | undefined): boolean {
  if (!event) return false;
  if (event.impact_gift_enabled === true) return true;
  if (event.impact_gift_enabled === false) return false;
  return eventHasSelectedCharity(event);
}