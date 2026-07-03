import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AssistantMount } from "@/components/assistant/assistant-mount";
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
      <body className="min-h-full flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white"
        >
          Skip to content
        </a>
        {children}
        <AssistantMount />
      </body>
    </html>
  );
}
