import type { Commitment } from "./types";

export type Role = "client" | "worker" | "observer";

export function roleFor(commitment: Commitment, account?: string | null): Role {
  if (!account) return "observer";
  const current = account.toLowerCase();
  if (current === commitment.client.toLowerCase()) return "client";
  if (current === commitment.worker.toLowerCase()) return "worker";
  return "observer";
}

export function availableActions(commitment: Commitment, role: Role, now: number) {
  const actions: string[] = [];
  if (commitment.state === "OFFERED" && role === "worker" && now <= commitment.accept_by) actions.push("take_on", "decline_offer");
  if (commitment.state === "OFFERED" && role === "client") actions.push("withdraw_unaccepted");
  if (["ACTIVE", "CURE_REQUIRED", "EVIDENCE_REPAIR"].includes(commitment.state) && role === "worker") actions.push("present_work");
  if (commitment.state === "SUBMITTED") actions.push("assess_work");
  if (commitment.state === "PAYABLE") actions.push("settle_satisfied");
  if (["ACTIVE", "SUBMITTED", "CURE_REQUIRED", "EVIDENCE_REPAIR", "PAYABLE"].includes(commitment.state) && role === "client") actions.push("release_by_client");
  if (["ACTIVE", "SUBMITTED", "CURE_REQUIRED", "EVIDENCE_REPAIR"].includes(commitment.state) && role !== "observer") actions.push("consent_to_cancel");
  const refundable =
    (commitment.state === "OFFERED" && now > commitment.accept_by) ||
    (commitment.state === "ACTIVE" && now > commitment.deliver_by) ||
    (["CURE_REQUIRED", "EVIDENCE_REPAIR"].includes(commitment.state) && now > commitment.resubmit_by);
  if (refundable) actions.push("refund_expired");
  return actions;
}

