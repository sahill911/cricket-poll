export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifyAdminPin } from "@/lib/auth-helpers";
import { COLLECTIONS, CONFIG_DOC_ID } from "@/constants";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: NextRequest) {
  try {
    verifyAdminPin(request);

    await adminDb.runTransaction(async (tx) => {
      const configRef = adminDb.collection(COLLECTIONS.CONFIG).doc(CONFIG_DOC_ID);
      const configSnap = await tx.get(configRef);
      if (!configSnap.exists) throw new Error("App not initialised.");
      const { currentEventId } = configSnap.data()!;
      const eventRef = adminDb.collection(COLLECTIONS.EVENTS).doc(currentEventId);
      tx.update(eventRef, { status: "closed", updatedAt: FieldValue.serverTimestamp() });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
