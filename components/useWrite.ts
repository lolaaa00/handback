"use client";

import { useCallback, useEffect, useState } from "react";
import { useWallet } from "./WalletProvider";
import { clearPending, loadPending, savePending, trackFinality, type PendingWrite, type TxStage } from "@/lib/lifecycle";
import { writeHandback } from "@/lib/contract";

export function useWrite(onFinal?: () => Promise<void> | void) {
  const wallet = useWallet();
  const [stage, setStage] = useState<TxStage>();
  const [hash, setHash] = useState<`0x${string}`>();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [recoverable, setRecoverable] = useState<PendingWrite | null>(null);

  useEffect(() => setRecoverable(loadPending()), []);

  const monitor = useCallback(async (pending: PendingWrite) => {
    setBusy(true); setHash(pending.hash); setMessage("Following the real Studionet lifecycle.");
    try {
      await trackFinality(pending.hash, next => setStage(next));
      setMessage("Finalized successfully; authoritative state was read again.");
      clearPending(pending.hash); setRecoverable(null);
      await onFinal?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Transaction tracking failed.");
    } finally { setBusy(false); }
  }, [onFinal]);

  async function submit(method: string, args: unknown[], value = 0n, commitmentId?: number) {
    if (!wallet.provider || !wallet.account) { setMessage("Connect an injected wallet first."); return; }
    if (!wallet.networkOk) { setMessage("Switch to Studionet 61999 before signing."); return; }
    setBusy(true); setMessage("Confirm the transaction in your wallet."); setStage(undefined);
    try {
      const txHash = await writeHandback(wallet.provider, wallet.account, method, args, value);
      const pending = { hash: txHash, method, commitmentId, submittedAt: Date.now() };
      savePending(pending); setRecoverable(pending);
      await monitor(pending);
    } catch (error) {
      const text = error instanceof Error ? error.message : "Transaction failed.";
      setMessage(/reject|denied|4001/i.test(text) ? "Wallet signature was rejected. Nothing was submitted." : text);
      setStage("failed"); setBusy(false);
    }
  }

  return { submit, monitor, stage, hash, message, busy, recoverable };
}

