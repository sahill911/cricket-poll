"use client";

import { useState, useEffect } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Registration } from "@/types";
import { COLLECTIONS } from "@/constants";

interface UseRegistrationsReturn {
  confirmed: Registration[];
  waiting: Registration[];
  loading: boolean;
  error: string | null;
}

export function useRegistrations(eventId: string | undefined): UseRegistrationsReturn {
  const [confirmed, setConfirmed] = useState<Registration[]>([]);
  const [waiting, setWaiting] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const regsRef = collection(db, COLLECTIONS.EVENTS, eventId, COLLECTIONS.REGISTRATIONS);

    // Confirmed players listener
    const confirmedQuery = query(
      regsRef,
      where("status", "==", "confirmed"),
      orderBy("position", "asc")
    );
    const waitingQuery = query(
      regsRef,
      where("status", "==", "waiting"),
      orderBy("position", "asc")
    );

    let confirmedLoaded = false;
    let waitingLoaded = false;

    const checkDone = () => {
      if (confirmedLoaded && waitingLoaded) setLoading(false);
    };

    const unsubConfirmed = onSnapshot(
      confirmedQuery,
      (snap) => {
        setConfirmed(
          snap.docs.map((d) => ({ registrationId: d.id, ...d.data() } as Registration))
        );
        confirmedLoaded = true;
        checkDone();
      },
      (err) => {
        console.error("Confirmed snapshot error:", err);
        setError("Could not load registrations.");
        setLoading(false);
      }
    );

    const unsubWaiting = onSnapshot(
      waitingQuery,
      (snap) => {
        setWaiting(
          snap.docs.map((d) => ({ registrationId: d.id, ...d.data() } as Registration))
        );
        waitingLoaded = true;
        checkDone();
      },
      (err) => {
        console.error("Waiting snapshot error:", err);
        setError("Could not load registrations.");
        setLoading(false);
      }
    );

    return () => {
      unsubConfirmed();
      unsubWaiting();
    };
  }, [eventId]);

  return { confirmed, waiting, loading, error };
}
