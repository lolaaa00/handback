export type Criterion = { id: string; requirement: string; proof: string };
export type EvidenceSource = {
  criterion_id: string;
  url: string;
  kind: "WEB_PAGE" | "REPOSITORY_FILE" | "RELEASE" | "DOCUMENTATION";
  version: string;
  sha256: string;
};

export type CommitmentState =
  | "OFFERED" | "ACTIVE" | "SUBMITTED" | "PAYABLE" | "CURE_REQUIRED"
  | "EVIDENCE_REPAIR" | "RELEASED" | "REFUNDED" | "DECLINED" | "CANCELLED";

export type Commitment = {
  id: number;
  client: string;
  worker: string;
  title: string;
  brief: string;
  criteria: Criterion[];
  escrow: number | string;
  state: CommitmentState;
  accept_by: number;
  deliver_by: number;
  cure_window_seconds: number;
  accepted_at: number;
  evidence_version: number;
  evidence_digest: string;
  corrections_used: number;
  repair_required: boolean;
  resubmit_by: number;
  judgment: string;
  judged_version: number;
  client_cancel: boolean;
  worker_cancel: boolean;
  settled_to: string;
  settled_amount: number | string;
};

export type Evaluation = {
  outcome?: string;
  version?: number;
  findings?: { criterion_id: string; status: string }[];
  explanations?: { criterion_id: string; text: string }[];
  fingerprints?: { url: string; version: string; available: boolean; status: number; body_sha256: string }[];
  evaluated_at?: number;
};

export type Submission = {
  version?: number;
  digest?: string;
  submitted_at?: number;
  sources?: EvidenceSource[];
};

