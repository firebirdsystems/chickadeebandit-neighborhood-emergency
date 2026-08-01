-- Storm check-ins were `adult_writable`: the coordinator gate lived only in the
-- client (`isCoordinator()`) and on notification_acls.send, so ANY adult could
-- insert an active check-in straight through /api/db and light the red
-- `severity: "alert"` glance badge for the whole neighborhood.
--
-- The fix needs a policy that can name the coordinator group, and
-- `adult_writable` does not accept privileged_groups — `owner_or_visibility`
-- does. This column is what lets it apply: every check-in is visibility
-- 'everyone' so reads stay open to the whole community (including children, who
-- must be able to see and answer a check-in), while write_privileged_only +
-- privileged_groups narrows INSERT/UPDATE/DELETE to the same
-- settings.coordinator_group_id the notification ACL already enforces.
--
-- `visibility` is a hub built-in plaintext column, so no db_plaintext_columns
-- entry is needed for the policy to compare it.
ALTER TABLE app_neighborhood_emergency__checkin_events
  ADD COLUMN visibility TEXT NOT NULL DEFAULT 'everyone';
