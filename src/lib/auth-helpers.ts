import { NextRequest } from "next/server";

/**
 * Verifies admin PIN from Authorization header.
 * Header format: "Bearer <PIN>"
 * PIN is stored in ADMIN_PIN env var.
 */
export function verifyAdminPin(request: NextRequest): void {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Missing Authorization header.");
  }
  const pin = authHeader.slice(7).trim();
  const expectedPin = process.env.ADMIN_PIN;
  if (!expectedPin) {
    throw new Error("ADMIN_PIN not configured on server.");
  }
  if (pin !== expectedPin) {
    throw new Error("Unauthorized: Invalid admin PIN.");
  }
}
