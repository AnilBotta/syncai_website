/**
 * Fixed, slowly-drifting pastel mesh background (blue → lavender → purple).
 * Sits behind all light content; dark `theme-dark` islands paint over it.
 * Pure CSS — freezes to a static mesh under prefers-reduced-motion.
 */
export function AmbientGradient() {
  return (
    <div className="ambient-gradient" aria-hidden>
      <span className="ambient-gradient__blob ambient-gradient__blob--1" />
      <span className="ambient-gradient__blob ambient-gradient__blob--2" />
      <span className="ambient-gradient__blob ambient-gradient__blob--3" />
      <span className="ambient-gradient__blob ambient-gradient__blob--4" />
    </div>
  );
}
