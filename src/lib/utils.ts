import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Date / Time Utilities ────────────────────────────────────────────────────

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/**
 * Returns the next Wednesday at 8 PM IST as a JavaScript Date (UTC).
 * If today IS Wednesday and the time hasn't passed yet, returns today's 8 PM IST.
 */
export function getNextWednesday8PmIST(): Date {
  const nowUtc = Date.now();
  const nowIST = new Date(nowUtc + IST_OFFSET_MS);

  const dayIST = nowIST.getUTCDay(); // 0=Sun, 3=Wed
  const hourIST = nowIST.getUTCHours();
  const minuteIST = nowIST.getUTCMinutes();

  // Days until next Wednesday
  let daysUntilWed = (3 - dayIST + 7) % 7;
  if (daysUntilWed === 0 && (hourIST > 20 || (hourIST === 20 && minuteIST > 0))) {
    daysUntilWed = 7; // Already passed this Wednesday → next one
  }

  // Build the target date in IST (as UTC internal)
  const targetIST = new Date(nowIST);
  targetIST.setUTCDate(targetIST.getUTCDate() + daysUntilWed);
  targetIST.setUTCHours(20, 0, 0, 0); // 8 PM IST

  // Convert back to real UTC
  return new Date(targetIST.getTime() - IST_OFFSET_MS);
}

/**
 * Formats a countdown duration (seconds) into { days, hours, minutes, seconds }.
 */
export function formatCountdown(totalSeconds: number) {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

/**
 * Formats a date for display as "Friday, 4 Jul 2025" in IST.
 */
export function formatWeekLabel(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

/**
 * Zero-pads a number to 2 digits.
 */
export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}
