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

// Whether a member may start or close a storm check-in. Mirrors the hub's rule
// for the checkin_events table (write_privileged_only): the coordinator group
// must be configured AND the member must belong to it. Being a hub admin or a
// space's steward grants nothing here, and there is no "all adults" fallback.
export function isCoordinator(me, coordinatorGroupId, groups) {
  if (!coordinatorGroupId || !me) return false;
  const g = groups.find(x => x.id === coordinatorGroupId);
  return !!g && (g.memberIds ?? []).includes(me.id);
}

// The hub's own test for an adult member (hub-sdk `isAdult`), repeated here so
// the role rule below can be unit-tested without the browser-only SDK.
function isAdultMember(member) {
  return !!member && (member.role === "adult" || member.role === "admin");
}

/**
 * Whether a member reads everyone's check-in responses. Mirrors the hub's rule
 * for the checkin_responses table (owner_only, readable by the coordinator
 * group): any adult in a household, the steward in a shared space, and the
 * coordinators anywhere, since whoever runs a check-in has to see who answered.
 * Everyone else reads their own response alone.
 */
export function seesAllResponses(member, { tenantKind = "household", isAdmin = false, coordinator = false } = {}) {
  if (!member) return false;
  return coordinator === true || (tenantKind === "household" ? isAdultMember(member) : isAdmin === true);
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

/**
 * Fields the in-app search matches against (see hub-sdk `searchMatch`).
 * Role and area count as well as the name — in an emergency the
 * phone tree is searched for "the gas people" or "north block", not for
 * somebody's surname.
 */
export function searchableFields(item) {
  return [item.name, item.role, item.area, item.phone, item.notes];
}

/**
 * The line a failed write shows ("Refused, gone, or failed" in the app-template guide):
 * "try again" only when retrying can work. `thing` and `action` are the app's own nouns
 * ("contact", "save the contact"). `found` is the caller's re-read after a write that
 * changed nothing (or a 404/409): false = the row is gone, true = it is there in another
 * state. A `forUser` error keeps the message the app wrote for it. Never shows hub text.
 */
export function failureLine(e, { action, thing, found } = {}) {
  if (e?.forUser) return e.message;
  if (e?.code === "UNIQUE_CONSTRAINT" || /UNIQUE constraint failed/i.test(String(e?.message ?? ""))) return `That ${thing} already exists.`;
  if (e?.status === 403) return `You don’t have permission to ${action}.`;
  if (e?.status === 507) return "The household’s storage is full — free up space first.";
  if (found === false || (found === undefined && e?.status === 404)) return `This ${thing} has been removed.`;
  if (found === true || e?.status === 409 || e?.status === 404) return `This ${thing} was changed by someone else — check it first.`;
  return `Couldn’t ${action} — try again.`;
}

/**
 * A plain `WHERE id = ?` write that changed nothing, after the caller's re-read: a row still
 * there was narrowed away from this member by the row policy (the permission line); no row
 * means it was removed. Nothing can have "changed" on an unguarded write.
 */
export function unchangedLine(found, { action, thing } = {}) {
  return found ? failureLine({ status: 403 }, { action, thing }) : failureLine(null, { action, thing, found: false });
}
