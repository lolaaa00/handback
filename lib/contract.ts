import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionHashVariant } from "genlayer-js/types";
import { CONTRACT_ADDRESS, contractConfigured } from "./network";
import type { Eip1193Provider } from "./provider";

type Address = `0x${string}`;
type ReadClient = { readContract(request: Record<string, unknown>): Promise<unknown> };
type WriteClient = { writeContract(request: Record<string, unknown>): Promise<Address> };

export async function readHandback(functionName: string, args: unknown[] = []) {
  if (!contractConfigured()) throw new Error("Handback contract is not configured.");
  const client = createClient({ chain: studionet }) as unknown as ReadClient;
  return client.readContract({
    address: CONTRACT_ADDRESS as Address,
    functionName,
    args,
    transactionHashVariant: TransactionHashVariant.LATEST_FINAL,
  });
}

export async function writeHandback(
  provider: Eip1193Provider,
  account: Address,
  functionName: string,
  args: unknown[] = [],
  value = 0n,
) {
  if (!contractConfigured()) throw new Error("Handback contract is not configured.");
  const client = createClient({ chain: studionet, provider, account } as never) as unknown as WriteClient;
  return client.writeContract({ address: CONTRACT_ADDRESS as Address, functionName, args, value });
}

