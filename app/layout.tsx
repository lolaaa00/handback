import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { WalletProvider } from "@/components/WalletProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Handback — milestone escrow with independent judgment",
  description: "Fund public digital work and let GenLayer validators decide whether the agreed milestone was delivered.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><WalletProvider><Header />{children}<footer><span>Handback</span><span>Public evidence. Independent judgment. Finalized settlement.</span></footer></WalletProvider></body></html>;
}

