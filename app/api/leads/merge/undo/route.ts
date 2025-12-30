import { createServerClient } from "@/lib/supabase";
import { type NextRequest, NextResponse } from "next/server";
import { logFullAction } from "@/lib/audit";

export async function POST(req: NextRequest) {
    const supabase = createServerClient();

    try {
        const { merge_id } = await req.json();

        // 1. Get Merge Record
        const { data: mergeRecord, error: fetchError } = await (supabase.from("merges") as any)
            .select("*")
            .eq("id", merge_id)
            .single();

        if (fetchError || !mergeRecord) throw new Error("Merge record not found");

        if (mergeRecord.is_undone) throw new Error("Already undone");
        if (new Date(mergeRecord.undo_until) < new Date()) throw new Error("Undo window expired");

        const { survivor_id, merged_id } = mergeRecord;

        // 2. Restore Merged Lead
        await (supabase.from("leads") as any)
            .update({ is_merged: false, merged_into: null })
            .eq("id", merged_id);

        // 3. Remove Redirect
        await (supabase.from("lead_redirects") as any)
            .delete()
            .eq("merged_id", merged_id);

        // 4. Revert Related Entities (Reverse Logic)
        // A) Lead Outcomes
        // Only those that were moved? 
        // If we simply moved ALL outcomes from Merged->Survivor, we can move them back?
        // WARNING: If NEW outcomes were created on Survivor since merge, we shouldn't move those.
        // Ideally we tracked which IDs moved.
        // For V1 complexity catch: We will assume outcomes created BEFORE merge time should likely move back?
        // Or simpler: We rely on the fact that we changed them blindly.
        // Without storing specific IDs, exact undo is hard.
        // Compromise: We won't auto-revert related entities in V1 undo safely without data loss risk of moving valid survivor items.
        // Correction: Prompt says "Reverse lead_outcomes etc... if too heavy store IDs... or clearly note in comments".
        // I will skip automatic child record reversion for safety in this V1 script unless I fetch logs.
        // Actually, I can support it if I assume Lead Outcomes created_at < merge_created_at AND lead_id = survivor_id COULD be candidates.
        // But safely? No. 
        // Let's implement Restore of the Lead itself + Redirect removal. User has to manually move items if critical.
        // Or: Just move back outcomes that match 'actor_id' if that helps? Limit scope.
        // Decision: Only explicit Undo of Lead state and Redirect.

        // 5. Mark Merge Undone
        await (supabase.from("merges") as any)
            .update({ is_undone: true })
            .eq("id", merge_id);

        // 6. Audit
        const { data: { user } } = await supabase.auth.getUser();
        await logFullAction(
            {
                entity_type: "lead",
                entity_id: survivor_id,
                event_type: "merge_undone",
                title: "Merge Undone",
                body: `Undid merge of lead ${merged_id}. Note: Related items may need manual check.`,
            },
            {
                entity_type: "lead",
                entity_id: survivor_id,
                action: "MERGE_UNDONE",
            }
        );

        return NextResponse.json({ success: true });

    } catch (err: any) {
        console.error("Undo Error", err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
