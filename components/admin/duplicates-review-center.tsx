"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import {
    Users,
    Search,
    GitMerge,
    Trash2,
    AlertCircle,
    Check,
    ShieldAlert,
    Loader2,
    RefreshCw
} from "lucide-react";
import clsx from "clsx";
import MergeLeadWizard from "./MergeLeadWizard";

export default function DuplicatesReviewCenter() {
    const [candidates, setCandidates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [scanning, setScanning] = useState(false);
    const [activeMergePair, setActiveMergePair] = useState<any | null>(null);

    useEffect(() => {
        fetchCandidates();
    }, []);

    const fetchCandidates = async () => {
        setLoading(true);
        const supabase = createClient();

        // Fetch candidates with lead details
        // We need to join leads twice: for primary and duplicate
        // Supabase JS join syntax:
        const { data, error } = await (supabase
            .from("duplicate_candidates") as any)
            .select(`
        *,
        primary:primary_id (id, company_name, city, phone, email, status),
        duplicate:duplicate_id (id, company_name, city, phone, email, status)
      `)
            .eq("status", "open")
            .order("confidence", { ascending: false });

        if (!error) {
            setCandidates(data || []);
        }
        setLoading(false);
    };

    const runScan = async () => {
        setScanning(true);
        try {
            await fetch("/api/leads/duplicates/scan", { method: "POST" });
            await fetchCandidates();
            alert("Scan complete!");
        } catch (e) {
            alert("Scan failed");
        } finally {
            setScanning(false);
        }
    };

    const handleIgnore = async (id: string) => {
        const supabase = createClient();
        await (supabase.from("duplicate_candidates") as any).update({ status: "ignored" }).eq("id", id);
        setCandidates(prev => prev.filter(c => c.id !== id));
    };

    if (!loading && candidates.length === 0) {
        return (
            <div className="p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4 border border-zinc-800">
                    <Check className="h-8 w-8 text-green-500" />
                </div>
                <h2 className="text-xl font-bold text-white">No duplicates found</h2>
                <p className="text-zinc-500 mt-2 mb-6">Your data looks clean!</p>
                <button onClick={runScan} disabled={scanning} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg flex items-center gap-2 mx-auto disabled:opacity-50">
                    {scanning ? <Loader2 className="animate-spin h-4 w-4" /> : <Search className="h-4 w-4" />}
                    {scanning ? "Scanning..." : "Run Scan Now"}
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Users className="h-5 w-5 text-indigo-400" /> Review Duplicates
                </h2>
                <button onClick={runScan} disabled={scanning} className="text-sm px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded border border-zinc-700 flex items-center gap-2 disabled:opacity-50">
                    {scanning ? <Loader2 className="animate-spin h-3.5 w-3.5" /> : <RefreshCw className="h-3.5 w-3.5" />}
                    Scan
                </button>
            </div>

            <div className="grid gap-4">
                {candidates.map((cand) => (
                    <div key={cand.id} className="bg-[#111] border border-[#222] rounded-xl p-4">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <span className={clsx("px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider",
                                    cand.confidence >= 90 ? "bg-red-500/20 text-red-400" :
                                        cand.confidence >= 70 ? "bg-amber-500/20 text-amber-400" : "bg-blue-500/20 text-blue-400"
                                )}>
                                    {cand.match_type} Match ({cand.confidence}%)
                                </span>
                                <span className="text-xs text-zinc-500">ID: {cand.id.slice(0, 8)}</span>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleIgnore(cand.id)} className="px-3 py-1.5 rounded text-xs hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors">Ignore</button>
                                <button onClick={() => setActiveMergePair(cand)} className="px-3 py-1.5 rounded text-xs bg-indigo-500 hover:bg-indigo-600 text-white font-medium flex items-center gap-1.5">
                                    <GitMerge className="h-3.5 w-3.5" /> Merge
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                            {/* Connector Line */}
                            <div className="hidden md:block absolute left-1/2 top-10 bottom-10 w-px bg-zinc-800 -translate-x-1/2"></div>

                            {/* Primary */}
                            <DuplicateCard lead={cand.primary} label="Primary Lead" />

                            {/* Duplicate */}
                            <DuplicateCard lead={cand.duplicate} label="Potential Duplicate" />
                        </div>
                    </div>
                ))}
            </div>

            {activeMergePair && (
                <MergeLeadWizard
                    pair={activeMergePair}
                    onClose={() => setActiveMergePair(null)}
                    onSuccess={() => {
                        setActiveMergePair(null);
                        setCandidates(prev => prev.filter(c => c.id !== activeMergePair.id));
                        alert("Merge successful!");
                    }}
                />
            )}
        </div>
    );
}

function DuplicateCard({ lead, label }: { lead: any, label: string }) {
    if (!lead) return <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800 text-zinc-500 text-sm">Lead Removed</div>;
    return (
        <div className="p-4 rounded-lg bg-zinc-900/30 border border-zinc-800 space-y-2">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{label}</p>
            <h3 className="text-lg font-bold text-white truncate">{lead.company_name}</h3>
            <div className="space-y-1 text-sm text-zinc-400">
                {lead.city && <p className="flex items-center gap-2"><span className="w-4 flex text-zinc-600">📍</span> {lead.city}</p>}
                {lead.phone && <p className="flex items-center gap-2"><span className="w-4 flex text-zinc-600">📞</span> {lead.phone}</p>}
                {lead.email && <p className="flex items-center gap-2"><span className="w-4 flex text-zinc-600">✉️</span> {lead.email}</p>}
                <span className="inline-block mt-2 px-2 py-0.5 bg-zinc-800 rounded text-xs text-zinc-300">{lead.status}</span>
            </div>
        </div>
    );
}
