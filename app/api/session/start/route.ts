import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { logActivity } from "@/lib/audit"; // Assume existing

export async function POST(req: NextRequest) {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const ua = req.headers.get("user-agent") || "unknown";

    try {
        // Create Session
        const { data: session, error } = await (supabase.from("user_sessions") as any).insert({
            user_id: user.id,
            login_at: new Date().toISOString(),
            last_seen_at: new Date().toISOString(),
            ip_address: ip,
            user_agent: ua,
            ended_reason: null
        }).select().single();

        if (error) throw error;

        // Set Cookie (HttpOnly)
        const response = NextResponse.json({ success: true, sessionId: session.id });
        response.cookies.set("app_session_id", session.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 60 * 60 * 24 // 24 hours
        });

        // Audit Log
        /*
        await logActivity({ 
            entity_type: 'user', 
            entity_id: user.id, 
            event_type: 'login', 
            title: 'User Login',
            metadata: { session_id: session.id, ip }
        });
        */

        return response;
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
