import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { ExecutionResult, TransactionStatus, type GenLayerTransaction, type TransactionHash } from "genlayer-js/types";

export type TxStage = "submitted" | "pending" | "consensus" | "accepted" | "finalizing" | "finalized" | "failed" | "undetermined";
export type PendingWrite = { hash: `0x${string}`; method: string; commitmentId?: number; submittedAt: number };

const KEY = "handback.pendingWrite.v1";
const client = createClient({ chain: studionet });

export function savePending(value: PendingWrite) {
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(value));
}

export function loadPending(): PendingWrite | null {
  if (typeof window === "undefined") return null;
  try {
    const value = JSON.parse(window.localStorage.getItem(KEY) ?? "null");
    return value && /^0x[a-fA-F0-9]{64}$/.test(value.hash) ? value : null;
  } catch { return null; }
}

export function clearPending(hash?: string) {
  if (typeof window === "undefined") return;
  const current = loadPending();
  if (!hash || current?.hash === hash) window.localStorage.removeItem(KEY);
}

function executionSucceeded(tx: GenLayerTransaction) {
  if (tx.txExecutionResultName === ExecutionResult.FINISHED_WITH_RETURN) return true;
  const receipt = (tx as unknown as { consensus_data?: { leader_receipt?: { execution_result?: string } | { execution_result?: string }[] } }).consensus_data?.leader_receipt;
  const normalized = Array.isArray(receipt) ? receipt[0] : receipt;
  return normalized?.execution_result === "SUCCESS";
}

export async function trackFinality(
  hash: `0x${string}`,
  onStage: (stage: TxStage) => void,
  timeoutMs = 8 * 60 * 1000,
) {
  const deadline = Date.now() + timeoutMs;
  const reader = client as unknown as { getTransaction(args: { hash: TransactionHash }): Promise<GenLayerTransaction> };
  onStage("submitted");
  while (Date.now() < deadline) {
    const tx = await reader.getTransaction({ hash: hash as TransactionHash });
    const status = tx.statusName;
    if (status === TransactionStatus.PENDING || status === TransactionStatus.UNINITIALIZED) onStage("pending");
    else if (status === TransactionStatus.PROPOSING || status === TransactionStatus.COMMITTING || status === TransactionStatus.REVEALING || status === TransactionStatus.APPEAL_COMMITTING || status === TransactionStatus.APPEAL_REVEALING) onStage("consensus");
    else if (status === TransactionStatus.ACCEPTED || status === TransactionStatus.READY_TO_FINALIZE) {
      onStage("accepted");
      onStage("finalizing");
    } else if (status === TransactionStatus.FINALIZED) {
      onStage("finalized");
      if (!executionSucceeded(tx)) { onStage("failed"); throw new Error("The transaction finalized, but contract execution did not succeed."); }
      return tx;
    } else if (status === TransactionStatus.UNDETERMINED || status === TransactionStatus.CANCELED || status === TransactionStatus.VALIDATORS_TIMEOUT || status === TransactionStatus.LEADER_TIMEOUT) {
      onStage("undetermined");
      throw new Error(`Consensus ended without an accepted state change: ${status}`);
    }
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  throw new Error("Tracking timed out. The transaction may still be processing; resume tracking with its hash.");
}
