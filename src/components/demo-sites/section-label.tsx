/**
 * Numbered micro-label — "01 — Services".
 *
 * The editorial spine of the demo layout: it gives every section an anchor in the
 * left gutter and does most of the work of making the page feel composed rather
 * than stacked.
 */
export function SectionLabel({
  index,
  children,
  className = "",
}: {
  index: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`demo-label flex items-center gap-3 text-brand-glow-text ${className}`}
    >
      <span className="tabular-nums">{String(index).padStart(2, "0")}</span>
      <span aria-hidden className="h-px w-8 bg-current opacity-40" />
      <span>{children}</span>
    </p>
  );
}
