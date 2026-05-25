/**
 * Date utility helpers for UTC ↔ IST display conversion.
 *
 * All dates are stored in UTC. These helpers format them for display
 * in Indian Standard Time (IST, Asia/Kolkata).
 */

import { DISPLAY_TIMEZONE, DATE_FORMAT, DATETIME_FORMAT } from "./constants";

/**
 * Format a UTC date for display in IST.
 * @param date - Date object or ISO string
 * @param includeTime - If true, includes time in the output
 * @returns Formatted date string in IST
 */
export function formatDateIST(
  date: Date | string | null | undefined,
  includeTime = false
): string {
  if (!date) return "—";

  const d = typeof date === "string" ? new Date(date) : date;

  if (isNaN(d.getTime())) return "—";

  return d.toLocaleString("en-IN", {
    timeZone: DISPLAY_TIMEZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(includeTime && {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
  });
}

/**
 * Get a relative time string (e.g., "2 hours ago", "just now").
 */
export function relativeTime(date: Date | string | null | undefined): string {
  if (!date) return "—";

  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "—";

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;

  return formatDateIST(d);
}

/**
 * Get the current time in IST as a formatted string.
 */
export function nowIST(includeTime = true): string {
  return formatDateIST(new Date(), includeTime);
}
