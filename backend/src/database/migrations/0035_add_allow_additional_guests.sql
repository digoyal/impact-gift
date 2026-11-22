-- Allow guests to RSVP with additional party members (when disabled, guests RSVP for self only)

ALTER TABLE events
ADD COLUMN IF NOT EXISTS allow_additional_guests BOOLEAN DEFAULT true;

UPDATE events SET allow_additional_guests = true WHERE allow_additional_guests IS NULL;

COMMENT ON COLUMN events.allow_additional_guests IS 'Whether invited guests may bring additional people when RSVPing';