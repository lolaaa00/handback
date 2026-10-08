import Link from "next/link";

export default function NotFound() {
  return <main className="page narrow"><div className="emptyDesk error"><div className="eyebrow">Record not found</div><h1>This commitment address is invalid.</h1><p>Use a positive numeric commitment ID from the contract.</p><Link className="button primary" href="/open">Open another record</Link></div></main>;
}
