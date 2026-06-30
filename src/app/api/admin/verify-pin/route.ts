export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/admin/verify-pin
 * Body: { pin: string }
 * Returns: { success: true } if PIN matches ADMIN_PIN env var
 */
export async function POST(request: NextRequest) {
  try {
    const { pin } = await request.json();
    const expectedPin = process.env.ADMIN_PIN;

    if (!expectedPin) {
      return NextResponse.json({ success: false, error: "Admin PIN not configured." }, { status: 500 });
    }
    if (!pin || pin !== expectedPin) {
      return NextResponse.json({ success: false, error: "Invalid PIN." }, { status: 401 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 });
  }
}
