import type { ReactNode } from "react";
import { Lora, Playfair_Display, Sora } from "next/font/google";

/**
 * Demo sites render WITHOUT SyncAI's header, footer, or assistant bubble — each
 * one has to read as a different company's website or it proves nothing about
 * what we can build. The palette comes from a scoped token block in globals.css
 * (`.demo-dental`, `.demo-realty`), applied by the page itself.
 *
 * Both display faces load here rather than one being chosen per site: next/font
 * resolves fonts by static analysis at build time, so the family cannot be
 * picked from runtime data. Each palette block selects the variable it wants,
 * which is also what stops two demos looking like the same site recoloured.
 */
const demoSerif = Lora({
  variable: "--font-demo-serif",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

const demoDisplay = Playfair_Display({
  variable: "--font-demo-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

const demoSans = Sora({
  variable: "--font-demo-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
});

export default function DemoSiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${demoSerif.variable} ${demoDisplay.variable} ${demoSans.variable}`}>
      {children}
    </div>
  );
}
