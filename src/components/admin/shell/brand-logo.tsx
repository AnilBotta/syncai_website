"use client";

// The SyncAI wordmark PNGs are 1000x1000 canvases with the actual mark at
// (230, 424) sized 551x151 — crop the transparent padding with a background
// offset so the wordmark fills the display box exactly. Same technique and
// measured constants as the syncai-office dashboard sidebar.
const CONTENT_X = 230;
const CONTENT_Y = 424;
const CONTENT_W = 551;
const CONTENT_H = 151;
const CANVAS = 1000;

const LOGO_DARK_SRC = "/syncai-logo-dark.png"; // white "Sync" for dark backgrounds
const LOGO_LIGHT_SRC = "/syncai-logo-light.png"; // black "Sync" for light backgrounds

type BrandLogoProps = {
  theme: "dark" | "light";
  /** Display width in px; height follows the wordmark's aspect ratio. */
  width?: number;
  className?: string;
};

export function BrandLogo({ theme, width = 150, className }: BrandLogoProps) {
  const height = Math.round(width * (CONTENT_H / CONTENT_W));
  const scaleX = width / CONTENT_W;
  const scaleY = height / CONTENT_H;
  const src = theme === "dark" ? LOGO_DARK_SRC : LOGO_LIGHT_SRC;

  return (
    <div
      role="img"
      aria-label="SyncAI"
      className={className}
      style={{
        width,
        height,
        backgroundImage: `url('${src}')`,
        backgroundRepeat: "no-repeat",
        backgroundSize: `${CANVAS * scaleX}px ${CANVAS * scaleY}px`,
        backgroundPosition: `-${CONTENT_X * scaleX}px -${CONTENT_Y * scaleY}px`,
      }}
    />
  );
}
