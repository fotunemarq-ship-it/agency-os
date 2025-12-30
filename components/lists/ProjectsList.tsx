"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import SavedViewsBar from "@/components/saved-views/SavedViewsBar";
import BulkActionBar from "@/components/saved-views/BulkActionBar";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import { applyFilters, applySort } from "@/lib/filtering";
import { bulkUpdateEntity } from "@/actions/bulk-actions";
import { SavedView, FilterConfig, SortConfig } from "@/types/view";
import { Loader2 } from "lucide-react";
import clsx from "clsx";

export default function ProjectsList({ userId }: { userId: string }) {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // View State
    const [filters, setFilters] = useState<FilterConfig>({});
    const [sort, setSort] = useState<SortConfig>({ field: "deadline", direction: "asc" });

    const {
        selectedIds,
        toggleSelection,
        selectAll,
        deselectAll,
        clearSelection,
        isSelected,
        isAllSelected,
        count: selectedCount,
    } = useBulkSelection<string>();

    useEffect(() => {
        fetchData();
    }, [filters, sort]);

    const fetchData = async () => {
        setLoading(true);
        const supabase = createClient();
        let query = supabase.from("projects").select("*, clients(business_name)", { count: "exact" });
        query = applyFilters(query, filters);
        query = applySort(query, sort);
        query = query.limit(50);
        const { data: projects, error } = await query;
        if (!error) setData(projects || []);
        setLoading(false);
    };

    const handleBulkAction = async (action: string) => {
        const ids = Array.from(selectedIds);
        let updates = {};
        if (action === "change_status") {
            const val = prompt("New status:");
            if (val) updates = { status: val };
        }
        if (Object.keys(updates).length > 0) {
            await bulkUpdateEntity("project", ids, updates, action);
            alert("Updated projects");
            clearSelection();
            fetchData();
        }
    };

    const handleSelectAllPage = () => {
        const ids = data.map(d => d.id);
        isAllSelected(ids) ? deselectAll(ids) : selectAll(ids);
    };

    return (
        <div className="space-y-4">
            <SavedViewsBar
                entityType="project"
                currentFilters={filters}
                currentSort={sort}
                onViewSelect={(v) => { setFilters(v.filters); setSort(v.sort); clearSelection(); }}
                onReset={() => { setFilters({}); setSort({ field: "deadline", direction: "asc" }); clearSelection(); }}
                userId={userId}
            />

            {/* Table */}
            <div className="rounded-lg border border-[#1a1a1a] bg-[#0f0f0f] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-[#a1a1aa]">
                        <thead className="bg-[#1a1a1a] text-xs uppercase font-medium text-white">
                            <tr>
                                <th className="px-4 py-3 w-[40px]"><input type="checkbox" checked={data.length > 0 && isAllSelected(data.map(d => d.id))} onChange={handleSelectAllPage} className="rounded border-[#2a2a2a] bg-[#0f0f0f]" /></th>
                                <th className="px-4 py-3">Client</th>
                                <th className="px-4 py-3">Service Type</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Deadline</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1a1a1a]">
                            {loading ? <tr><td colSpan={5} className="py-8 text-center text-[#666]"><Loader2 className="animate-spin h-5 w-5 mx-auto" /></td></tr> :
                                data.length === 0 ? <tr><td colSpan={5} className="py-8 text-center">No projects</td></tr> :
                                    data.map(proj => (
                                        <tr key={proj.id} className={clsx("hover:bg-[#1a1a1a]", isSelected(proj.id) && "bg-[#1a1a1a]")}>
                                            <td className="px-4 py-3"><input type="checkbox" checked={isSelected(proj.id)} onChange={() => toggleSelection(proj.id)} className="rounded border-[#2a2a2a] bg-[#0f0f0f]" /></td>
                                            <td className="px-4 py-3 font-medium text-white">{proj.clients?.business_name || "Unknown"}</td>
                                            <td className="px-4 py-3">{proj.service_type}</td>
                                            <td className="px-4 py-3">{proj.status}</td>
                                            <td className="px-4 py-3">{proj.deadline ? new Date(proj.deadline).toLocaleDateString() : "-"}</td>
                                        </tr>
                                    ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <BulkActionBar selectedCount={selectedCount} entityType="project" onClearSelection={clearSelection} onAction={handleBulkAction} />
        </div>
    );
}
