import Link from "next/link";
import { contact, navItems } from "@/lib/site-data";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.3fr_.7fr_.7fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-slate-950 text-sm font-black text-cyan-200">
              SA
            </span>
            <div>
              <p className="font-bold text-slate-950">SyncAi Technologies</p>
              <p className="text-sm text-slate-500">Canada-based AI strategy and implementation.</p>
            </div>
          </div>
          <p className="mt-5 max-w-xl text-sm leading-6 text-slate-600">
            Built from Brampton, Ontario for businesses that want AI systems tied to real pain points,
            measurable workflows, and qualified leads.
          </p>
        </div>

        <div>
          <p className="font-semibold text-slate-950">Explore</p>
          <div className="mt-4 grid gap-3 text-sm">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="text-slate-600 hover:text-slate-950">
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="font-semibold text-slate-950">Contact</p>
          <div className="mt-4 grid gap-3 text-sm text-slate-600">
            <a href={`mailto:${contact.email}`} className="hover:text-slate-950">
              {contact.email}
            </a>
            <a href={`tel:${contact.phonePrimary.replaceAll(" ", "")}`} className="hover:text-slate-950">
              {contact.phonePrimary}
            </a>
            <a href={`tel:${contact.phoneSecondary.replaceAll(" ", "")}`} className="hover:text-slate-950">
              {contact.phoneSecondary}
            </a>
            <span>{contact.location}</span>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-200 px-4 py-5 text-center text-xs text-slate-500">
        (c) {new Date().getFullYear()} SyncAi Technologies. All rights reserved.
      </div>
    </footer>
  );
}
