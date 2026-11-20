-- Event creators are auto-added as attending guests; they should not appear as pending invites
UPDATE guests g
SET invitation_sent = true,
    invitation_sent_at = COALESCE(g.invitation_sent_at, CURRENT_TIMESTAMP)
FROM events e
JOIN users u ON e.user_id = u.id
WHERE g.event_id = e.id
  AND LOWER(g.email) = LOWER(u.email)
  AND g.invitation_sent IS NOT TRUE;