import { describe, it, expect } from "vitest";
import {
  STATUSES, statusOf, isCoordinator, activeEvent, myResponse, resourcesByKind, countStatuses, searchableFields,
} from "../src/logic.js";

describe("statusOf", () => {
  it("resolves a known status", () => expect(statusOf("help").pill).toBe("bad"));
  it("defaults to the first status for unknown", () => expect(statusOf("nope")).toBe(STATUSES[0]));
});

describe("isCoordinator", () => {
  const groups = [{ id: "g-coord", memberIds: ["m-in"] }];
  it("hub admins are always coordinators", () => {
    expect(isCoordinator({ id: "x" }, true, "", [])).toBe(true);
  });
  it("members of the configured group qualify", () => {
    expect(isCoordinator({ id: "m-in" }, false, "g-coord", groups)).toBe(true);
  });
  it("non-members do not qualify", () => {
    expect(isCoordinator({ id: "m-out" }, false, "g-coord", groups)).toBe(false);
  });
  // Contract: no "all adults" fallback when the group is unset or dangling.
  it("is false when the coordinator group is unconfigured", () => {
    expect(isCoordinator({ id: "m-in" }, false, "", groups)).toBe(false);
  });
  it("is false when the configured group no longer exists", () => {
    expect(isCoordinator({ id: "m-in" }, false, "g-gone", groups)).toBe(false);
  });
  it("is false with no member", () => {
    expect(isCoordinator(null, false, "g-coord", groups)).toBe(false);
  });
});

describe("activeEvent", () => {
  it("finds the active event", () => {
    expect(activeEvent([{ id: "1", active: 0 }, { id: "2", active: 1 }]).id).toBe("2");
  });
  it("is undefined when none active", () => {
    expect(activeEvent([{ id: "1", active: 0 }])).toBeUndefined();
  });
});

describe("myResponse", () => {
  const responses = [{ event_id: "e1", member_id: "m1", status: "ok" }];
  it("finds the caller's response", () => expect(myResponse(responses, "e1", "m1").status).toBe("ok"));
  it("returns null otherwise", () => expect(myResponse(responses, "e1", "m2")).toBe(null));
});

describe("resourcesByKind", () => {
  const resources = [{ kind: "skill" }, { kind: "equipment" }, { kind: "skill" }];
  it("filters by kind", () => expect(resourcesByKind(resources, "skill")).toHaveLength(2));
});

describe("countStatuses", () => {
  const responses = [
    { event_id: "e1", status: "ok" },
    { event_id: "e1", status: "ok" },
    { event_id: "e1", status: "help" },
    { event_id: "e2", status: "power" },
  ];
  it("counts each status for an event", () => {
    const counts = countStatuses(responses, "e1");
    expect(counts.map(c => c.n)).toEqual([2, 0, 1]); // ok, power, help
  });
});

describe("searchableFields", () => {
  it("matches on role and area — how a phone tree is actually used", () => {
    const fields = searchableFields({ name: "Jo Diaz", role: "Gas emergency", area: "North block", phone: "0800 111222", notes: "" });
    expect(fields).toContain("Gas emergency");
    expect(fields).toContain("North block");
  });
});
