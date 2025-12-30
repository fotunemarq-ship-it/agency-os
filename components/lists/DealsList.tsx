"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import SavedViewsBar from "@/components/saved-views/SavedViewsBar";
import BulkActionBar from "@/components/saved-views/BulkActionBar";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import { applyFilters, applySort } from "@/lib/filtering";
import { bulkUpdateEntity } from "@/actions/bulk-actions";
import { SavedView, FilterConfig, SortConfig } from "@/types/view";
import { Loader2, ArrowUpDown } from "lucide-react";
import clsx from "clsx";

interface DealWithClient {
    id: string;
    deal_value: number;
    status: string;
    created_at: string;
    clients?: {
        business_name?: string | null;
    } | null;
}

export default function DealsList({ userId }: { userId: string }) {
    const [data, setData] = useState<DealWithClient[]>([]);
    const [loading, setLoading] = useState(true);

    // View State
    const [filters, setFilters] = useState<FilterConfig>({});
    const [sort, setSort] = useState<SortConfig>({ field: "created_at", direction: "desc" });

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

    const fetchData = useCallback(async () => {
        setLoading(true);
        const supabase = createClient();
        let query = supabase.from("deals").select("*, clients(business_name)", { count: "exact" });

        // Apply filters/sort
        query = applyFilters(query, filters);
        query = applySort(query, sort);
        query = query.limit(50); // Pagination...

        const { data: deals, error } = await query;
        if (error) console.error(error);
        else setData(deals || []);
        setLoading(false);
    }, [filters, sort]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleViewSelect = (view: SavedView) => {
        setFilters(view.filters);
        setSort(view.sort);
        clearSelection();
    };

    const handleReset = () => {
        setFilters({});
        setSort({ field: "created_at", direction: "desc" });
        clearSelection();
    };

    const handleBulkAction = async (action: string) => {
        // Similar to LeadsList implementation
        const ids = Array.from(selectedIds);
        let updates = {};
        if (action === "change_status") {
            const val = prompt("New status:");
            if (val) updates = { status: val };
        } else if (action === "export_csv") {
            // ... export logic
            return;
        }

        if (Object.keys(updates).length > 0) {
            await bulkUpdateEntity("deal", ids, updates, action);
            alert("Updated deals");
            clearSelection();
            fetchData();
        }
    };

    const toggleSort = (field: string) => {
        setSort(prev => ({ field, direction: prev.field === field && prev.direction === "desc" ? "asc" : "desc" }));
    };

    const handleSelectAllPage = () => {
        const ids = data.map(d => d.id);
        isAllSelected(ids) ? deselectAll(ids) : selectAll(ids);
    };

    return (
        <div className="space-y-4">
            <SavedViewsBar
                entityType="deal"
                currentFilters={filters}
                currentSort={sort}
                onViewSelect={handleViewSelect}
                onReset={handleReset}
                userId={userId}
            />

            {/* Table */}
            <div className="rounded-lg border border-[#1a1a1a] bg-[#0f0f0f] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-[#a1a1aa]">
                        <thead className="bg-[#1a1a1a] text-xs uppercase font-medium text-white">
                            <tr>
                                <th className="px-4 py-3 w-[40px]">
                                    <input type="checkbox" checked={data.length > 0 && isAllSelected(data.map(d => d.id))} onChange={handleSelectAllPage} className="rounded border-[#2a2a2a] bg-[#0f0f0f]" />
                                </th>
                                <th className="px-4 py-3 cursor-pointer" onClick={() => toggleSort('clients(business_name)')}>Client</th>
                                <th className="px-4 py-3 cursor-pointer" onClick={() => toggleSort('deal_value')}>Value</th>
                                <th className="px-4 py-3 cursor-pointer" onClick={() => toggleSort('status')}>Status</th>
                                <th className="px-4 py-3 cursor-pointer" onClick={() => toggleSort('created_at')}>Created</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1a1a1a]">
                            {loading ? <tr><td colSpan={5} className="py-8 text-center text-[#666]"><Loader2 className="animate-spin h-5 w-5 mx-auto" /></td></tr> :
                                data.length === 0 ? <tr><td colSpan={5} className="py-8 text-center">No deals</td></tr> :
                                    data.map(deal => (
                                        <tr key={deal.id} className={clsx("hover:bg-[#1a1a1a]", isSelected(deal.id) && "bg-[#1a1a1a]")}>
                                            <td className="px-4 py-3"><input type="checkbox" checked={isSelected(deal.id)} onChange={() => toggleSelection(deal.id)} className="rounded border-[#2a2a2a] bg-[#0f0f0f]" /></td>
                                            <td className="px-4 py-3 font-medium text-white">{deal.clients?.business_name || "Unknown"}</td>
                                            <td className="px-4 py-3">₹{deal.deal_value}</td>
                                            <td className="px-4 py-3">{deal.status}</td>
                                            <td className="px-4 py-3">{new Date(deal.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <BulkActionBar selectedCount={selectedCount} entityType="deal" onClearSelection={clearSelection} onAction={handleBulkAction} />
        </div>
    );
}
