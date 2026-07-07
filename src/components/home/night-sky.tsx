/**
 * Midnight-blue night sky rendered behind the transparent tour canvas.
 * Soft blue glows drift slowly; the in-scene starfield parallaxes on scroll.
 */
export function NightSky() {
  return (
    <div aria-hidden className="night-sky pointer-events-none absolute inset-0">
      <span className="night-sky__glow night-sky__glow--1" />
      <span className="night-sky__glow night-sky__glow--2" />
      <span className="night-sky__glow night-sky__glow--3" />
    </div>
  );
}
