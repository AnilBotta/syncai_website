type MiniBarChartProps = {
  data: { label: string; value: number }[];
};

/** Hand-rolled SVG bar chart — no charting library needed for one metric. */
export function MiniBarChart({ data }: MiniBarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const width = 700;
  const height = 180;
  const barGap = 6;
  const barWidth = data.length ? width / data.length - barGap : 0;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="New leads per week">
      {data.map((d, i) => {
        const barHeight = Math.max(2, (d.value / max) * (height - 28));
        const x = i * (barWidth + barGap);
        const y = height - barHeight - 20;
        return (
          <g key={d.label}>
            <rect
              x={x}
              y={y}
              width={Math.max(2, barWidth)}
              height={barHeight}
              rx={6}
              className="fill-brand-deep/80"
            />
            {d.value > 0 ? (
              <text
                x={x + barWidth / 2}
                y={y - 6}
                textAnchor="middle"
                className="fill-current text-[10px] font-bold text-foreground"
              >
                {d.value}
              </text>
            ) : null}
            <text
              x={x + barWidth / 2}
              y={height - 4}
              textAnchor="middle"
              className="fill-current text-[9px] font-semibold text-muted"
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
