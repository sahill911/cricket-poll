export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifyAdminPin } from "@/lib/auth-helpers";
import { COLLECTIONS, CONFIG_DOC_ID } from "@/constants";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { formatWeekLabel } from "@/lib/utils";

/**
 * POST /api/admin/set-open-time
 * Body: { registrationOpensAt: string (ISO date) }
 *
 * Updates the "Registration Opens At" time on the current event.
 * This is informational — admin still manually clicks Open.
 */
export async function POST(request: NextRequest) {
  try {
    verifyAdminPin(request);

    const { registrationOpensAt: rawDate } = await request.json();
    if (!rawDate) {
      return NextResponse.json({ success: false, error: "registrationOpensAt is required." }, { status: 400 });
    }

    const date = new Date(rawDate);
    if (isNaN(date.getTime())) {
      return NextResponse.json({ success: false, error: "Invalid date format." }, { status: 400 });
    }

    // Aligns the event date with the upcoming Friday of the week of "date"
    const eventDate = new Date(date);
    const day = eventDate.getDay();
    const daysToFriday = (5 - day + 7) % 7;
    eventDate.setDate(eventDate.getDate() + daysToFriday);
    const weekLabel = formatWeekLabel(eventDate);

    await adminDb.runTransaction(async (tx) => {
      const configRef = adminDb.collection(COLLECTIONS.CONFIG).doc(CONFIG_DOC_ID);
      const configSnap = await tx.get(configRef);
      if (!configSnap.exists) throw new Error("App not initialised.");
      const { currentEventId } = configSnap.data()!;
      const eventRef = adminDb.collection(COLLECTIONS.EVENTS).doc(currentEventId);
      
      tx.update(eventRef, {
        registrationOpensAt: Timestamp.fromDate(date),
        weekLabel,
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    return NextResponse.json({ success: true, data: { weekLabel } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update time.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
