-- Optional positioned caption overlay on the event hero image

ALTER TABLE events
ADD COLUMN IF NOT EXISTS event_image_caption JSONB;

COMMENT ON COLUMN events.event_image_caption IS 'Caption overlay on event image: text, xPercent, yPercent, fontFamily, fontSizePx';