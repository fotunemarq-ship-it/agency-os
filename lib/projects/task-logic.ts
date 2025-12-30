import { createClient } from "@/lib/supabase";

export async function checkTaskBlocked(taskId: string): Promise<{ blocked: boolean; blockers: string[] }> {
    const supabase = createClient();
    // Use server client if available or browser client
    // Dependencies: Task T depends on D. D must be completed.
    // Query: select depends_on_task_id -> status from task_dependencies where task_id = T

    // We need to join with tasks
    const { data: deps } = await (supabase.from("task_dependencies") as any)
        .select(`
            depends_on_task_id,
            depends_on:depends_on_task_id ( title, status )
        `)
        .eq("task_id", taskId);

    if (!deps || deps.length === 0) return { blocked: false, blockers: [] };

    // Check if any is NOT completed
    // Assuming 'completed' is the status for done.
    const blockers = deps.filter((d: any) => d.depends_on.status !== 'completed');

    if (blockers.length > 0) {
        return {
            blocked: true,
            blockers: blockers.map((b: any) => b.depends_on.title)
        };
    }

    return { blocked: false, blockers: [] };
}
