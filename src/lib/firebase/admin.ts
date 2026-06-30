/**
 * Firebase Admin SDK — SERVER-SIDE ONLY.
 *
 * Pattern: defer initialization to a lazy getter so the module can be imported
 * without crashing during `next build` type-checking phase.
 * The `export const dynamic = 'force-dynamic'` on each route ensures this only
 * runs at request time in production.
 */

import type { Firestore } from "firebase-admin/firestore";
import type { Auth } from "firebase-admin/auth";

let _db: Firestore | null = null;
let _auth: Auth | null = null;
let _initialized = false;

function initialize() {
  if (_initialized) return;

  const { initializeApp, getApps, cert, getApp } = require("firebase-admin/app");
  const { getAuth } = require("firebase-admin/auth");
  const { getFirestore } = require("firebase-admin/firestore");

  const app = getApps().length > 0
    ? getApp()
    : (() => {
        const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
        if (key) {
          try {
            let serviceAccount = JSON.parse(key);
            if (typeof serviceAccount === "string") {
              serviceAccount = JSON.parse(serviceAccount);
            }
            if (serviceAccount.private_key) {
              serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
            }
            return initializeApp({ credential: cert(serviceAccount) });
          } catch (err: any) {
            console.error("Firebase Admin initialization via SERVICE_ACCOUNT_KEY failed:", err);
            throw new Error(`Firebase Admin Service Account Key JSON.parse failed: ${err?.message}`);
          }
        }
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
        if (!projectId || !clientEmail || !privateKey) {
          throw new Error(
            "Firebase Admin: set FIREBASE_SERVICE_ACCOUNT_KEY or " +
            "FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY"
          );
        }
        return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
      })();

  _auth = getAuth(app);
  _db = getFirestore(app);
  _initialized = true;
}

export function getAdminDb(): Firestore {
  initialize();
  return _db!;
}

export function getAdminAuth(): Auth {
  initialize();
  return _auth!;
}

// Convenience re-exports — these call the lazy getters when used
export const adminDb = {
  get collection() { return getAdminDb().collection.bind(getAdminDb()); },
  get runTransaction() { return getAdminDb().runTransaction.bind(getAdminDb()); },
  get batch() { return getAdminDb().batch.bind(getAdminDb()); },
  get doc() { return getAdminDb().doc.bind(getAdminDb()); },
} as unknown as Firestore;

export const adminAuth = {
  get verifyIdToken() { return getAdminAuth().verifyIdToken.bind(getAdminAuth()); },
} as unknown as Auth;
