-- Track whether organizer enabled Impact Gift (charitable giving) for the event

ALTER TABLE events
ADD COLUMN IF NOT EXISTS impact_gift_enabled BOOLEAN DEFAULT false;

-- Events that already have linked charities were fundraising events
UPDATE events e
SET impact_gift_enabled = true
WHERE e.impact_gift_enabled IS NOT TRUE
  AND (
    e.charity_id IS NOT NULL
    OR EXISTS (SELECT 1 FROM event_charities ec WHERE ec.event_id = e.id)
  );

COMMENT ON COLUMN events.impact_gift_enabled IS 'Organizer enabled Impact Gift (guest donations to charities) for this event';