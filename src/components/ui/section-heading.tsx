import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "center" | "left";
  className?: string;
};

/** Eyebrow + heading + optional description in the dark cinematic language. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("max-w-3xl", align === "center" ? "mx-auto text-center" : "", className)}>
      <p className="text-sm font-black uppercase tracking-[.25em] text-brand">{eyebrow}</p>
      <h2 className="mt-4 text-3xl font-black tracking-tight text-foreground sm:text-5xl">{title}</h2>
      {description ? <p className="mt-5 text-lg leading-8 text-muted">{description}</p> : null}
    </div>
  );
}
