export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifyAdminPin } from "@/lib/auth-helpers";
import { COLLECTIONS, CONFIG_DOC_ID, DEFAULT_PLAYER_LIMIT, DEFAULT_WAITLIST_LIMIT } from "@/constants";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { formatWeekLabel } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    verifyAdminPin(request);

    const body = await request.json().catch(() => ({}));
    const playerLimit = body.playerLimit ?? DEFAULT_PLAYER_LIMIT;
    const waitlistLimit = body.waitlistLimit ?? DEFAULT_WAITLIST_LIMIT;

    // registrationOpensAt from body (ISO string), default to next Friday
    let registrationOpensAt: Date;
    if (body.registrationOpensAt) {
      registrationOpensAt = new Date(body.registrationOpensAt);
    } else {
      // Default: next Friday at 8 PM IST
      const now = new Date();
      const dayOfWeek = now.getDay();
      const daysUntilFri = (5 - dayOfWeek + 7) % 7 || 7;
      registrationOpensAt = new Date(now);
      registrationOpensAt.setDate(now.getDate() + daysUntilFri);
      registrationOpensAt.setHours(20, 0, 0, 0);
    }

    const eventDate = new Date(registrationOpensAt);
    const day = eventDate.getDay();
    const daysToFriday = (5 - day + 7) % 7;
    eventDate.setDate(eventDate.getDate() + daysToFriday);
    const weekLabel = formatWeekLabel(eventDate);

    const newEventRef = adminDb.collection(COLLECTIONS.EVENTS).doc();
    const configRef = adminDb.collection(COLLECTIONS.CONFIG).doc(CONFIG_DOC_ID);

    await adminDb.runTransaction(async (tx) => {
      tx.set(newEventRef, {
        id: newEventRef.id,
        weekLabel,
        status: "upcoming",
        registrationOpensAt: Timestamp.fromDate(registrationOpensAt),
        playerLimit,
        waitlistLimit,
        confirmedCount: 0,
        waitingCount: 0,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      tx.set(configRef, { currentEventId: newEventRef.id, playerLimit, waitlistLimit }, { merge: true });
    });

    return NextResponse.json({ success: true, data: { eventId: newEventRef.id, weekLabel } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Reset failed.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
