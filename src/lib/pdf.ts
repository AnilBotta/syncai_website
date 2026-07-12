import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { Invoice, Lead } from "@/lib/supabase";

const COMPANY = process.env.COMPANY_LEGAL_NAME || "SyncAI Technologies";
const COMPANY_ADDRESS = process.env.COMPANY_ADDRESS || "Ontario, Canada";
const ETRANSFER_EMAIL = process.env.EMAIL_REPLY_TO || process.env.ADMIN_EMAIL || "";

const BRAND = rgb(0.42, 0.2, 0.53); // SyncAI purple (#6c3486)
const INK = rgb(0.1, 0.1, 0.12);
const MUTED = rgb(0.42, 0.45, 0.5);
const LINE = rgb(0.85, 0.86, 0.88);

const cad = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 2 });

/**
 * pdf-lib's standard fonts use WinAnsi (CP1252), which can't encode em dashes,
 * curly quotes, emoji, etc. Normalize common Unicode to ASCII and drop anything
 * outside the encodable range so drawText never throws.
 */
function ascii(input: string): string {
  return (input || "")
    .replace(/[–—]/g, "-")
    .replace(/[‘’‚‛]/g, "'")
    .replace(/[“”„]/g, '"')
    .replace(/…/g, "...")
    .replace(/[•●▪]/g, "-")
    .replace(/ /g, " ")
    .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, "");
}

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 56;
const CONTENT_W = PAGE_W - MARGIN * 2;

class PdfBuilder {
  doc!: PDFDocument;
  page!: PDFPage;
  font!: PDFFont;
  bold!: PDFFont;
  y = PAGE_H - MARGIN;
  private title: string;

  constructor(title: string) {
    this.title = title;
  }

  async init() {
    this.doc = await PDFDocument.create();
    this.font = await this.doc.embedFont(StandardFonts.Helvetica);
    this.bold = await this.doc.embedFont(StandardFonts.HelveticaBold);
    this.addPage();
  }

  private addPage() {
    this.page = this.doc.addPage([PAGE_W, PAGE_H]);
    // Brand header band.
    this.page.drawText(COMPANY.toUpperCase(), { x: MARGIN, y: PAGE_H - MARGIN + 8, size: 11, font: this.bold, color: BRAND });
    this.page.drawLine({
      start: { x: MARGIN, y: PAGE_H - MARGIN - 2 },
      end: { x: PAGE_W - MARGIN, y: PAGE_H - MARGIN - 2 },
      thickness: 1,
      color: LINE,
    });
    this.y = PAGE_H - MARGIN - 22;
  }

  ensure(height: number) {
    if (this.y - height < MARGIN + 20) this.addPage();
  }

  wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
    const words = ascii(text).split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let line = "";
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(test, size) > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines.length ? lines : [""];
  }

  paragraph(text: string, opts: { size?: number; font?: PDFFont; color?: ReturnType<typeof rgb>; indent?: number; gap?: number } = {}) {
    const size = opts.size ?? 10.5;
    const font = opts.font ?? this.font;
    const color = opts.color ?? INK;
    const indent = opts.indent ?? 0;
    const lineHeight = size * 1.45;
    for (const line of this.wrap(text, font, size, CONTENT_W - indent)) {
      this.ensure(lineHeight);
      this.page.drawText(line, { x: MARGIN + indent, y: this.y, size, font, color });
      this.y -= lineHeight;
    }
    this.y -= opts.gap ?? 4;
  }

  heading(text: string, size = 15) {
    this.y -= 6;
    this.ensure(size * 1.6);
    this.paragraph(text, { size, font: this.bold, color: BRAND, gap: 6 });
  }

  bullet(text: string) {
    const size = 10.5;
    const lineHeight = size * 1.45;
    this.ensure(lineHeight);
    this.page.drawText("-", { x: MARGIN + 6, y: this.y, size, font: this.bold, color: BRAND });
    const lines = this.wrap(text, this.font, size, CONTENT_W - 22);
    lines.forEach((line, i) => {
      this.ensure(lineHeight);
      this.page.drawText(line, { x: MARGIN + 22, y: this.y, size, font: this.font, color: INK });
      this.y -= lineHeight;
      if (i < lines.length - 1) this.ensure(lineHeight);
    });
    this.y -= 2;
  }

  spacer(h = 8) {
    this.y -= h;
  }

  rule() {
    this.ensure(12);
    this.y -= 4;
    this.page.drawLine({ start: { x: MARGIN, y: this.y }, end: { x: PAGE_W - MARGIN, y: this.y }, thickness: 0.75, color: LINE });
    this.y -= 10;
  }

  /** Draws a right-aligned string at a given x-right boundary. */
  rightText(text: string, xRight: number, size: number, font: PDFFont, color = INK) {
    const s = ascii(text);
    const w = font.widthOfTextAtSize(s, size);
    this.page.drawText(s, { x: xRight - w, y: this.y, size, font, color });
  }

  private stampFooters() {
    const pages = this.doc.getPages();
    pages.forEach((p, i) => {
      p.drawText(ascii(`${COMPANY} · ${COMPANY_ADDRESS}`), { x: MARGIN, y: MARGIN - 24, size: 8, font: this.font, color: MUTED });
      const label = `Page ${i + 1} of ${pages.length}`;
      const w = this.font.widthOfTextAtSize(label, 8);
      p.drawText(label, { x: PAGE_W - MARGIN - w, y: MARGIN - 24, size: 8, font: this.font, color: MUTED });
    });
  }

  async save(): Promise<Buffer> {
    this.stampFooters();
    const bytes = await this.doc.save();
    return Buffer.from(bytes);
  }
}

/** Renders a proposal/agreement/etc. (Markdown body) to a branded PDF. */
export async function renderDocumentPdf(args: { title: string; contentMd: string }): Promise<Buffer> {
  const b = new PdfBuilder(args.title);
  await b.init();

  b.paragraph(args.title, { size: 20, font: b.bold, color: INK, gap: 2 });
  b.paragraph(new Date().toLocaleDateString("en-CA", { dateStyle: "long" }), { size: 9, color: MUTED, gap: 6 });
  b.rule();

  for (const raw of (args.contentMd || "").replace(/\r\n/g, "\n").split("\n")) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      b.spacer(5);
      continue;
    }
    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length;
      b.heading(stripInline(heading[2]), level <= 1 ? 15 : level === 2 ? 13 : 11.5);
      continue;
    }
    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    if (bullet) {
      b.bullet(stripInline(bullet[1]));
      continue;
    }
    const numbered = line.match(/^\s*(\d+)\.\s+(.*)$/);
    if (numbered) {
      b.bullet(`${numbered[1]}. ${stripInline(numbered[2])}`);
      continue;
    }
    if (/^\s*(---|\*\*\*|___)\s*$/.test(line)) {
      b.rule();
      continue;
    }
    b.paragraph(stripInline(line));
  }

  return b.save();
}

/** Renders a branded invoice PDF with a line-item table. */
export async function renderInvoicePdf(invoice: Invoice, lead: Lead | null): Promise<Buffer> {
  const b = new PdfBuilder(`Invoice ${invoice.number}`);
  await b.init();

  b.paragraph("INVOICE", { size: 22, font: b.bold, color: INK, gap: 2 });
  b.paragraph(`Invoice ${invoice.number}`, { size: 10, color: MUTED, gap: 1 });
  b.paragraph(`Issued: ${new Date(invoice.created_at).toLocaleDateString("en-CA", { dateStyle: "long" })}`, { size: 10, color: MUTED, gap: 1 });
  if (invoice.due_on) b.paragraph(`Due: ${invoice.due_on}`, { size: 10, color: MUTED, gap: 1 });
  b.spacer(8);

  b.paragraph("Bill to", { size: 9, font: b.bold, color: MUTED, gap: 2 });
  if (lead) {
    b.paragraph(lead.company || lead.name, { size: 11, font: b.bold, gap: 1 });
    if (lead.company && lead.name) b.paragraph(lead.name, { size: 10, color: MUTED, gap: 1 });
    b.paragraph(lead.email, { size: 10, color: MUTED, gap: 1 });
  }
  b.spacer(10);
  b.rule();

  // Table header
  const xDesc = MARGIN;
  const xQty = PAGE_W - MARGIN - 200;
  const xUnit = PAGE_W - MARGIN - 110;
  const xAmt = PAGE_W - MARGIN;
  b.page.drawText("Description", { x: xDesc, y: b.y, size: 9, font: b.bold, color: MUTED });
  b.page.drawText("Qty", { x: xQty, y: b.y, size: 9, font: b.bold, color: MUTED });
  b.rightText("Unit", xUnit + 30, 9, b.bold, MUTED);
  b.rightText("Amount", xAmt, 9, b.bold, MUTED);
  b.y -= 16;

  for (const li of invoice.line_items) {
    const amount = (Number(li.quantity) || 0) * (Number(li.unit_amount) || 0);
    const descLines = b.wrap(li.description, b.font, 10, xQty - xDesc - 12);
    const rowH = Math.max(descLines.length * 14, 16);
    b.ensure(rowH);
    descLines.forEach((line: string, i: number) => {
      b.page.drawText(line, { x: xDesc, y: b.y - i * 14, size: 10, font: b.font, color: INK });
    });
    b.page.drawText(String(li.quantity), { x: xQty, y: b.y, size: 10, font: b.font, color: INK });
    b.rightText(cad.format(Number(li.unit_amount) || 0), xUnit + 30, 10, b.font);
    b.rightText(cad.format(amount), xAmt, 10, b.font);
    b.y -= rowH + 4;
  }

  b.rule();
  b.ensure(24);
  b.page.drawText("Total", { x: xUnit - 20, y: b.y, size: 12, font: b.bold, color: INK });
  b.rightText(cad.format(Number(invoice.amount) || 0), xAmt, 12, b.bold, INK);
  b.y -= 26;

  if (invoice.notes) {
    b.spacer(4);
    b.paragraph("Notes", { size: 9, font: b.bold, color: MUTED, gap: 2 });
    b.paragraph(invoice.notes, { size: 10, color: INK });
  }

  b.spacer(8);
  b.paragraph("Payment", { size: 9, font: b.bold, color: MUTED, gap: 2 });
  if (invoice.method === "etransfer") {
    b.paragraph(
      ETRANSFER_EMAIL
        ? `Please pay by Interac e-Transfer to ${ETRANSFER_EMAIL}, using the invoice number (${invoice.number}) as the message.`
        : `Please reply to this invoice for payment instructions.`,
      { size: 10, color: INK },
    );
  } else {
    b.paragraph("Payable online via the Stripe payment link sent with this invoice.", { size: 10, color: INK });
  }

  return b.save();
}

/** Drops inline Markdown emphasis/link syntax for plain-text PDF rendering. */
function stripInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/(^|[^*])\*(?!\s)(.+?)\*/g, "$1$2")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}
