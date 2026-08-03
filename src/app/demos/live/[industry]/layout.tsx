import type { ReactNode } from "react";
import { Lora } from "next/font/google";

/**
 * Demo sites render WITHOUT SyncAI's header, footer, or assistant bubble — each
 * one has to read as a different company's website or it proves nothing about
 * what we can build. The palette comes from a scoped token block in globals.css
 * (`.demo-dental` and friends), applied by the page itself.
 */
const demoSerif = Lora({
  variable: "--font-demo-serif",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

export default function DemoSiteLayout({ children }: { children: ReactNode }) {
  return <div className={demoSerif.variable}>{children}</div>;
}
