"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { NETWORK } from "@/lib/network";
import type { Eip1193Provider } from "@/lib/provider";

type Wallet = {
  provider?: Eip1193Provider;
  account: `0x${string}` | null;
  chainId: number | null;
  connected: boolean;
  networkOk: boolean;
  message: string;
  connect(): Promise<void>;
  disconnect(): void;
  switchNetwork(): Promise<void>;
};

const Context = createContext<Wallet | null>(null);

function parseChain(value: unknown) {
  if (typeof value === "number") return value;
  return Number.parseInt(String(value), 16);
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<`0x${string}` | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [message, setMessage] = useState("Wallet disconnected.");
  const provider = typeof window === "undefined" ? undefined : window.ethereum;
  const networkOk = Boolean(account) && chainId === NETWORK.chainId;

  async function synchronize(requestAccounts: boolean) {
    if (!provider) { setMessage("No injected EVM wallet was found."); return; }
    try {
      const accounts = await provider.request({ method: requestAccounts ? "eth_requestAccounts" : "eth_accounts" });
      const rawChain = await provider.request({ method: "eth_chainId" });
      const list = Array.isArray(accounts) ? accounts : [];
      const next = typeof list[0] === "string" ? list[0] as `0x${string}` : null;
      const nextChain = parseChain(rawChain);
      setAccount(next);
      setChainId(Number.isFinite(nextChain) ? nextChain : null);
      setMessage(!next ? "Wallet disconnected." : nextChain === NETWORK.chainId ? "Connected to Studionet 61999." : "Wrong network. Switch before signing.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Wallet connection failed.");
    }
  }

  async function switchNetwork() {
    if (!provider) return;
    try {
      try {
        await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: NETWORK.chainHex }] });
      } catch (error) {
        const code = typeof error === "object" && error && "code" in error ? (error as { code?: unknown }).code : null;
        if (code !== 4902) throw error;
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [{ chainId: NETWORK.chainHex, chainName: NETWORK.name, nativeCurrency: NETWORK.currency, rpcUrls: [NETWORK.rpc], blockExplorerUrls: [NETWORK.explorer] }],
        });
      }
      await synchronize(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Network switch failed.");
    }
  }

  function disconnect() {
    setAccount(null);
    setMessage("Disconnected in Handback. Your wallet extension may remain authorized.");
  }

  useEffect(() => {
    if (!provider) return;
    void synchronize(false);
    const accountsChanged = (value: unknown) => {
      const list = Array.isArray(value) ? value : [];
      const next = typeof list[0] === "string" ? list[0] as `0x${string}` : null;
      setAccount(next);
      setMessage(next ? "Wallet account changed." : "Wallet disconnected.");
    };
    const chainChanged = (value: unknown) => {
      const next = parseChain(value);
      setChainId(next);
      setMessage(next === NETWORK.chainId ? "Connected to Studionet 61999." : "Wallet network changed. Writes are disabled.");
    };
    provider.on?.("accountsChanged", accountsChanged);
    provider.on?.("chainChanged", chainChanged);
    return () => {
      provider.removeListener?.("accountsChanged", accountsChanged);
      provider.removeListener?.("chainChanged", chainChanged);
    };
  // synchronize deliberately reads the current provider once on mount.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider]);

  const value = useMemo<Wallet>(() => ({
    provider, account, chainId, connected: Boolean(account), networkOk, message,
    connect: () => synchronize(true), disconnect, switchNetwork,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [provider, account, chainId, networkOk, message]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useWallet() {
  const value = useContext(Context);
  if (!value) throw new Error("WalletProvider is missing.");
  return value;
}

