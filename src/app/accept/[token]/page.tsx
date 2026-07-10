import type { Metadata } from "next";
import { createSupabaseAdminClient, hasSupabaseAdminConfig, type Document } from "@/lib/supabase";
import { documentTypeLabel, markDocumentViewed } from "@/lib/documents";
import { renderMarkdown } from "@/lib/markdown";
import { AcceptButton } from "./accept-button";

export const metadata: Metadata = {
  title: "Review & accept — SyncAI Technologies",
  robots: { index: false, follow: false },
};

const COMPANY = process.env.COMPANY_LEGAL_NAME || "SyncAI Technologies";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f6f7f9",
        padding: "40px 16px",
        fontFamily: "Arial, Helvetica, sans-serif",
        color: "#1a1a1f",
      }}
    >
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          background: "#fff",
          borderRadius: 20,
          padding: "40px 44px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.06)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default async function AcceptPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  if (!hasSupabaseAdminConfig()) {
    return (
      <Shell>
        <h1 style={{ fontSize: 22 }}>Document unavailable</h1>
        <p style={{ color: "#4b5563", lineHeight: 1.7 }}>
          This service is not configured right now. Please contact us directly.
        </p>
      </Shell>
    );
  }

  const supabase = createSupabaseAdminClient();
  const { data: doc } = await supabase
    .from("documents")
    .select("*")
    .eq("accept_token", token)
    .single<Document>();

  if (!doc || doc.status === "draft" || doc.status === "cancelled") {
    return (
      <Shell>
        <h1 style={{ fontSize: 22, color: "#c0392b" }}>This link isn&apos;t valid</h1>
        <p style={{ color: "#4b5563", lineHeight: 1.7 }}>
          This document link is invalid, expired, or has been withdrawn. If you believe this is a mistake, please reach
          out to us directly.
        </p>
      </Shell>
    );
  }

  // Mark viewed on first open (sent -> viewed). Best-effort; ignore failures.
  await markDocumentViewed(supabase, doc);

  const label = documentTypeLabel(doc.type);
  const bodyHtml = renderMarkdown(doc.content_md);

  const { data: lead } = doc.lead_id
    ? await supabase.from("leads").select("name").eq("id", doc.lead_id).single<{ name: string }>()
    : { data: null };
  const recipientName = lead?.name || "there";

  const acceptedDate = doc.accepted_at
    ? new Date(doc.accepted_at).toLocaleString("en-CA", { dateStyle: "long", timeStyle: "short" })
    : null;

  return (
    <Shell>
      <div style={{ borderBottom: "1px solid #eef0f2", paddingBottom: 18, marginBottom: 26 }}>
        <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: "#6c3486" }}>
          {COMPANY}
        </p>
        <p style={{ fontSize: 13, color: "#6b7280", marginTop: 6 }}>{label}</p>
      </div>

      <article
        style={{ fontSize: 15, lineHeight: 1.75, color: "#26262e" }}
        // Content is escaped inside renderMarkdown before any formatting is applied.
        dangerouslySetInnerHTML={{ __html: bodyHtml }}
      />

      <div style={{ borderTop: "1px solid #eef0f2", marginTop: 30, paddingTop: 24 }}>
        {doc.status === "accepted" ? (
          <div
            style={{
              padding: "18px 20px",
              borderRadius: 14,
              background: "#ecfdf5",
              border: "1px solid #a7f3d0",
              color: "#065f46",
            }}
          >
            <strong>✓ Accepted.</strong> This {label.toLowerCase()} was accepted{acceptedDate ? ` on ${acceptedDate}` : ""}.
            Thank you.
          </div>
        ) : (
          <AcceptButton token={token} recipientName={recipientName} documentLabel={label} />
        )}
      </div>

      <p style={{ marginTop: 28, fontSize: 12, color: "#9ca3af", lineHeight: 1.6 }}>
        This is a click-to-accept electronic agreement. Questions? Reply to the email that delivered this link.
      </p>
    </Shell>
  );
}
