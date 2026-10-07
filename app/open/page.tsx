"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function OpenCommitment() {
  const router = useRouter(); const [id, setId] = useState("");
  function open(event: FormEvent) { event.preventDefault(); if (/^[1-9][0-9]*$/.test(id)) router.push(`/m/${id}`); }
  return <main className="page narrow"><div className="eyebrow">Direct lookup</div><h1>Open a commitment.</h1><p>Milestones are public contract records. Enter its numeric ID.</p><form className="lookup" onSubmit={open}><input autoFocus inputMode="numeric" value={id} onChange={e => setId(e.target.value)} placeholder="Commitment ID"/><button className="button primary">Open record</button></form></main>;
}

