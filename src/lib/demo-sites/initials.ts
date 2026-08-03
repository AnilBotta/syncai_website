/**
 * Monogram for a business name.
 *
 * Skips words that don't start with a letter, so "Maple & Vine Realty" gives MV
 * rather than M&. Shared by the page header, the footer and the assistant panel
 * — they drifted apart once already and produced two different monograms on the
 * same page.
 */
export function businessInitials(name: string) {
  return name
    .split(" ")
    .filter((word) => /^[A-Za-z]/.test(word))
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}
