"use client";

import Link from "next/link";
import { useWallet } from "./WalletProvider";
import { shortAddress } from "@/lib/format";

export function Header() {
  const wallet = useWallet();
  return <header className="siteHeader">
    <Link href="/" className="wordmark"><span>H</span> Handback</Link>
    <nav aria-label="Primary navigation">
      <Link href="/work">Work</Link>
      <Link href="/new">New agreement</Link>
      <Link href="/method">How judgment works</Link>
    </nav>
    <div className="walletControls">
      {wallet.account && <span className={wallet.networkOk ? "networkDot ok" : "networkDot bad"}>{wallet.networkOk ? "61999" : "Wrong chain"}</span>}
      {!wallet.account ? <button className="button compact" onClick={() => void wallet.connect()}>Connect wallet</button> : <>
        <span className="address">{shortAddress(wallet.account)}</span>
        {!wallet.networkOk && <button className="button compact" onClick={() => void wallet.switchNetwork()}>Switch</button>}
        <button className="textButton" onClick={wallet.disconnect}>Disconnect</button>
      </>}
    </div>
  </header>;
}

