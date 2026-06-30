"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { COLLECTIONS, CONFIG_DOC_ID } from "@/constants";
import { CricketEvent } from "@/types";

interface UseEventReturn {
  event: CricketEvent | null;
  loading: boolean;
  error: string | null;
}

/**
 * Realtime listener for the current cricket event.
 * Reads config/app to get currentEventId, then subscribes to events/{id}.
 */
export function useEvent(): UseEventReturn {
  const [event, setEvent] = useState<CricketEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Step 1: Subscribe to config doc to get the current event ID
    const configRef = doc(db, COLLECTIONS.CONFIG, CONFIG_DOC_ID);
    let eventUnsub: (() => void) | null = null;

    const configUnsub = onSnapshot(
      configRef,
      (configSnap) => {
        if (!configSnap.exists()) {
          setError("App config not found. Ask admin to initialise the event.");
          setLoading(false);
          return;
        }

        const currentEventId = configSnap.data().currentEventId as string;

        // Clean up previous event listener before subscribing to new one
        if (eventUnsub) eventUnsub();

        // Step 2: Subscribe to the current event document
        const eventRef = doc(db, COLLECTIONS.EVENTS, currentEventId);
        eventUnsub = onSnapshot(
          eventRef,
          (eventSnap) => {
            if (!eventSnap.exists()) {
              setEvent(null);
              setLoading(false);
              return;
            }
            setEvent({ id: eventSnap.id, ...eventSnap.data() } as CricketEvent);
            setLoading(false);
            setError(null);
          },
          (err) => {
            setError(err.message);
            setLoading(false);
          }
        );
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => {
      configUnsub();
      if (eventUnsub) eventUnsub();
    };
  }, []);

  return { event, loading, error };
}
