export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifyAdminPin } from "@/lib/auth-helpers";
import { COLLECTIONS, CONFIG_DOC_ID } from "@/constants";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: NextRequest) {
  try {
    verifyAdminPin(request);

    const body = await request.json();
    const { playerLimit, waitlistLimit } = body as { playerLimit?: number; waitlistLimit?: number };

    if (playerLimit !== undefined && (playerLimit < 1 || playerLimit > 100)) {
      return NextResponse.json({ success: false, error: "playerLimit must be 1–100." }, { status: 400 });
    }
    if (waitlistLimit !== undefined && (waitlistLimit < 0 || waitlistLimit > 20)) {
      return NextResponse.json({ success: false, error: "waitlistLimit must be 0–20." }, { status: 400 });
    }

    await adminDb.runTransaction(async (tx) => {
      const configRef = adminDb.collection(COLLECTIONS.CONFIG).doc(CONFIG_DOC_ID);
      const configSnap = await tx.get(configRef);
      if (!configSnap.exists) throw new Error("App not initialised.");
      const { currentEventId } = configSnap.data()!;
      const eventRef = adminDb.collection(COLLECTIONS.EVENTS).doc(currentEventId);

      const updates: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
      if (playerLimit !== undefined) updates.playerLimit = playerLimit;
      if (waitlistLimit !== undefined) updates.waitlistLimit = waitlistLimit;

      tx.update(eventRef, updates);
      tx.update(configRef, updates);
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update limits.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
