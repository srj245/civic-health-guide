import { useEffect, useRef } from "react";
import { PRELOAD_EVENT } from "@/components/motion/Preloader";

/**
 * Runs the page entrance once per load, starting the moment the preloader lifts.
 *
 * Targets are found by `data-io` attribute inside `root`:
 *   mark, rule, nav (each child), eyebrow, line1, line2, sub, btn, link, arrow, ticker.
 * While the `intro` class is on the root, CSS keeps those elements hidden.
 * The hook waits for fonts (capped at 900ms) and for `civiccare:ready` from the
 * preloader (capped at 2000ms), animates with the Web Animations API, then
 * removes the class. It never runs under reduced motion or without WAAPI, and
 * never twice in one page load.
 */
let played = false;

const QUINT = "cubic-bezier(0.22, 1, 0.36, 1)";
const EXPO = "cubic-bezier(0.16, 1, 0.3, 1)";

function waitForPreloader(capMs: number) {
  return new Promise<void>((resolve) => {
    if (document.documentElement.dataset.preload === "done") return resolve();
    const t = window.setTimeout(done, capMs);
    function done() {
      window.clearTimeout(t);
      window.removeEventListener(PRELOAD_EVENT, done);
      resolve();
    }
    window.addEventListener(PRELOAD_EVENT, done);
  });
}

export function useIntro<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (played) return;
    const canAnimate =
      typeof window !== "undefined" &&
      "animate" in HTMLElement.prototype &&
      typeof window.matchMedia === "function";
    const reduced = canAnimate && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!canAnimate || reduced) {
      document.documentElement.dataset.intro = "done";
      return;
    }
    played = true;
    root.classList.add("intro");

    let started = false;
    let cancelled = false;
    const failsafe = window.setTimeout(() => {
      if (!started) root.classList.remove("intro");
    }, 4000);

    const q = (name: string) => Array.from(root.querySelectorAll<HTMLElement>(`[data-io="${name}"]`));
    const mark = q("mark")[0];
    const k = Math.min(1, Math.max(0.65, (mark?.getBoundingClientRect().height || 23.5) / 23.5));

    const start = () => {
      if (cancelled || started) return;
      started = true;
      const anims: Animation[] = [];
      const run = (el: HTMLElement | undefined, frames: Keyframe[], delay: number, duration: number, easing: string) => {
        if (!el) return;
        anims.push(el.animate(frames, { delay, duration, easing, fill: "both" }));
      };

      run(mark, [{ opacity: 0, transform: `translateY(${-6 * k}px)` }, { opacity: 1, transform: "none" }], 60, 900, QUINT);
      run(q("rule")[0], [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], 180, 1000, "cubic-bezier(0.7, 0, 0.2, 1)");

      const navItems = q("nav");
      const mid = Math.floor(navItems.length / 2);
      navItems.forEach((el, i) => {
        run(el, [{ opacity: 0, transform: `translateY(${-4 * k}px)` }, { opacity: 1, transform: "none" }], i === mid ? 420 : 490, 700, QUINT);
      });

      run(q("eyebrow")[0], [{ opacity: 0, transform: `translateY(${6 * k}px)` }, { opacity: 1, transform: "none" }], 140, 800, QUINT);
      run(q("line1")[0], [{ transform: "translateY(104%)" }, { transform: "none" }], 200, 1100, EXPO);
      run(q("line2")[0], [{ transform: "translateY(104%)" }, { transform: "none" }], 290, 1100, EXPO);
      run(q("sub")[0], [{ opacity: 0, transform: `translateY(${10 * k}px)` }, { opacity: 1, transform: "none" }], 700, 850, QUINT);
      run(q("btn")[0], [{ opacity: 0, transform: `translateY(${12 * k}px) scale(0.975)` }, { opacity: 1, transform: "none" }], 860, 900, EXPO);
      run(q("link")[0], [{ opacity: 0, transform: `translateY(${6 * k}px)` }, { opacity: 1, transform: "none" }], 1040, 700, QUINT);
      run(q("arrow")[0], [{ transform: `translateY(${-5 * k}px)` }, { transform: "none" }], 1120, 820, EXPO);
      run(q("ticker")[0], [{ opacity: 0, transform: `translateY(${8 * k}px)` }, { opacity: 1, transform: "none" }], 1250, 900, QUINT);

      Promise.all(anims.map((a) => a.finished.catch(() => undefined))).then(() => {
        if (cancelled) return;
        root.classList.remove("intro");
        anims.forEach((a) => a.cancel());
        // The magnetic button owns its transform after the entrance.
        q("btn")[0]?.style.removeProperty("transform");
        if (!root.contains(document.activeElement)) {
          root.style.display = "none";
          void root.offsetHeight;
          root.style.display = "";
        }
        document.documentElement.dataset.intro = "done";
      });
    };

    const fontsReady = (document.fonts?.ready ?? Promise.resolve()).then(() => undefined);
    const fontsCap = new Promise<void>((r) => window.setTimeout(r, 900));
    Promise.all([Promise.race([fontsReady, fontsCap]), waitForPreloader(2000)]).then(start);

    return () => {
      cancelled = true;
      window.clearTimeout(failsafe);
      root.classList.remove("intro");
    };
  }, []);

  return ref;
}
