import Link from "next/link";
import Image from "next/image";
import { contact } from "@/lib/site-data";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.3fr_.7fr_.7fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <Image
              src="/brand/syncai-logo-light.png"
              alt="SyncAI logo"
              width={154}
              height={50}
              className="h-9 w-auto"
            />
            <div>
              <p className="font-bold text-[#161616]">Technology</p>
              <p className="text-sm text-slate-500">AI solutions that deliver ROI.</p>
            </div>
          </div>
          <p className="mt-5 max-w-xl text-sm leading-6 text-slate-600">
            Built from Brampton, Ontario for businesses that want AI systems tied to real challenges,
            measurable workflows, and qualified leads.
          </p>
        </div>

        <div>
          <p className="font-semibold text-[#161616]">Explore</p>
          <div className="mt-4 grid gap-3 text-sm">
            <Link href="/demos" className="text-slate-600 hover:text-[#4B0082]">Solutions</Link>
            <Link href="/case-studies" className="text-slate-600 hover:text-[#4B0082]">Case Studies</Link>
            <Link href="/industries" className="text-slate-600 hover:text-[#4B0082]">Industries</Link>
            <Link href="/process" className="text-slate-600 hover:text-[#4B0082]">Process</Link>
            <Link href="/blog" className="text-slate-600 hover:text-[#4B0082]">Blog</Link>
            <Link href="/contact" className="text-slate-600 hover:text-[#4B0082]">Contact</Link>
          </div>
        </div>

        <div>
          <p className="font-semibold text-[#161616]">Contact</p>
          <div className="mt-4 grid gap-3 text-sm text-slate-600">
            <a href={`mailto:${contact.email}`} className="hover:text-[#4B0082]">
              {contact.email}
            </a>
            <a href={`tel:${contact.phonePrimary.replaceAll(" ", "")}`} className="hover:text-[#4B0082]">
              {contact.phonePrimary}
            </a>
            <a href={`tel:${contact.phoneSecondary.replaceAll(" ", "")}`} className="hover:text-[#4B0082]">
              {contact.phoneSecondary}
            </a>
            <span>{contact.location}</span>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-200 px-4 py-5 text-center text-xs text-slate-500">
        (c) {new Date().getFullYear()} SyncAI Technology. All rights reserved.
      </div>
    </footer>
  );
}
