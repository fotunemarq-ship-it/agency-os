import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
    const sessionId = req.cookies.get("app_session_id")?.value;
    if (!sessionId) return new NextResponse(null, { status: 204 }); // No session to ping

    const supabase = createServerClient();

    // Optimistic update, ignoring return to be fast
    await (supabase.from("user_sessions") as any)
        .update({ last_seen_at: new Date().toISOString() })
        .eq("id", sessionId)
        .is("logout_at", null); // Only if still open

    return NextResponse.json({ online: true });
}
