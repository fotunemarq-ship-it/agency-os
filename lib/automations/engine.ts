import { createServerClient } from "@/lib/supabase";
import { evaluateConditions } from "./conditions";
import { executeAction } from "./actions";
import { AutomationRule } from "./types";

export interface AutomationResult {
    triggered: number;
    actions_executed: number;
    errors: any[];
}

export async function runTrigger(
    trigger: string,
    entityType: string,
    entityId: string,
    actorId?: string | null,
    context?: any
): Promise<AutomationResult> {
    const supabase = createServerClient();
    const result: AutomationResult = { triggered: 0, actions_executed: 0, errors: [] };

    try {
        // 1. Fetch Enabled Rules
        const { data: rulesData, error: rulesError } = await supabase
            .from("automation_rules")
            .select("*")
            .eq("entity_type", entityType)
            .eq("trigger", trigger)
            .eq("is_enabled", true)
            .order("priority", { ascending: true }); // Lower priority runs first

        if (rulesError || !rulesData || rulesData.length === 0) return result;
        const rules = rulesData as unknown as AutomationRule[]; // explicit cast to match interface

        // 2. Fetch Entity Snapshot
        // We assume 'leads', 'deals', 'projects', 'tasks' tables match entityType + 's' usually
        const tableName = entityType === 'lead' ? 'leads' : entityType + 's';
        const { data: snapshot, error: fetchError } = await (supabase.from(tableName as any) as any)
            .select("*")
            .eq("id", entityId)
            .single();

        if (fetchError || !snapshot) {
            console.error("Entity not found for automation", entityType, entityId);
            return result;
        }

        // 3. Evaluate Rules
        for (const rule of rules) {
            try {
                // A. Throttle Check
                if (rule.throttle_minutes > 0) {
                    const { data: throttle } = await (supabase
                        .from("automation_throttle") as any)
                        .select("last_ran_at")
                        .eq("rule_id", rule.id)
                        .eq("entity_type", entityType)
                        .eq("entity_id", entityId)
                        .single();

                    if (throttle) {
                        const lastRan = new Date(throttle.last_ran_at);
                        const diffMins = (Date.now() - lastRan.getTime()) / 60000;
                        if (diffMins < rule.throttle_minutes) {
                            await logRun(supabase, rule.id, entityType, entityId, trigger, "skipped", "Throttled");
                            continue;
                        }
                    }
                }

                // B. Condition Check
                const isMatch = evaluateConditions(snapshot, rule.conditions);
                if (!isMatch) {
                    // Verbose logging? Maybe only log successes to save DB space
                    // await logRun(supabase, rule.id, entityType, entityId, trigger, "skipped", "Condition mismatch");
                    continue;
                }

                // C. Execute Actions
                const executedActions = [];
                for (const action of rule.actions) {
                    await executeAction(action, entityType, entityId, snapshot);
                    executedActions.push(action);
                    result.actions_executed++;
                }

                // D. Update Throttle & Log Success
                await (supabase.from("automation_throttle") as any).upsert({
                    rule_id: rule.id,
                    entity_type: entityType,
                    entity_id: entityId,
                    last_ran_at: new Date().toISOString()
                }, { onConflict: "rule_id, entity_type, entity_id" });

                await logRun(supabase, rule.id, entityType, entityId, trigger, "success", null, executedActions, snapshot);
                result.triggered++;

            } catch (ruleErr: any) {
                console.error(`Rule ${rule.id} failed`, ruleErr);
                result.errors.push({ rule: rule.id, error: ruleErr.message });
                await logRun(supabase, rule.id, entityType, entityId, trigger, "failed", ruleErr.message);
            }
        }

    } catch (e: any) {
        console.error("Automation Engine Error", e);
        result.errors.push({ error: e.message });
    }

    return result;
}

async function logRun(supabase: any, ruleId: string, entityType: string, entityId: string, trigger: string, status: string, reason: string | null, actions: any[] = [], snapshot: any = {}) {
    await (supabase.from("automation_runs") as any).insert({
        rule_id: ruleId,
        entity_type: entityType,
        entity_id: entityId,
        trigger,
        status,
        reason,
        actions_executed: actions,
        input_snapshot: snapshot // Optional: could be heavy
    });
}
