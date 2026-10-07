import { describe, expect, it } from "vitest";
import { availableActions, roleFor } from "@/lib/actions";
import type { Commitment } from "@/lib/types";

const base: Commitment = {
  id: 1, client: "0x1111111111111111111111111111111111111111", worker: "0x2222222222222222222222222222222222222222",
  title: "Work", brief: "Brief", criteria: [], escrow: "100", state: "OFFERED", accept_by: 200, deliver_by: 400,
  cure_window_seconds: 100, accepted_at: 0, evidence_version: 0, evidence_digest: "", corrections_used: 0,
  repair_required: false, resubmit_by: 0, judgment: "", judged_version: 0, client_cancel: false, worker_cancel: false,
  settled_to: "", settled_amount: 0,
};

describe("role and action policy", () => {
  it("matches roles case-insensitively", () => {
    expect(roleFor(base, base.client.toUpperCase())).toBe("client");
    expect(roleFor(base, base.worker)).toBe("worker");
    expect(roleFor(base, null)).toBe("observer");
  });
  it("shows acceptance only to the named worker", () => {
    expect(availableActions(base, "worker", 100)).toEqual(["take_on", "decline_offer"]);
    expect(availableActions(base, "observer", 100)).toEqual([]);
  });
  it("makes assessment permissionless but not evidence submission", () => {
    expect(availableActions({ ...base, state: "SUBMITTED" }, "observer", 100)).toEqual(["assess_work"]);
    expect(availableActions({ ...base, state: "ACTIVE" }, "worker", 100)).toContain("present_work");
  });
  it("never offers a second terminal settlement", () => {
    expect(availableActions({ ...base, state: "RELEASED" }, "client", 999)).toEqual([]);
  });
  it("exposes expiry only after its deadline", () => {
    expect(availableActions(base, "observer", 201)).toContain("refund_expired");
    expect(availableActions(base, "observer", 199)).not.toContain("refund_expired");
  });
});

