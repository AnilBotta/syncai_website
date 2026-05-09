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
    default: "SyncAi Technologies | AI Strategy and Consulting in Canada",
    template: "%s | SyncAi Technologies",
  },
  description:
    "Canada-based AI strategy, AI websites, agents, and automation for clinics, real estate teams, and small businesses.",
  openGraph: {
    title: "SyncAi Technologies",
    description:
      "AI strategy and implementation for businesses that want practical AI systems tied to real pain points.",
    url: "https://www.syncai.tech",
    siteName: "SyncAi Technologies",
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
