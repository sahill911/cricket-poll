export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { COLLECTIONS, CONFIG_DOC_ID } from "@/constants";
import { FieldValue } from "firebase-admin/firestore";
import { randomUUID } from "crypto";

/**
 * POST /api/register
 * Body: { playerName: string }
 *
 * No authentication required — players just enter their name.
 * Uses Firestore transaction to:
 *   1. Check event is open
 *   2. Check name isn't already registered (case-insensitive)
 *   3. Assign next available slot
 *   4. Return registrationId so client can cancel later
 */
export async function POST(request: NextRequest) {
  try {
    const { playerName } = await request.json();

    if (!playerName || typeof playerName !== "string" || playerName.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Please enter your name (at least 2 characters)." },
        { status: 400 }
      );
    }

    const cleanName = playerName.trim();
    const registrationId = randomUUID();

    await adminDb.runTransaction(async (tx) => {
      // Get config → currentEventId
      const configRef = adminDb.collection(COLLECTIONS.CONFIG).doc(CONFIG_DOC_ID);
      const configSnap = await tx.get(configRef);
      if (!configSnap.exists) throw new Error("No active event. Ask admin to initialise.");

      const { currentEventId } = configSnap.data()!;

      // Get event
      const eventRef = adminDb.collection(COLLECTIONS.EVENTS).doc(currentEventId);
      const eventSnap = await tx.get(eventRef);
      if (!eventSnap.exists) throw new Error("Event not found.");

      const event = eventSnap.data()!;

      if (event.status !== "open") {
        throw new Error(
          event.status === "upcoming"
            ? "Registration is not open yet."
            : "Registration is closed."
        );
      }

      // Check for duplicate name (case-insensitive) using transactional tx.get()
      const queryRef = adminDb
        .collection(COLLECTIONS.EVENTS)
        .doc(currentEventId)
        .collection(COLLECTIONS.REGISTRATIONS)
        .where("playerName_lower", "==", cleanName.toLowerCase())
        .where("status", "in", ["confirmed", "waiting"]);

      const existingQuery = await tx.get(queryRef);

      if (!existingQuery.empty) {
        throw new Error(`"${cleanName}" is already registered. Contact admin if this is wrong.`);
      }

      const confirmedCount = event.confirmedCount as number;
      const waitingCount = event.waitingCount as number;
      const playerLimit = event.playerLimit as number;
      const waitlistLimit = event.waitlistLimit as number;

      let status: "confirmed" | "waiting";
      let position: number;

      if (confirmedCount < playerLimit) {
        status = "confirmed";
        position = confirmedCount + 1;
      } else if (waitingCount < waitlistLimit) {
        status = "waiting";
        position = waitingCount + 1;
      } else {
        throw new Error("All slots are full. Registration is closed.");
      }

      const regRef = adminDb
        .collection(COLLECTIONS.EVENTS)
        .doc(currentEventId)
        .collection(COLLECTIONS.REGISTRATIONS)
        .doc(registrationId);

      // Writes execute at the end of the transaction callback
      tx.set(regRef, {
        registrationId,
        playerName: cleanName,
        playerName_lower: cleanName.toLowerCase(), // for duplicate check
        status,
        position,
        registeredAt: FieldValue.serverTimestamp(),
        cancelledAt: null,
      });

      const counterUpdate =
        status === "confirmed"
          ? { confirmedCount: FieldValue.increment(1) }
          : { waitingCount: FieldValue.increment(1) };

      const willBeFull =
        status === "waiting" &&
        waitingCount + 1 >= waitlistLimit &&
        confirmedCount >= playerLimit;

      tx.update(eventRef, {
        ...counterUpdate,
        ...(willBeFull ? { status: "closed" } : {}),
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    return NextResponse.json({
      success: true,
      data: {
        registrationId,
        playerName: cleanName,
        status: "confirmed", // recalculated on client from localState
        position: 0,         // client reads from realtime listener
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registration failed.";
    const isClientError = [
      "not open yet", "closed", "already registered", "full", "at least 2",
    ].some((s) => message.toLowerCase().includes(s));
    return NextResponse.json(
      { success: false, error: message },
      { status: isClientError ? 400 : 500 }
    );
  }
}
