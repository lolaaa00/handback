export const NETWORK = {
  name: "GenLayer Studionet",
  chainId: 61999,
  chainHex: "0xf22f",
  rpc: "https://studio.genlayer.com/api",
  explorer: "https://explorer-studio.genlayer.com",
  currency: { name: "GEN", symbol: "GEN", decimals: 18 },
} as const;

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_HANDBACK_CONTRACT_ADDRESS?.trim() ?? "";
export const contractConfigured = () => /^0x[a-fA-F0-9]{40}$/.test(CONTRACT_ADDRESS);

export function explorerTransaction(hash: string) {
  return `${NETWORK.explorer}/transactions/${hash}`;
}

export function explorerAddress(address: string) {
  return `${NETWORK.explorer}/address/${address}`;
}

