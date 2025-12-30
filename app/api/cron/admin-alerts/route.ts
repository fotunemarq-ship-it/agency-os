import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
    // 1. Auth Check (Optional but recommended)
    const authHeader = req.headers.get('x-admin-cron-secret');
    if (authHeader !== process.env.CRON_SECRET && process.env.NODE_ENV === 'production') {
        // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient();

    try {
        // 2. Call DB Function (Security Definer handles permissions)
        const { data, error } = await supabase.rpc('generate_admin_alerts');

        if (error) throw error;

        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
