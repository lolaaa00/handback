"use client";

import { FormEvent, useState } from "react";
import { TransactionRibbon } from "./TransactionRibbon";
import { useWrite } from "./useWrite";
import { useWallet } from "./WalletProvider";
import type { Criterion } from "@/lib/types";

const toSeconds = (value: string) => Math.floor(new Date(value).getTime() / 1000);

export function AgreementComposer() {
  const wallet = useWallet();
  const tx = useWrite();
  const [worker, setWorker] = useState("");
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [amount, setAmount] = useState("0.1");
  const [acceptBy, setAcceptBy] = useState("");
  const [deliverBy, setDeliverBy] = useState("");
  const [cureDays, setCureDays] = useState("3");
  const [criteria, setCriteria] = useState<Criterion[]>([{ id: "criterion-1", requirement: "", proof: "" }]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const value = BigInt(Math.round(Number(amount) * 1e6)) * 10n ** 12n;
    await tx.submit("fund_commitment", [worker, title, brief, JSON.stringify(criteria), toSeconds(acceptBy), toSeconds(deliverBy), Number(cureDays) * 86400], value);
  }

  const valid = /^0x[a-fA-F0-9]{40}$/.test(worker) && title && brief && Number(amount) > 0 && acceptBy && deliverBy && toSeconds(deliverBy) > toSeconds(acceptBy) && criteria.every(c => c.id && c.requirement && c.proof);
  return <>
    <form className="agreementSheet" onSubmit={submit}>
      <header><span>FUNDED DIGITAL MILESTONE</span><span>{criteria.length}/5 criteria</span></header>
      <div className="formSplit">
        <section>
          <label>Worker wallet<input value={worker} onChange={e => setWorker(e.target.value.trim())} placeholder="0x…" /></label>
          <label>Milestone title<input value={title} onChange={e => setTitle(e.target.value)} maxLength={120} placeholder="Accessible checkout handoff" /></label>
          <label>What is being delivered?<textarea value={brief} onChange={e => setBrief(e.target.value)} maxLength={4000} rows={7} placeholder="Describe the public digital work, intended audience, and boundaries." /></label>
        </section>
        <aside>
          <label>Escrow amount (GEN)<input inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} /></label>
          <label>Accept by<input type="datetime-local" value={acceptBy} onChange={e => setAcceptBy(e.target.value)} /></label>
          <label>Deliver by<input type="datetime-local" value={deliverBy} onChange={e => setDeliverBy(e.target.value)} /></label>
          <label>Cure window<select value={cureDays} onChange={e => setCureDays(e.target.value)}><option value="1">1 day</option><option value="3">3 days</option><option value="7">7 days</option></select></label>
        </aside>
      </div>
      <section className="criteriaEditor"><div className="sectionTitle"><div><small>ACCEPTANCE CRITERIA</small><h2>What must be demonstrably true?</h2></div><button type="button" className="button quiet" disabled={criteria.length >= 5} onClick={() => setCriteria(current => [...current, { id: `criterion-${current.length + 1}`, requirement: "", proof: "" }])}>Add criterion</button></div>
        {criteria.map((criterion, index) => <article className="criterionEditor" key={index}><b>{String(index + 1).padStart(2, "0")}</b><div><label>Requirement<textarea value={criterion.requirement} onChange={e => setCriteria(list => list.map((item, i) => i === index ? { ...item, requirement: e.target.value } : item))} placeholder="The public onboarding flow lets a new user complete account setup." /></label><label>Acceptable public proof<textarea value={criterion.proof} onChange={e => setCriteria(list => list.map((item, i) => i === index ? { ...item, proof: e.target.value } : item))} placeholder="A public deployed URL and versioned release page demonstrating the flow." /></label></div>{criteria.length > 1 && <button type="button" className="remove" onClick={() => setCriteria(list => list.filter((_, i) => i !== index))}>Remove</button>}</article>)}
      </section>
      <div className="signingBar"><div><strong>{amount || "0"} GEN</strong><span>{wallet.message}</span></div><button className="button primary" disabled={!valid || tx.busy || !wallet.networkOk}>{tx.busy ? "Transaction in progress" : "Fund and publish terms"}</button></div>
    </form>
    <TransactionRibbon stage={tx.stage} hash={tx.hash} message={tx.message} onResume={tx.recoverable ? () => void tx.monitor(tx.recoverable!) : undefined} />
  </>;
}

