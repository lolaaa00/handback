import { describe, expect, it } from "vitest";
import { NETWORK, explorerAddress, explorerTransaction } from "@/lib/network";

describe("network discipline", () => {
  it("uses stable Studionet", () => {
    expect(NETWORK.chainId).toBe(61999);
    expect(NETWORK.rpc).toBe("https://studio.genlayer.com/api");
    expect(NETWORK.chainHex).toBe("0xf22f");
  });
  it("creates Studionet explorer links", () => {
    expect(explorerTransaction("0xabc")).toBe(
      "https://genlayer-explorer.vercel.app/transactions/0xabc",
    );
    expect(explorerAddress("0xdef")).toBe(
      "https://genlayer-explorer.vercel.app/address/0xdef",
    );
  });
});
