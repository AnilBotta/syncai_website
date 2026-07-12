"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

export type ChartSeries = {
  id: string;
  label: string;
  data: { label: string; value: number }[];
  /** solid = primary line + gradient area; dashed = comparison line, no area. */
  style?: "solid" | "dashed";
  showArea?: boolean;
};

type GradientAreaChartProps = {
  series: ChartSeries[];
  height?: number;
  ariaLabel: string;
  valueFormatter?: (n: number) => string;
  /** Compact = sparkline (no grid, no labels, no value tag). */
  compact?: boolean;
  className?: string;
};

const PAD = { top: 16, right: 16, bottom: 24, left: 8 };
const VIEW_W = 720;

/**
 * Dependency-free smooth area/line chart. Catmull-Rom → cubic-bezier smoothing,
 * gradient fill via a useId()-scoped <linearGradient> (no collisions when two
 * charts render on one page). Handles empty / single-point / all-zero gracefully.
 */
export function GradientAreaChart({
  series,
  height = 240,
  ariaLabel,
  valueFormatter = (n) => String(Math.round(n)),
  compact = false,
  className,
}: GradientAreaChartProps) {
  const gid = useId().replace(/:/g, "");
  const pad = compact ? { top: 6, right: 6, bottom: 6, left: 6 } : PAD;
  const innerW = VIEW_W - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const withData = series.filter((s) => s.data.length > 0);
  const maxLen = Math.max(0, ...withData.map((s) => s.data.length));

  if (!withData.length || maxLen === 0) {
    return (
      <div
        className={cn("grid place-items-center rounded-[var(--radius-control)] bg-foreground/[.03] text-xs text-muted", className)}
        style={{ height }}
      >
        No data yet.
      </div>
    );
  }

  const maxVal = Math.max(1, ...withData.flatMap((s) => s.data.map((d) => d.value)));
  const x = (i: number, len: number) => pad.left + (len <= 1 ? innerW / 2 : (i / (len - 1)) * innerW);
  const y = (v: number) => pad.top + innerH - (v / maxVal) * innerH;

  const baseSeries = withData.find((s) => (s.style ?? "solid") === "solid") ?? withData[0];
  const labels = baseSeries.data.map((d) => d.label);

  // Grid lines (4 rows).
  const gridYs = compact ? [] : [0, 0.25, 0.5, 0.75, 1].map((f) => pad.top + innerH * f);

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${height}`}
      className={cn("w-full", className)}
      role="img"
      aria-label={ariaLabel}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={`grad-${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--chart-grad-start)" />
          <stop offset="100%" stopColor="var(--chart-grad-end)" />
        </linearGradient>
      </defs>

      {gridYs.map((gy, i) => (
        <line key={i} x1={pad.left} y1={gy} x2={VIEW_W - pad.right} y2={gy} stroke="var(--chart-grid)" strokeWidth={1} />
      ))}

      {withData.map((s) => {
        const pts = s.data.map((d, i) => [x(i, s.data.length), y(d.value)] as const);
        const line = smoothPath(pts);
        const dashed = (s.style ?? "solid") === "dashed";
        const area = (s.showArea ?? !dashed) && pts.length > 1;
        const stroke = dashed ? "var(--chart-line-compare)" : "var(--chart-line)";
        return (
          <g key={s.id}>
            {area ? (
              <path
                d={`${line} L ${pts[pts.length - 1][0]},${pad.top + innerH} L ${pts[0][0]},${pad.top + innerH} Z`}
                fill={`url(#grad-${gid})`}
              />
            ) : null}
            <path
              d={line}
              fill="none"
              stroke={stroke}
              strokeWidth={dashed ? 2 : 2.5}
              strokeDasharray={dashed ? "5 5" : undefined}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {pts.length === 1 ? <circle cx={pts[0][0]} cy={pts[0][1]} r={4} fill={stroke} /> : null}
          </g>
        );
      })}

      {/* Last-point marker + value tag on the base series. */}
      {!compact && baseSeries.data.length > 1
        ? (() => {
            const i = baseSeries.data.length - 1;
            const cx = x(i, baseSeries.data.length);
            const cy = y(baseSeries.data[i].value);
            return (
              <g>
                <circle cx={cx} cy={cy} r={4} fill="var(--chart-line)" stroke="#fff" strokeWidth={2} />
                <text x={cx - 6} y={Math.max(cy - 10, 12)} textAnchor="end" className="fill-foreground" fontSize={12} fontWeight={800}>
                  {valueFormatter(baseSeries.data[i].value)}
                </text>
              </g>
            );
          })()
        : null}

      {/* X labels — every Nth to avoid crowding. */}
      {!compact
        ? labels.map((label, i) => {
            const step = Math.ceil(labels.length / 6);
            if (i % step !== 0 && i !== labels.length - 1) return null;
            return (
              <text
                key={i}
                x={x(i, labels.length)}
                y={height - 6}
                textAnchor="middle"
                className="fill-muted"
                fontSize={10}
                fontWeight={600}
              >
                {label}
              </text>
            );
          })
        : null}
    </svg>
  );
}

/** Catmull-Rom spline → SVG cubic-bezier path for smooth lines. */
function smoothPath(points: readonly (readonly [number, number])[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0][0]},${points[0][1]}`;
  let d = `M ${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
  }
  return d;
}
