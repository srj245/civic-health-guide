import { useEffect, type RefObject } from "react";

const finePointer = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(pointer: fine)").matches &&
  !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * Spotlight: every `[data-spotlight]` element inside `root` tracks the cursor
 * with `--mx` / `--my` custom properties. The CSS draws a soft radial highlight
 * on the border and surface at that point.
 */
export function useSpotlight(root: RefObject<HTMLElement>) {
  useEffect(() => {
    const el = root.current;
    if (!el || !finePointer()) return;
    const onMove = (e: PointerEvent) => {
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-spotlight]");
      if (!target || !el.contains(target)) return;
      const r = target.getBoundingClientRect();
      target.style.setProperty("--mx", `${e.clientX - r.left}px`);
      target.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    el.addEventListener("pointermove", onMove, { passive: true });
    return () => el.removeEventListener("pointermove", onMove);
  }, [root]);
}

/**
 * Magnetic: the element drifts a few pixels toward the cursor while hovered
 * and springs back on leave. Strength is the fraction of the offset applied.
 */
export function useMagnetic<T extends HTMLElement>(ref: RefObject<T>, strength = 0.18, radius = 90) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !finePointer()) return;
    let raf = 0;
    let tx = 0;
    let ty = 0;
    const apply = () => {
      raf = 0;
      el.style.transform = `translate(${tx}px, ${ty}px)`;
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist > radius + Math.max(r.width, r.height) / 2) {
        tx = 0;
        ty = 0;
      } else {
        tx = dx * strength;
        ty = dy * strength;
      }
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    el.style.transition = "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), background-color 0.2s, box-shadow 0.2s";
    window.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref, strength, radius]);
}
