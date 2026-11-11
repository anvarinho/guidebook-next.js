/** Scroll-position maths shared by the motion fallback and the section indicator. No DOM access. */

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/**
 * Arrival progress, matching the CSS range `cover <from> cover <from + span>`: 0 when the top
 * edge is `from` pixels inside the viewport's bottom edge, 1 after `span` more pixels of scroll.
 */
export function enterProgress(top: number, scrollY: number, viewport: number, span: number, from = 0) {
  return clamp01((scrollY + viewport - top - from) / Math.max(1, span));
}

/** Departure progress, matching the CSS range `exit 0% exit 100%`. */
export function exitProgress(top: number, height: number, scrollY: number, viewport: number) {
  const start = Math.max(top, top + height - viewport);
  return clamp01((scrollY - start) / Math.max(1, top + height - start));
}

export type SectionBox = { top: number; bottom: number };

/**
 * Scroll positions at which each section becomes the current one, followed by the position at
 * which the last one ends. A section is current once its top passes `anchor` pixels below the
 * top of the viewport. When the page ends before the last stops can be reached, the remaining
 * ones are squeezed into the final screen of scrolling so every line can still fill.
 */
export function sectionStops(boxes: SectionBox[], anchor: number, maxScroll: number, viewport: number) {
  if (!boxes.length) return [];
  const stops = boxes.map(box => Math.max(0, box.top - anchor));
  stops.push(Math.max(stops[stops.length - 1], Math.max(...boxes.map(box => box.bottom)) - anchor));
  const last = stops[stops.length - 1];
  const limit = Math.max(0, maxScroll);
  if (last <= limit) return stops;
  const knee = Math.min(limit, Math.max(stops[0], limit - viewport));
  return stops.map(stop => stop <= knee ? stop : knee + (stop - knee) * (limit - knee) / (last - knee));
}

/** The current section (-1 above the first one) and how far each section has been read. */
export function sectionProgress(stops: number[], scrollY: number) {
  const progress: number[] = [];
  let index = -1;
  for (let i = 0; i < stops.length - 1; i++) {
    if (scrollY >= stops[i]) index = i;
    progress.push(stops[i + 1] > stops[i] ? clamp01((scrollY - stops[i]) / (stops[i + 1] - stops[i])) : Number(scrollY >= stops[i]));
  }
  return { index, progress };
}
