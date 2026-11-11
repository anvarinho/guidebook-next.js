type ScrollListener = (scrollY: number, viewport: number) => void;

const listeners = new Set<ScrollListener>();
let frame = 0;

const run = () => {
  frame = 0;
  const scrollY = Math.max(0, window.scrollY);
  const viewport = window.innerHeight;
  listeners.forEach(listener => listener(scrollY, viewport));
};
const schedule = () => { if (!frame) frame = requestAnimationFrame(run); };

/**
 * One passive scroll/resize listener, throttled to animation frames, for everything that follows
 * scroll position. The listener is also called once immediately. Returns the unsubscribe function.
 */
export function onScrollFrame(listener: ScrollListener) {
  if (!listeners.size) {
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
  }
  listeners.add(listener);
  listener(Math.max(0, window.scrollY), window.innerHeight);
  return () => {
    listeners.delete(listener);
    if (listeners.size) return;
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
    cancelAnimationFrame(frame);
    frame = 0;
  };
}

/** Ask for the listeners to run on the next frame, e.g. after geometry was measured again. */
export const requestScrollFrame = schedule;

/** Distance from the top of the page to the element's layout box, ignoring transforms. */
export function pageTop(element: HTMLElement) {
  let top = 0;
  for (let node: HTMLElement | null = element; node; node = node.offsetParent as HTMLElement | null) top += node.offsetTop;
  return top;
}
