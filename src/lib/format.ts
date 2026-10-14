/** "1st", "2nd", "3rd", "4th", "11th", "112th", "119th" ... */
export function ordinal(n: number | string): string {
  const num = Number(n);
  if (!Number.isFinite(num)) return String(n);
  const abs = Math.abs(num);
  const mod100 = abs % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${num}th`;
  switch (abs % 10) {
    case 1: return `${num}st`;
    case 2: return `${num}nd`;
    case 3: return `${num}rd`;
    default: return `${num}th`;
  }
}

/** Escape a string for safe insertion into an HTML string (not needed for JSX). */
export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
