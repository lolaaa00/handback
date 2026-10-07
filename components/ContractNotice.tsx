import { CONTRACT_ADDRESS, contractConfigured, NETWORK } from "@/lib/network";

export function ContractNotice() {
  return <div className={contractConfigured() ? "contractNotice configured" : "contractNotice"}>
    <span>{contractConfigured() ? "Live contract" : "Contract deployment pending"}</span>
    <code>{contractConfigured() ? CONTRACT_ADDRESS : "No address configured"}</code>
    <span>{NETWORK.name} · {NETWORK.chainId}</span>
  </div>;
}

