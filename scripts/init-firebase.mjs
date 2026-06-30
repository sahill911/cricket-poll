/**
 * One-time initialization script.
 * Run with: node scripts/init-firebase.mjs
 *
 * Creates:
 *   - config/app  (points to the first event)
 *   - events/{id} (upcoming Friday, registration opens next Wednesday 8 PM IST)
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local manually
const envPath = join(__dirname, "../.env.local");
const envContent = readFileSync(envPath, "utf-8");
const envVars = {};
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIndex = trimmed.indexOf("=");
  if (eqIndex === -1) continue;
  const key = trimmed.slice(0, eqIndex).trim();
  const value = trimmed.slice(eqIndex + 1).trim();
  envVars[key] = value;
}

const serviceAccountKey = envVars["FIREBASE_SERVICE_ACCOUNT_KEY"];
if (!serviceAccountKey) {
  console.error("❌ FIREBASE_SERVICE_ACCOUNT_KEY not found in .env.local");
  process.exit(1);
}

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert(JSON.parse(serviceAccountKey)),
});
const db = getFirestore(app);

// ── Compute next Wednesday 8 PM IST ──────────────────────────────────────────
function getNextWednesday8PmIST() {
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
  const nowUtc = Date.now();
  const nowIST = new Date(nowUtc + IST_OFFSET_MS);

  const dayIST = nowIST.getUTCDay();
  const hourIST = nowIST.getUTCHours();
  const minuteIST = nowIST.getUTCMinutes();

  let daysUntilWed = (3 - dayIST + 7) % 7;
  if (daysUntilWed === 0 && (hourIST > 20 || (hourIST === 20 && minuteIST > 0))) {
    daysUntilWed = 7;
  }
  if (daysUntilWed === 0) daysUntilWed = 0; // today, hasn't passed yet

  const targetIST = new Date(nowIST);
  targetIST.setUTCDate(targetIST.getUTCDate() + daysUntilWed);
  targetIST.setUTCHours(20, 0, 0, 0);

  return new Date(targetIST.getTime() - IST_OFFSET_MS);
}

function formatWeekLabel(date) {
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

async function main() {
  console.log("🏏 Initialising Cricket Poll Firebase...\n");

  const registrationOpensAt = getNextWednesday8PmIST();
  const eventDate = new Date(registrationOpensAt);
  eventDate.setDate(eventDate.getDate() + 2); // Friday
  const weekLabel = formatWeekLabel(eventDate);

  console.log(`📅 Event: ${weekLabel}`);
  console.log(`⏰ Registration opens: ${registrationOpensAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST\n`);

  // Create event document
  const eventRef = db.collection("events").doc();
  const eventId = eventRef.id;

  const batch = db.batch();

  batch.set(eventRef, {
    id: eventId,
    weekLabel,
    status: "upcoming",
    registrationOpensAt: Timestamp.fromDate(registrationOpensAt),
    playerLimit: 16,
    waitlistLimit: 2,
    confirmedCount: 0,
    waitingCount: 0,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  // Create config document
  const configRef = db.collection("config").doc("app");
  batch.set(configRef, {
    currentEventId: eventId,
    playerLimit: 16,
    waitlistLimit: 2,
  });

  await batch.commit();

  console.log("✅ Created config/app");
  console.log(`✅ Created events/${eventId}`);
  console.log(`\n🎉 Done! Open http://localhost:3000 — the countdown will show.`);
  console.log(`\n👉 Next: Enable Google Sign-In in Firebase Console, then sign in`);
  console.log(`   and set isAdmin: true on your user doc in Firestore.`);

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
