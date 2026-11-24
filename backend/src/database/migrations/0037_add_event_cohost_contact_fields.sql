-- Primary co-host contact on event details (invitations still use co_hosts table)

ALTER TABLE events
ADD COLUMN IF NOT EXISTS cohosts_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS cohost_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS cohost_phone VARCHAR(32);

COMMENT ON COLUMN events.cohosts_enabled IS 'When true, cohost_name/cohost_phone are shown on the event';
COMMENT ON COLUMN events.cohost_name IS 'Display name for primary co-host on event details';
COMMENT ON COLUMN events.cohost_phone IS 'Contact phone for primary co-host on event details';