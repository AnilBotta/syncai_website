import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Plus_Jakarta_Sans } from "next/font/google";
import { AssistantMount } from "@/components/assistant/assistant-mount";
import { AmbientGradient } from "@/components/ui/ambient-gradient";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Luminary admin fonts — only consumed inside the .admin-luminary scope, so the
// public site keeps rendering in Geist.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
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
      lang="en-CA"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${plusJakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AmbientGradient />
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
