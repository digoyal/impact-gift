/**
 * Parse a date string (YYYY-MM-DD) as a local date without timezone conversion
 * This prevents the common issue where "2026-03-31" becomes "2026-03-30" due to UTC conversion
 */
export function parseLocalDate(dateString: string): Date {
  if (!dateString) {
    return new Date();
  }

  // Split the date string to get year, month, day
  const parts = dateString.split('T')[0].split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
  const day = parseInt(parts[2], 10);

  // Create date in local timezone
  return new Date(year, month, day);
}

/**
 * Format a time string (HH:MM or HH:MM:SS) to 12-hour format with AM/PM
 * @param timeString - Time in 24-hour format (e.g., "18:27:00" or "18:27")
 * @returns Formatted time in 12-hour format (e.g., "6:27 PM")
 */
export function formatTime(timeString: string): string {
  if (!timeString) return '';

  // Parse the time string
  const parts = timeString.split(':');
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];

  // Determine AM/PM
  const period = hours >= 12 ? 'PM' : 'AM';

  // Convert to 12-hour format
  hours = hours % 12 || 12; // Convert 0 to 12 for midnight, 13-23 to 1-11

  return `${hours}:${minutes} ${period}`;
}

const GMT_OFFSET_ZONE = /^GMT[+-]\d/i;

/** Short viewer timezone label (e.g. PT, ET) — never GMT+N offsets. */
function localTimeZoneLabel(when: Date): string {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const readZone = (timeZoneName: Intl.DateTimeFormatOptions['timeZoneName']) =>
    new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName })
      .formatToParts(when)
      .find((part) => part.type === 'timeZoneName')?.value ?? '';

  const generic = readZone('shortGeneric');
  if (generic && !GMT_OFFSET_ZONE.test(generic)) {
    return generic;
  }

  const short = readZone('short');
  if (short && !GMT_OFFSET_ZONE.test(short)) {
    return short;
  }

  return '';
}

/**
 * Event start time in 12-hour form with a short timezone label (local display).
 */
export function formatEventTimeWithZone(timeString: string | undefined, eventDate: string): string {
  if (!timeString) return '';

  const formatted = formatTime(timeString);
  const parts = timeString.split(':');
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1] ?? '0', 10);
  const when = parseLocalDate(eventDate);
  when.setHours(hours, minutes, 0, 0);

  const zone = localTimeZoneLabel(when);

  return zone ? `${formatted} ${zone}` : formatted;
}

/** Whether the calendar date is before today (local). */
export function isEventDatePast(eventDate: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDay = parseLocalDate(eventDate);
  eventDay.setHours(0, 0, 0, 0);
  return eventDay < today;
}
