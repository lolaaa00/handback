"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useWallet } from "./WalletProvider";
import { readHandback } from "@/lib/contract";
import { formatDate, formatGen, stateSentence } from "@/lib/format";
import type { Commitment } from "@/lib/types";

export function WorkDesk() {
  const wallet = useWallet();
  const [items, setItems] = useState<Commitment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!wallet.account) { setItems([]); return; }
    setLoading(true); setError("");
    readHandback("commitments_for", [wallet.account, 0, 40]).then(value => setItems(value as Commitment[])).catch(reason => setError(reason instanceof Error ? reason.message : "Could not read commitments.")).finally(() => setLoading(false));
  }, [wallet.account]);
  if (!wallet.account) return <div className="emptyDesk"><h2>Connect a wallet to reconstruct your commitments.</h2><p>Handback reads finalized contract state. No account database is involved.</p><button className="button primary" onClick={() => void wallet.connect()}>Connect wallet</button></div>;
  if (loading) return <div className="emptyDesk"><p>Reading finalized contract state…</p></div>;
  if (error) return <div className="emptyDesk error"><h2>Contract read unavailable</h2><p>{error}</p></div>;
  if (!items.length) return <div className="emptyDesk"><h2>No commitments attached to this wallet.</h2><p>Create a funded milestone or open one by ID.</p><div><Link className="button primary" href="/new">Create agreement</Link> <Link className="button quiet" href="/open">Open by ID</Link></div></div>;
  return <div className="workLedger">{items.slice().reverse().map(item => <Link href={`/m/${item.id}`} key={item.id} className="workLine"><span className={`ledgerMark state-${item.state.toLowerCase()}`}></span><div><small>#{item.id} · {item.state.replaceAll("_", " ")}</small><h2>{item.title}</h2><p>{stateSentence(item.state)}</p></div><aside><strong>{formatGen(item.escrow)}</strong><span>{item.state === "OFFERED" ? `Accept by ${formatDate(item.accept_by)}` : `Deliver by ${formatDate(item.deliver_by)}`}</span></aside></Link>)}</div>;
}

