CREATE INDEX IF NOT EXISTS app_neighborhood_emergency__checkin_events_retention_idx
  ON app_neighborhood_emergency__checkin_events (created_at, id);
