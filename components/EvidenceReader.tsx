"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readHandback } from "@/lib/contract";
import { formatDate } from "@/lib/format";
import type { Evaluation, Submission } from "@/lib/types";

export function EvidenceReader({ id, version }: { id: number; version: number }) {
  const [submission, setSubmission] = useState<Submission>(); const [evaluation, setEvaluation] = useState<Evaluation>(); const [error, setError] = useState("");
  useEffect(() => { Promise.all([readHandback("get_submission", [id, version]), readHandback("get_evaluation", [id, version])]).then(([a, b]) => { setSubmission(a as Submission); setEvaluation(b as Evaluation); }).catch(reason => setError(reason instanceof Error ? reason.message : "Could not read evidence.")); }, [id, version]);
  if (error) return <main className="page narrow"><div className="emptyDesk error"><p>{error}</p></div></main>;
  if (!submission) return <main className="page narrow"><div className="emptyDesk"><p>Reading evidence…</p></div></main>;
  return <main className="page evidencePage"><Link href={`/m/${id}`} className="backLink">← Commitment #{id}</Link><div className="pageIntro compact"><div className="eyebrow">Evidence version {version}</div><h1>What validators were asked to inspect.</h1><p>Submitted {formatDate(submission.submitted_at)} · digest <code>{submission.digest}</code></p></div><div className="evidenceSplit"><section className="sourceLedger"><h2>Bound public sources</h2>{submission.sources?.map((source, index) => { const fingerprint = evaluation?.fingerprints?.find(value => value.url === source.url); return <article key={source.url}><span>{String(index + 1).padStart(2, "0")}</span><div><small>{source.kind} · {source.criterion_id}</small><a href={source.url} target="_blank" rel="noreferrer">{source.url} ↗</a><p>Version: {source.version}</p><code>{source.sha256 || "No participant-supplied digest"}</code></div><aside className={fingerprint?.available ? "sourceOk" : "sourceUnknown"}>{fingerprint ? (fingerprint.available ? "Retrieved" : "Unavailable") : "Not evaluated"}</aside></article>; })}</section><aside className="judgmentSheet"><small>CONSENSUS RESULT</small><h2>{evaluation?.outcome?.replaceAll("_", " ") || "No finalized evaluation"}</h2>{evaluation?.findings?.map(finding => <div key={finding.criterion_id}><b>{finding.criterion_id}</b><span>{finding.status}</span></div>)}</aside></div></main>;
}

