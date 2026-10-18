export type TimeAgoKey = "time.justNow" | "time.minAgo" | "time.hAgo" | "time.dAgo";

/** The message key and number for a relative time, so the UI can translate it. */
export function timeAgoParts(ms: number, now = Date.now()): { key: TimeAgoKey; n: number } {
  const s = Math.max(0, Math.round((now - ms) / 1000));
  if (s < 45) return { key: "time.justNow", n: 0 };
  const m = Math.round(s / 60);
  if (m < 60) return { key: "time.minAgo", n: m };
  const h = Math.round(m / 60);
  if (h < 24) return { key: "time.hAgo", n: h };
  const d = Math.round(h / 24);
  return { key: "time.dAgo", n: d };
}

/** "just now", "4 min ago", "2 h ago" for a timestamp in ms (English only). */
export function timeAgo(ms: number, now = Date.now()): string {
  const { key, n } = timeAgoParts(ms, now);
  switch (key) {
    case "time.justNow":
      return "just now";
    case "time.minAgo":
      return `${n} min ago`;
    case "time.hAgo":
      return `${n} h ago`;
    default:
      return `${n} d ago`;
  }
}
