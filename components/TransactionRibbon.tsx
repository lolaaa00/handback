"use client";

import { explorerTransaction } from "@/lib/network";
import type { TxStage } from "@/lib/lifecycle";

const steps: { id: TxStage; label: string }[] = [
  { id: "submitted", label: "Submitted" },
  { id: "pending", label: "Queued" },
  { id: "consensus", label: "Committee review" },
  { id: "accepted", label: "Accepted" },
  { id: "finalizing", label: "Appeal / finality" },
  { id: "finalized", label: "Finalized" },
];

export function TransactionRibbon({ stage, hash, message, onResume }: { stage?: TxStage; hash?: string; message?: string; onResume?: () => void }) {
  if (!stage && !hash) return null;
  const active = Math.max(0, steps.findIndex(step => step.id === stage));
  return <aside className={`txRibbon ${stage === "failed" || stage === "undetermined" ? "danger" : ""}`} aria-live="polite">
    <div className="txSteps">{steps.map((step, index) => <span key={step.id} className={index <= active ? "reached" : ""}>{step.label}</span>)}</div>
    <div className="txDetail">
      <strong>{stage === "accepted" ? "Accepted is not final." : message ?? stage}</strong>
      {hash && <a href={explorerTransaction(hash)} target="_blank" rel="noreferrer">Open transaction ↗</a>}
      {onResume && <button className="textButton" onClick={onResume}>Resume tracking</button>}
    </div>
  </aside>;
}

