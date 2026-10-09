import { describe, expect, it } from "vitest";
import { findCreatedCommitment, nextCriterionId, parseGen } from "@/lib/agreement";
import type { Commitment } from "@/lib/types";

const commitment = (id: number, title: string): Commitment => ({
  id,
  client: "0x1111111111111111111111111111111111111111",
  worker: "0x2222222222222222222222222222222222222222",
  title,
  brief: "Public delivery",
  criteria: [],
  escrow: "1",
  state: "OFFERED",
  accept_by: 1,
  deliver_by: 2,
  cure_window_seconds: 3,
  accepted_at: 0,
  evidence_version: 0,
  evidence_digest: "",
  corrections_used: 0,
  repair_required: false,
  resubmit_by: 0,
  judgment: "",
  judged_version: 0,
  client_cancel: false,
  worker_cancel: false,
  settled_to: "",
  settled_amount: "0",
});

describe("agreement input safety", () => {
  it("converts GEN to wei without floating-point rounding", () => {
    expect(parseGen("0.000000000000000001")).toBe(1n);
    expect(parseGen("1.25")).toBe(1_250_000_000_000_000_000n);
    expect(parseGen("0")).toBeNull();
    expect(parseGen("0.0000000000000000001")).toBeNull();
    expect(parseGen("1e3")).toBeNull();
  });

  it("does not reuse an ID after a criterion is removed", () => {
    expect(nextCriterionId([
      { id: "criterion-1", requirement: "a", proof: "a" },
      { id: "criterion-3", requirement: "c", proof: "c" },
    ])).toBe("criterion-4");
  });

  it("recovers the newest matching funded agreement for its tracked route", () => {
    const found = findCreatedCommitment(
      [commitment(2, "Different"), commitment(3, "Launch"), commitment(7, "Launch")],
      {
        client: "0x1111111111111111111111111111111111111111",
        worker: "0x2222222222222222222222222222222222222222",
        title: "Launch",
        brief: "Public delivery",
      },
    );
    expect(found?.id).toBe(7);
    expect(`/m/${found?.id}`).toBe("/m/7");
  });
});
