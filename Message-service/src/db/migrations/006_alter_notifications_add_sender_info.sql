-- Add sender display columns and full-text search index to notifications table.
-- sender_name and sender_role_label are denormalized at send time so the inbox
-- thread list can render without calling the Laravel backend on every request.

ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS sender_name       VARCHAR(255) NULL AFTER sender_role,
  ADD COLUMN IF NOT EXISTS sender_role_label VARCHAR(255) NULL AFTER sender_name;

ALTER TABLE notifications
  ADD FULLTEXT INDEX IF NOT EXISTS idx_ft_search (subject, body);
