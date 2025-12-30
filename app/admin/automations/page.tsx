import { createServerClient } from "@/lib/supabase";
import { Plus, Play, Pause, Zap } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default async function AutomationsPage() {
    const supabase = createServerClient();
    const { data: rules } = await supabase
        .from("automation_rules")
        .select("*")
        .order("priority", { ascending: true });

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Automation Rules</h1>
                    <p className="text-[#a1a1aa]">Manage enterprise workflow triggers and actions.</p>
                </div>
                <Link href="/admin/automations/new" className="bg-[#42CA80] text-black font-semibold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#3ab872]">
                    <Plus className="h-4 w-4" /> New Rule
                </Link>
            </div>

            <div className="grid gap-4">
                {rules && rules.map((rule: any) => (
                    <div key={rule.id} className="bg-[#111] border border-[#222] p-4 rounded-xl flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${rule.is_enabled ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-800 text-zinc-500'}`}>
                                    {rule.is_enabled ? 'Active' : 'Paused'}
                                </span>
                                <h3 className="font-bold text-white">{rule.name}</h3>
                            </div>
                            <p className="text-sm text-[#666] flex items-center gap-2">
                                <Zap className="h-3 w-3" /> Trigger: <span className="text-zinc-400 font-mono">{rule.trigger}</span>
                                <span className="text-zinc-700">|</span>
                                Target: <span className="text-zinc-400">{rule.entity_type}</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right hidden md:block">
                                <p className="text-xs text-[#666]">Priority</p>
                                <p className="text-sm font-bold text-white">{rule.priority}</p>
                            </div>
                            <div className="h-8 w-px bg-[#222] hidden md:block"></div>
                            <Link href={`/admin/automations/${rule.id}`} className="text-sm text-zinc-400 hover:text-white border border-[#333] px-3 py-1.5 rounded bg-[#1a1a1a]">
                                Edit
                            </Link>
                        </div>
                    </div>
                ))}

                {(!rules || rules.length === 0) && (
                    <div className="text-center py-12 text-[#444]">
                        No rules defined yet.
                    </div>
                )}
            </div>
        </div>
    );
}
