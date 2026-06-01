import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.syncai.tech"),
  title: {
    default: "SyncAI Technology | AI Solutions That Deliver ROI",
    template: "%s | SyncAI Technology",
  },
  description:
    "SyncAI builds custom AI systems — smart websites, voice agents, and workflow automation — that cut costs, capture leads, and grow revenue for Canadian businesses.",
  openGraph: {
    title: "SyncAI Technology",
    description:
      "AI solutions that actually deliver ROI. Custom websites, agents, and automation for Canadian businesses.",
    url: "https://www.syncai.tech",
    siteName: "SyncAI Technology",
    locale: "en_CA",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
