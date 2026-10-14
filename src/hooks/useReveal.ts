import { useEffect, useRef } from "react";

/**
 * Scroll-triggered reveal.
 *
 * The element gets `data-reveal` (hidden state) only after JavaScript has
 * attached (`html[data-js]`), so content is never hidden without it. When the
 * element enters the viewport, `data-reveal="in"` runs the CSS animation.
 * Falls back to visible when IntersectionObserver is missing, when reduced
 * motion is requested, or after a 1500ms failsafe.
 */
export function useReveal<T extends HTMLElement>(options?: { once?: boolean; rootMargin?: string }) {
  const ref = useRef<T>(null);
  const once = options?.once ?? true;
  const rootMargin = options?.rootMargin ?? "0px 0px -8% 0px";

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) {
      el.setAttribute("data-reveal", "in");
      return;
    }
    el.setAttribute("data-reveal", "");
    const failsafe = window.setTimeout(() => el.setAttribute("data-reveal", "in"), 1500);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.setAttribute("data-reveal", "in");
            window.clearTimeout(failsafe);
            if (once) io.disconnect();
          } else if (!once) {
            el.setAttribute("data-reveal", "");
          }
        }
      },
      { rootMargin, threshold: 0.08 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(failsafe);
    };
  }, [once, rootMargin]);

  return ref;
}
