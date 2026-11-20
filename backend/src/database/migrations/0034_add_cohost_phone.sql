-- Optional contact phone for co-hosts

ALTER TABLE co_hosts
ADD COLUMN IF NOT EXISTS phone VARCHAR(32);

COMMENT ON COLUMN co_hosts.phone IS 'Optional phone number for the co-host';