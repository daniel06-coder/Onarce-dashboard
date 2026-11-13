import { adminDb } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

// export const runtime = "nodejs";

export async function GET(req) {
  try {
    // IMPORTANT:
    // Verify the signed-in admin here using your
    // existing admin authentication/session system.
    // Do not use CRON_SECRET as browser authentication.

    const doc = await adminDb.doc("adminStats/summary").get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: "No statistics available yet" },
        { status: 404 },
      );
    }

    return NextResponse.json(doc.data(), {
      headers: {
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("ADMIN STATS ERROR:", error);

    return NextResponse.json(
      { error: "Failed to load statistics",
        details: error.message,
       },
      { status: 500 },
    )
  }
}
