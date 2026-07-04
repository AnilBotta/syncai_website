"use client";

import { cn } from "@/lib/utils";

type Option = {
  value: string;
  label: string;
  hint?: string;
};

type OptionGridProps = {
  options: Option[];
  value: string | null;
  onChange: (value: string) => void;
  columns?: 1 | 2;
};

/** Radio-style selectable glass pills used by the tool forms and quizzes. */
export function OptionGrid({ options, value, onChange, columns = 1 }: OptionGridProps) {
  return (
    <div className={cn("grid gap-2", columns === 2 && "sm:grid-cols-2")} role="radiogroup">
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              "cursor-pointer rounded-2xl border px-4 py-3.5 text-left text-sm font-semibold transition",
              selected
                ? "border-brand-soft bg-brand-deep/25 text-brand-glow-text shadow-[0_0_16px_rgba(160,120,255,0.25)]"
                : "border-border-subtle bg-surface text-foreground/90 hover:border-brand-soft/40"
            )}
          >
            {option.label}
            {option.hint ? <span className="mt-0.5 block text-xs font-normal text-muted">{option.hint}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
