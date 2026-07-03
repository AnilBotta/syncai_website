/**
 * Mutable scroll-progress store shared between the DOM (Framer useScroll)
 * and the R3F frameloop — written and read without React re-renders.
 */
export const scrollProgress = { current: 0 };

export function setScrollProgress(value: number) {
  scrollProgress.current = value;
}
