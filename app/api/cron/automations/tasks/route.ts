import { createServerClient } from "@/lib/supabase";
import { type NextRequest, NextResponse } from "next/server";
import { runTrigger } from "@/lib/automations/engine";

export async function POST(req: NextRequest) {
    const supabase = createServerClient() as any;
    try {
        const now = new Date();
        const { data: tasks, error } = await supabase
            .from("tasks")
            .select("*")
            .neq("status", "done") // assuming 'done' is completed status
            .lt("due_date", now.toISOString())
            .limit(50);

        if (error) throw error;

        let processed = 0;
        for (const task of (tasks || []) as any[]) {
            await runTrigger("task_overdue", "task", task.id);
            processed++;
        }

        return NextResponse.json({ success: true, processed });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
