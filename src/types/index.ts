import { Timestamp } from "firebase/firestore";

// ─── Event ────────────────────────────────────────────────────────────────────

export type EventStatus = "upcoming" | "open" | "closed";

export interface CricketEvent {
  id: string;
  weekLabel: string;
  status: EventStatus;
  registrationOpensAt: Timestamp;   // informational — admin sets this
  playerLimit: number;
  waitlistLimit: number;
  confirmedCount: number;
  waitingCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Registration ─────────────────────────────────────────────────────────────

export type RegistrationStatus = "confirmed" | "waiting" | "cancelled";

export interface Registration {
  registrationId: string;   // doc ID — UUID, returned to client for cancellation
  playerName: string;       // display name entered by player
  status: RegistrationStatus;
  position: number;
  registeredAt: Timestamp;
  cancelledAt: Timestamp | null;
}

// ─── App Config ───────────────────────────────────────────────────────────────

export interface AppConfig {
  currentEventId: string;
  playerLimit: number;
  waitlistLimit: number;
}

// ─── Local Player State (stored in localStorage) ──────────────────────────────

export interface LocalPlayerState {
  playerName: string;
  registrationId: string;
  eventId: string;
  status: "confirmed" | "waiting";
  position: number;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export interface ApiResponse<T = null> {
  success: boolean;
  data?: T;
  error?: string;
}
