import { describe, expect, it } from "vitest";
import { nextCriterionId, parseGen } from "@/lib/agreement";

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
});
