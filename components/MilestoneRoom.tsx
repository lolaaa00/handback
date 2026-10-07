"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { readHandback } from "@/lib/contract";
import { availableActions, roleFor } from "@/lib/actions";
import { formatDate, formatGen, shortAddress } from "@/lib/format";
import type { Commitment, Evaluation, EvidenceSource, Submission } from "@/lib/types";
import { useWallet } from "./WalletProvider";
import { useWrite } from "./useWrite";
import { StatusSeal } from "./StatusSeal";
import { TransactionRibbon } from "./TransactionRibbon";

const actionLabels: Record<string, string> = {
  take_on: "Accept these terms", decline_offer: "Decline and return escrow", withdraw_unaccepted: "Withdraw unaccepted offer",
  assess_work: "Request independent judgment", settle_satisfied: "Release finalized escrow", release_by_client: "Release voluntarily",
  consent_to_cancel: "Consent to mutual cancellation", refund_expired: "Return expired escrow",
};

export function MilestoneRoom({ id }: { id: number }) {
  const wallet = useWallet();
  const [item, setItem] = useState<Commitment>();
  const [submission, setSubmission] = useState<Submission>({});
  const [evaluation, setEvaluation] = useState<Evaluation>({});
  const [error, setError] = useState("");
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [sources, setSources] = useState<EvidenceSource[]>([]);
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Math.floor(Date.now() / 1000)), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const load = useCallback(async () => {
    try {
      const commitment = await readHandback("get_commitment", [id]) as Commitment;
      setItem(commitment); setError("");
      if (commitment.evidence_version > 0) {
        const [nextSubmission, nextEvaluation] = await Promise.all([
          readHandback("get_submission", [id, commitment.evidence_version]),
          readHandback("get_evaluation", [id, commitment.evidence_version]),
        ]);
        setSubmission(nextSubmission as Submission); setEvaluation(nextEvaluation as Evaluation);
      }
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not read commitment."); }
  }, [id]);
  useEffect(() => { void load(); }, [load]);
  const tx = useWrite(load);
  const role = item ? roleFor(item, wallet.account) : "observer";
  const actions = useMemo(() => item ? availableActions(item, role, now) : [], [item, role, now]);

  function beginEvidence() {
    if (!item) return;
    setSources(item.criteria.map(criterion => ({ criterion_id: criterion.id, url: "", kind: "WEB_PAGE", version: "", sha256: "" })));
    setEvidenceOpen(true);
  }
  async function submitEvidence() { await tx.submit("present_work", [id, JSON.stringify(sources)], 0n, id); setEvidenceOpen(false); }
  async function act(action: string) { await tx.submit(action, [id], 0n, id); }

  if (error) return <main className="page narrow"><div className="emptyDesk error"><h1>Commitment unavailable</h1><p>{error}</p><Link href="/open">Try another ID</Link></div></main>;
  if (!item) return <main className="page narrow"><div className="emptyDesk"><p>Reading finalized milestone state…</p></div></main>;
  return <main className="room">
    <section className="roomHeader">
      <div><div className="eyebrow">Commitment #{item.id} · you are {role}</div><h1>{item.title}</h1><div className="partyLine"><span>Client <b>{shortAddress(item.client)}</b></span><i>↔</i><span>Worker <b>{shortAddress(item.worker)}</b></span></div></div>
      <div className="economicTruth"><small>ESCROW</small><strong>{formatGen(item.escrow)}</strong><span>{item.settled_to ? `Settled to ${shortAddress(item.settled_to)}` : "Held by the contract"}</span></div>
    </section>
    <StatusSeal state={item.state} />
    <div className="roomGrid">
      <article className="agreementReader">
        <header><span>IMMUTABLE AGREEMENT</span><span>Accepted {formatDate(item.accepted_at)}</span></header>
        <p className="brief">{item.brief}</p>
        <div className="termDates"><span><small>ACCEPT BY</small>{formatDate(item.accept_by)}</span><span><small>DELIVER BY</small>{formatDate(item.deliver_by)}</span><span><small>CURE</small>{Math.round(item.cure_window_seconds / 86400)} days</span></div>
        <section className="criteriaRead"><h2>Acceptance criteria</h2>{item.criteria.map((criterion, index) => { const finding = evaluation.findings?.find(value => value.criterion_id === criterion.id); const explanation = evaluation.explanations?.find(value => value.criterion_id === criterion.id); return <article key={criterion.id}><b>{String(index + 1).padStart(2, "0")}</b><div><h3>{criterion.requirement}</h3><p><strong>Expected proof:</strong> {criterion.proof}</p>{finding && <div className={`finding ${finding.status.toLowerCase()}`}><span>{finding.status.replaceAll("_", " ")}</span>{explanation?.text && <p>{explanation.text}</p>}</div>}</div></article>; })}</section>
      </article>
      <aside className="actionRail">
        <div><small>NEXT VALID ACTION</small><h2>{actions.length ? "Move the commitment forward" : "No action is required from this wallet"}</h2><p>{wallet.message}</p></div>
        {actions.includes("present_work") && <button className="button primary" onClick={beginEvidence}>Present public evidence</button>}
        {actions.filter(action => action !== "present_work").map(action => <button key={action} className={action === "consent_to_cancel" || action === "decline_offer" ? "button quiet" : "button primary"} disabled={tx.busy || !wallet.networkOk} onClick={() => void act(action)}>{actionLabels[action]}</button>)}
        {!wallet.account && <button className="button primary" onClick={() => void wallet.connect()}>Connect wallet</button>}
        {wallet.account && !wallet.networkOk && <button className="button primary" onClick={() => void wallet.switchNetwork()}>Switch to 61999</button>}
        {submission.version && <Link className="evidenceLink" href={`/m/${id}/evidence/${submission.version}`}><span>Evidence version {submission.version}</span><code>{submission.digest?.slice(0, 14)}…</code><b>Read evidence →</b></Link>}
      </aside>
    </div>
    {evidenceOpen && <div className="modalBackdrop"><section className="evidenceComposer"><header><div><small>PUBLIC EVIDENCE</small><h2>Map proof to every criterion</h2></div><button className="textButton" onClick={() => setEvidenceOpen(false)}>Close</button></header>{sources.map((source, index) => <article key={index}><b>{source.criterion_id}</b><label>Public HTTPS URL<input value={source.url} onChange={e => setSources(list => list.map((value, i) => i === index ? { ...value, url: e.target.value } : value))}/></label><label>Source type<select value={source.kind} onChange={e => setSources(list => list.map((value, i) => i === index ? { ...value, kind: e.target.value as EvidenceSource["kind"] } : value))}><option>WEB_PAGE</option><option>REPOSITORY_FILE</option><option>RELEASE</option><option>DOCUMENTATION</option></select></label><label>Public version or ref<input value={source.version} onChange={e => setSources(list => list.map((value, i) => i === index ? { ...value, version: e.target.value } : value))}/></label><label>Optional response SHA-256<input value={source.sha256} onChange={e => setSources(list => list.map((value, i) => i === index ? { ...value, sha256: e.target.value.trim().toLowerCase() } : value))}/></label></article>)}<button className="button primary" disabled={sources.some(source => !source.url || !source.version) || tx.busy} onClick={() => void submitEvidence()}>Bind evidence version</button></section></div>}
    <TransactionRibbon stage={tx.stage} hash={tx.hash} message={tx.message} onResume={tx.recoverable ? () => void tx.monitor(tx.recoverable!) : undefined}/>
  </main>;
}
