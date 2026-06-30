export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { COLLECTIONS, CONFIG_DOC_ID } from "@/constants";
import { FieldValue } from "firebase-admin/firestore";

/**
 * POST /api/cancel
 * Body: { registrationId: string }
 *
 * No authentication — registrationId acts as the cancel token.
 * Promotes Waiting #1 to Confirmed if a confirmed slot is freed.
 */
export async function POST(request: NextRequest) {
  try {
    const { registrationId } = await request.json();

    if (!registrationId || typeof registrationId !== "string") {
      return NextResponse.json(
        { success: false, error: "registrationId is required." },
        { status: 400 }
      );
    }

    await adminDb.runTransaction(async (tx) => {
      // 1. All Reads First
      const configRef = adminDb.collection(COLLECTIONS.CONFIG).doc(CONFIG_DOC_ID);
      const configSnap = await tx.get(configRef);
      if (!configSnap.exists) throw new Error("No active event.");

      const { currentEventId } = configSnap.data()!;

      const eventRef = adminDb.collection(COLLECTIONS.EVENTS).doc(currentEventId);
      const eventSnap = await tx.get(eventRef);
      if (!eventSnap.exists) throw new Error("Event not found.");

      const event = eventSnap.data()!;

      const regRef = adminDb
        .collection(COLLECTIONS.EVENTS)
        .doc(currentEventId)
        .collection(COLLECTIONS.REGISTRATIONS)
        .doc(registrationId);
      const regSnap = await tx.get(regRef);

      if (!regSnap.exists || regSnap.data()!.status === "cancelled") {
        throw new Error("No active registration found.");
      }

      const reg = regSnap.data()!;
      const cancelledStatus = reg.status as "confirmed" | "waiting";
      const cancelledPosition = reg.position as number;

      const regCollection = adminDb
        .collection(COLLECTIONS.EVENTS)
        .doc(currentEventId)
        .collection(COLLECTIONS.REGISTRATIONS);

      let promotedDoc: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData> | null = null;
      let remainingWaitingDocs: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>[] = [];

      if (cancelledStatus === "confirmed") {
        const waitingQuery = await tx.get(
          regCollection.where("status", "==", "waiting").orderBy("position", "asc").limit(1)
        );

        if (!waitingQuery.empty) {
          promotedDoc = waitingQuery.docs[0];

          const remainingWaiting = await tx.get(
            regCollection.where("status", "==", "waiting").where("position", ">", 1).orderBy("position", "asc")
          );
          remainingWaitingDocs = remainingWaiting.docs;
        }
      } else {
        const remainingWaiting = await tx.get(
          regCollection
            .where("status", "==", "waiting")
            .where("position", ">", cancelledPosition)
            .orderBy("position", "asc")
        );
        remainingWaitingDocs = remainingWaiting.docs;
      }

      // 2. All Writes Second
      tx.update(regRef, {
        status: "cancelled",
        cancelledAt: FieldValue.serverTimestamp(),
      });

      if (cancelledStatus === "confirmed") {
        if (promotedDoc) {
          tx.update(promotedDoc.ref, {
            status: "confirmed",
            position: event.playerLimit,
          });

          remainingWaitingDocs.forEach((d) => {
            tx.update(d.ref, { position: FieldValue.increment(-1) });
          });

          tx.update(eventRef, {
            waitingCount: FieldValue.increment(-1),
            ...(event.status === "closed" ? { status: "open" } : {}),
            updatedAt: FieldValue.serverTimestamp(),
          });
        } else {
          tx.update(eventRef, {
            confirmedCount: FieldValue.increment(-1),
            ...(event.status === "closed" ? { status: "open" } : {}),
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
      } else {
        remainingWaitingDocs.forEach((d) => {
          tx.update(d.ref, { position: FieldValue.increment(-1) });
        });

        tx.update(eventRef, {
          waitingCount: FieldValue.increment(-1),
          ...(event.status === "closed" ? { status: "open" } : {}),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Cancellation failed.";
    return NextResponse.json(
      { success: false, error: message },
      { status: message.includes("No active") ? 400 : 500 }
    );
  }
}
