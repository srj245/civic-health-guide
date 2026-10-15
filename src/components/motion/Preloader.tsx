import { useEffect, useState } from "react";

/**
 * Branded first-load screen.
 *
 * Shows the wordmark with a hairline that draws across, then a progress line,
 * then fades out. Runs once per browser session and never longer than 1400ms.
 * When it finishes it dispatches `civiccare:ready` so the hero entrance can
 * start exactly as the curtain lifts.
 */
export const PRELOAD_EVENT = "civiccare:ready";
const SESSION_KEY = "civiccare-preloaded";
const MIN_MS = 700;
const MAX_MS = 1400;

function alreadyShown() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

function markShown() {
  try {
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    /* storage unavailable */
  }
}

export function signalReady() {
  document.documentElement.dataset.preload = "done";
  window.dispatchEvent(new Event(PRELOAD_EVENT));
}

const Preloader = () => {
  const [phase, setPhase] = useState<"show" | "leave" | "gone">(() => {
    if (typeof window === "undefined") return "gone";
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    return alreadyShown() || reduced ? "gone" : "show";
  });

  useEffect(() => {
    if (phase !== "show") {
      if (phase === "gone") signalReady();
      return;
    }
    const started = performance.now();
    let leaveTimer = 0;
    const leave = () => {
      const elapsed = performance.now() - started;
      leaveTimer = window.setTimeout(() => setPhase("leave"), Math.max(0, MIN_MS - elapsed));
    };
    const fonts = document.fonts?.ready ?? Promise.resolve();
    const cap = new Promise<void>((r) => window.setTimeout(r, MAX_MS));
    Promise.race([fonts.then(() => undefined), cap]).then(leave);
    return () => window.clearTimeout(leaveTimer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "leave") return;
    markShown();
    // Let the curtain start lifting before the hero entrance begins.
    const ready = window.setTimeout(signalReady, 220);
    const t = window.setTimeout(() => setPhase("gone"), 650);
    return () => {
      window.clearTimeout(ready);
      window.clearTimeout(t);
    };
  }, [phase]);

  if (phase === "gone") return null;

  return (
    <div className={`preloader ${phase === "leave" ? "is-leaving" : ""}`} aria-hidden="true">
      <div className="preloader-inner">
        <span className="preloader-mark">CivicCare</span>
        <span className="preloader-rule" />
        <span className="preloader-sub">Health policy, in plain English</span>
      </div>
      <span className="preloader-bar" />
    </div>
  );
};

export default Preloader;
