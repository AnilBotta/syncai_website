import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Reveal } from "@/components/motion/reveal";
import { ArrowRight, Calendar, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog",
  description: "Insights, guides, and case studies on AI strategy, automation, and digital transformation for Canadian businesses.",
};

const posts = [
  {
    title: "How AI Voice Agents Can Recover Your After-Hours Leads",
    excerpt: "Most businesses lose 60% of after-hours inquiries. Here's how AI voice agents capture and qualify every single one.",
    date: "May 15, 2026",
    readTime: "5 min read",
    category: "AI Agents",
  },
  {
    title: "The ROI of AI Website Lead Capture Systems",
    excerpt: "A detailed breakdown of how AI-powered lead capture systems generate measurable ROI for Canadian businesses.",
    date: "May 1, 2026",
    readTime: "7 min read",
    category: "AI Websites",
  },
  {
    title: "Workflow Automation: Where to Start in 2026",
    excerpt: "Not sure which workflows to automate first? This guide walks through the highest-ROI automation opportunities.",
    date: "April 15, 2026",
    readTime: "6 min read",
    category: "Automation",
  },
  {
    title: "AI Strategy for Small Businesses: A Practical Guide",
    excerpt: "You don't need a massive budget or a data science team. Here's how small businesses can start with AI today.",
    date: "April 1, 2026",
    readTime: "8 min read",
    category: "AI Strategy",
  },
];

export default function BlogPage() {
  return (
    <PageShell
      eyebrow="Blog"
      title="AI insights for Canadian businesses"
      description="Practical guides, case studies, and thought leadership on AI strategy, automation, and digital transformation."
    >
      <section className="bg-bg-base py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          {posts.map((post, index) => (
            <Reveal key={post.title} delay={(index % 2) * 0.08}>
              <GlassCard className="group h-full p-6">
                <div className="flex items-center gap-3 text-xs text-muted">
                  <span className="rounded-full border border-brand/25 bg-brand/10 px-3 py-1 font-bold text-brand-glow-text">
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3" /> {post.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" /> {post.readTime}
                  </span>
                </div>
                <h2 className="mt-4 text-xl font-black text-foreground transition group-hover:text-brand-glow-text">
                  {post.title}
                </h2>
                <p className="mt-3 leading-7 text-muted">{post.excerpt}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand-glow-text">
                  Read More <ArrowRight className="size-3" />
                </span>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
