type CategoryBarsProps = {
  categories: { label: string; score: number; max: number }[];
};

/** Horizontal bar chart for category scores — plain divs, no chart library. */
export function CategoryBars({ categories }: CategoryBarsProps) {
  return (
    <div className="grid gap-4">
      {categories.map((category) => {
        const percent = Math.round((category.score / category.max) * 100);
        return (
          <div key={category.label}>
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-semibold text-foreground/90">{category.label}</span>
              <span className="text-xs font-bold tabular-nums text-muted">
                {Math.round(category.score)}/{category.max}
              </span>
            </div>
            <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-border-subtle">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-electric to-brand-soft transition-[width] duration-700"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
