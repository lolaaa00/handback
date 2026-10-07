import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WalletProvider, useWallet } from "@/components/WalletProvider";

function Probe() { const wallet = useWallet(); return <><span>{wallet.message}</span><span>{wallet.account}</span><button onClick={() => void wallet.connect()}>connect</button><button onClick={wallet.disconnect}>disconnect</button></>; }

afterEach(cleanup);

describe("wallet session", () => {
  it("connects a normal injected EIP-1193 wallet and disconnects locally", async () => {
    const request = vi.fn(async ({ method }: { method: string }) => method === "eth_chainId" ? "0xf22f" : ["0x1111111111111111111111111111111111111111"]);
    Object.defineProperty(window, "ethereum", { configurable: true, value: { request, on: vi.fn(), removeListener: vi.fn() } });
    render(<WalletProvider><Probe /></WalletProvider>);
    await act(async () => fireEvent.click(screen.getByText("connect")));
    expect(await screen.findByText("Connected to Studionet 61999.")).toBeInTheDocument();
    expect(screen.getByText("0x1111111111111111111111111111111111111111")).toBeInTheDocument();
    fireEvent.click(screen.getByText("disconnect"));
    expect(screen.getByText(/Disconnected in Handback/)).toBeInTheDocument();
  });
  it("surfaces wrong network without inventing success", async () => {
    const request = vi.fn(async ({ method }: { method: string }) => method === "eth_chainId" ? "0x1" : ["0x1111111111111111111111111111111111111111"]);
    Object.defineProperty(window, "ethereum", { configurable: true, value: { request, on: vi.fn(), removeListener: vi.fn() } });
    render(<WalletProvider><Probe /></WalletProvider>);
    await act(async () => fireEvent.click(screen.getByText("connect")));
    expect(await screen.findByText("Wrong network. Switch before signing.")).toBeInTheDocument();
  });
});
