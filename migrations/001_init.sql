-- Key/value settings, written only through /api/admin-config (app_config policy).
--   coordinator_group_id : hub group id whose members may broadcast storm check-ins
CREATE TABLE IF NOT EXISTS app_neighborhood_emergency__settings (
  key   TEXT NOT NULL,
  value TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (key)
);

CREATE TABLE IF NOT EXISTS app_neighborhood_emergency__resources (
  id TEXT PRIMARY KEY,
  member_id TEXT NOT NULL,
  member_name TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'equipment',
  label TEXT NOT NULL,
  detail TEXT DEFAULT '',
  visibility TEXT NOT NULL DEFAULT 'everyone',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS app_neighborhood_emergency__contacts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  area TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS app_neighborhood_emergency__checkin_events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT DEFAULT '',
  active INTEGER NOT NULL DEFAULT 1,
  created_by TEXT NOT NULL,
  created_by_name TEXT NOT NULL,
  created_at TEXT NOT NULL,
  closed_at TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS app_neighborhood_emergency__checkin_responses (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  member_id TEXT NOT NULL,
  member_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ok',
  note TEXT DEFAULT '',
  responded_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS app_neighborhood_emergency__resources_member_idx ON app_neighborhood_emergency__resources(member_id, kind);
CREATE INDEX IF NOT EXISTS app_neighborhood_emergency__contacts_order_idx ON app_neighborhood_emergency__contacts(sort_order);
CREATE INDEX IF NOT EXISTS app_neighborhood_emergency__events_active_idx ON app_neighborhood_emergency__checkin_events(active, created_at);
CREATE INDEX IF NOT EXISTS app_neighborhood_emergency__responses_event_idx ON app_neighborhood_emergency__checkin_responses(event_id);
