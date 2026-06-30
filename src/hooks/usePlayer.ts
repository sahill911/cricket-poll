"use client";

import { useState, useEffect, useCallback } from "react";
import { LocalPlayerState } from "@/types";

const LS_KEY = "cricket_registration";

interface UsePlayerReturn {
  localState: LocalPlayerState | null;
  registerPlayer: (playerName: string, eventId: string) => Promise<{ success: boolean; error?: string }>;
  cancelPlayer: () => Promise<{ success: boolean; error?: string }>;
  clearLocalState: () => void;
}

/**
 * Manages the player's registration state in localStorage.
 * No Firebase Auth — players just enter a name.
 *
 * localStorage key: "cricket_registration"
 * Value: { playerName, registrationId, eventId, status, position }
 *
 * If the stored eventId differs from the current event, we discard it
 * (they registered for a previous week).
 */
export function usePlayer(currentEventId: string | null | undefined): UsePlayerReturn {
  const [localState, setLocalState] = useState<LocalPlayerState | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as LocalPlayerState;
      // Only keep if it's for the current event
      if (currentEventId && parsed.eventId === currentEventId) {
        setLocalState(parsed);
      }
    } catch {
      localStorage.removeItem(LS_KEY);
    }
  }, [currentEventId]);

  const registerPlayer = useCallback(async (playerName: string, eventId: string) => {
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName: playerName.trim() }),
      });
      const data = await res.json();

      if (!data.success) {
        return { success: false, error: data.error ?? "Registration failed." };
      }

      const state: LocalPlayerState = {
        playerName: playerName.trim(),
        registrationId: data.data.registrationId,
        eventId,
        status: data.data.status,
        position: data.data.position,
      };
      localStorage.setItem(LS_KEY, JSON.stringify(state));
      setLocalState(state);
      return { success: true };
    } catch {
      return { success: false, error: "Network error. Please try again." };
    }
  }, []);

  const cancelPlayer = useCallback(async () => {
    if (!localState) return { success: false, error: "No active registration found." };
    try {
      const res = await fetch("/api/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId: localState.registrationId }),
      });
      const data = await res.json();

      if (!data.success) {
        return { success: false, error: data.error ?? "Cancellation failed." };
      }

      localStorage.removeItem(LS_KEY);
      setLocalState(null);
      return { success: true };
    } catch {
      return { success: false, error: "Network error. Please try again." };
    }
  }, [localState]);

  const clearLocalState = useCallback(() => {
    localStorage.removeItem(LS_KEY);
    setLocalState(null);
  }, []);

  return { localState, registerPlayer, cancelPlayer, clearLocalState };
}
