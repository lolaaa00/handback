import Link from "next/link";
import { ContractNotice } from "@/components/ContractNotice";

export default function Home() {
  return <main>
    <section className="hero">
      <div className="eyebrow">Milestone escrow for public digital work</div>
      <h1>Agree on the work.<br/><em>Not the judge.</em></h1>
      <p className="lede">Handback holds GEN while independent validators inspect public evidence against the exact terms both parties accepted.</p>
      <div className="heroActions"><Link className="button primary" href="/new">Create a funded milestone</Link><Link className="button quiet" href="/open">Open by ID</Link></div>
      <ContractNotice />
    </section>
    <section className="principleGrid">
      <article><span>01</span><h2>Terms first</h2><p>The brief and acceptance criteria become immutable when the worker accepts.</p></article>
      <article><span>02</span><h2>Evidence, not assertion</h2><p>The worker maps public, versioned sources to every requirement. Validators retrieve them independently.</p></article>
      <article><span>03</span><h2>Money follows judgment</h2><p>Satisfied work becomes payable. Deficient work gets a bounded cure. Unverifiable evidence keeps funds locked.</p></article>
    </section>
    <section className="sequence"><div><small>CLIENT</small><b>Funds terms</b></div><i>→</i><div><small>WORKER</small><b>Accepts & delivers</b></div><i>→</i><div><small>GENLAYER</small><b>Judges evidence</b></div><i>→</i><div><small>CONTRACT</small><b>Settles escrow</b></div></section>
  </main>;
}

