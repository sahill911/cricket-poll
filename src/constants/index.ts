// ─── Registration Rules ───────────────────────────────────────────────────────

export const DEFAULT_PLAYER_LIMIT = 16;
export const DEFAULT_WAITLIST_LIMIT = 2;

// Registration opens every Wednesday at 8:00 PM IST
export const REGISTRATION_DAY = 3; // 0 = Sunday, 3 = Wednesday
export const REGISTRATION_HOUR_IST = 20; // 8 PM
export const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // UTC+5:30

// ─── Firestore Paths ─────────────────────────────────────────────────────────

export const COLLECTIONS = {
  EVENTS: "events",
  REGISTRATIONS: "registrations",
  USERS: "users",
  CONFIG: "config",
} as const;

export const CONFIG_DOC_ID = "app";

// ─── UI ───────────────────────────────────────────────────────────────────────

export const APP_NAME = "Cricket Poll";
export const APP_TAGLINE = "Friday Night Cricket · FCFS Registration";
