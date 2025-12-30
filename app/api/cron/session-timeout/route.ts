import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
    // Optional secret check
    const authHeader = req.headers.get('x-admin-cron-secret');
    if (authHeader !== process.env.CRON_SECRET && process.env.NODE_ENV === 'production') {
        // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient() as any;

    try {
        // Call security definer function to clean up
        const { data: count, error } = await supabase.rpc('cleanup_inactive_sessions', {
            timeout_minutes: 20
        });

        if (error) throw error;

        return NextResponse.json({ success: true, sessions_closed: count });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
