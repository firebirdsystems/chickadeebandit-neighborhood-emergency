// Pure, testable logic extracted from index.html.
// No DOM, no network — safe to import from Node for unit tests.

export const STATUSES = [
  { id: "ok", label: "We're OK ✅", cls: "sel-ok", pill: "good" },
  { id: "power", label: "No power / water ⚡", cls: "sel-power", pill: "warn" },
  { id: "help", label: "Need help 🆘", cls: "sel-help", pill: "bad" },
];

export function statusOf(id) {
  return STATUSES.find(s => s.id === id) ?? STATUSES[0];
}

// Mirrors the hub's require_group_setting for notifications: a member may broadcast
// a storm check-in iff they are a hub admin, or the coordinator group is configured
// AND they belong to it. No "all adults" fallback — matches server enforcement.
export function isCoordinator(me, isAdmin, coordinatorGroupId, groups) {
  if (isAdmin) return true;
  if (!coordinatorGroupId || !me) return false;
  const g = groups.find(x => x.id === coordinatorGroupId);
  return !!g && (g.memberIds ?? []).includes(me.id);
}

export function activeEvent(events) {
  return events.find(e => e.active);
}

export function myResponse(responses, eventId, memberId) {
  return responses.find(r => r.event_id === eventId && r.member_id === memberId) ?? null;
}

export function resourcesByKind(resources, kind) {
  return resources.filter(r => r.kind === kind);
}

export function countStatuses(responses, eventId) {
  const rs = responses.filter(r => r.event_id === eventId);
  return STATUSES.map(s => ({ s, n: rs.filter(r => r.status === s.id).length }));
}
