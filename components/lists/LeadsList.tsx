"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import SavedViewsBar from "@/components/saved-views/SavedViewsBar";
import BulkActionBar from "@/components/saved-views/BulkActionBar";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import { applyFilters, applySort } from "@/lib/filtering";
import { bulkUpdateEntity } from "@/actions/bulk-actions";
import { SavedView, FilterConfig, SortConfig } from "@/types/view";
import { Loader2, ArrowUpDown, ChevronDown, Check } from "lucide-react";
import clsx from "clsx";

export default function LeadsList({ userId }: { userId: string }) {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);

    // View State
    const [currentView, setCurrentView] = useState<SavedView | null>(null);
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

    useEffect(() => {
        fetchData();
    }, [filters, sort]);

    const fetchData = async () => {
        setLoading(true);
        const supabase = createClient();
        let query = supabase.from("leads").select("*", { count: "exact" });

        query = applyFilters(query, filters);
        query = applySort(query, sort);

        // Limit for now, pagination to be added if needed
        query = query.limit(50);

        const { data: leads, error, count } = await query;
        if (error) {
            console.error(error);
        } else {
            setData(leads || []);
            setTotal(count || 0);
        }
        setLoading(false);
    };

    const handleViewSelect = (view: SavedView) => {
        setCurrentView(view);
        setFilters(view.filters);
        setSort(view.sort);
        clearSelection();
    };

    const handleReset = () => {
        setCurrentView(null);
        setFilters({});
        setSort({ field: "created_at", direction: "desc" });
        clearSelection();
    };

    const handleBulkAction = async (action: string) => {
        const ids = Array.from(selectedIds);
        let updates = {};

        if (action === "change_status") {
            const status = prompt("Enter new status (new, contacting, qualified, closed_lost, etc):");
            if (!status) return;
            updates = { status };
        } else if (action === "assign_sales") {
            const salesId = prompt("Enter Sales Exec UUID:"); // Ideally a picker
            if (!salesId) return;
            updates = { assigned_sales_exec: salesId };
        } else if (action === "export_csv") {
            // Handle export separately
            try {
                const res = await fetch("/api/export", {
                    method: "POST",
                    body: JSON.stringify({ entityType: "lead", filters, sort })
                });
                if (res.ok) {
                    const blob = await res.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "leads.csv";
                    a.click();
                } else {
                    alert("Export failed");
                }
            } catch (e) { console.error(e); alert("Export error"); }
            return;
        }

        if (Object.keys(updates).length > 0) {
            const result = await bulkUpdateEntity("lead", ids, updates, action);
            alert(`Updated ${result.successCount} leads.`);
            if (result.failedIds.length > 0) {
                console.warn("Failed IDs:", result.failedIds);
            }
            clearSelection();
            fetchData();
        }
    };

    const toggleSort = (field: string) => {
        setSort(prev => ({
            field,
            direction: prev.field === field && prev.direction === "desc" ? "asc" : "desc"
        }));
    };

    const handleSelectAllPage = () => {
        if (isAllSelected(data.map(d => d.id))) {
            deselectAll(data.map(d => d.id));
        } else {
            selectAll(data.map(d => d.id));
        }
    };

    return (
        <div className="space-y-4">
            {/* View Bar */}
            <SavedViewsBar
                entityType="lead"
                currentFilters={filters}
                currentSort={sort}
                onViewSelect={handleViewSelect}
                onReset={handleReset}
                userId={userId}
            />

            {/* Filter Controls (Simplified for V1 - just showing JSON editor or basic inputs could go here) */}
            <div className="flex gap-2">
                {/* Simple status filter dropdown */}
                <select
                    className="bg-[#1a1a1a] text-white border border-[#2a2a2a] rounded px-3 py-1 text-sm"
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value ? [e.target.value] : undefined }))}
                    value={filters.status?.[0] || ""}
                >
                    <option value="">All Statuses</option>
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="closed_won">Closed Won</option>
                </select>

                {/* Search */}
                <input
                    type="text"
                    placeholder="Search company..."
                    className="bg-[#1a1a1a] text-white border border-[#2a2a2a] rounded px-3 py-1 text-sm"
                    value={filters.search || ""}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
            </div>

            {/* Table */}
            <div className="rounded-lg border border-[#1a1a1a] bg-[#0f0f0f] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-[#a1a1aa]">
                        <thead className="bg-[#1a1a1a] text-xs uppercase font-medium text-white">
                            <tr>
                                <th className="px-4 py-3 w-[40px]">
                                    <input
                                        type="checkbox"
                                        className="rounded border-[#2a2a2a] bg-[#0f0f0f]"
                                        checked={data.length > 0 && isAllSelected(data.map(d => d.id))}
                                        onChange={handleSelectAllPage}
                                    />
                                </th>
                                <th className="px-4 py-3 cursor-pointer hover:text-[#42CA80]" onClick={() => toggleSort('company_name')}>
                                    Company {sort.field === 'company_name' && <ArrowUpDown className="inline h-3 w-3" />}
                                </th>
                                <th className="px-4 py-3 cursor-pointer hover:text-[#42CA80]" onClick={() => toggleSort('status')}>
                                    Status {sort.field === 'status' && <ArrowUpDown className="inline h-3 w-3" />}
                                </th>
                                <th className="px-4 py-3">Lead Type</th>
                                <th className="px-4 py-3 cursor-pointer hover:text-[#42CA80]" onClick={() => toggleSort('created_at')}>
                                    Created {sort.field === 'created_at' && <ArrowUpDown className="inline h-3 w-3" />}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1a1a1a]">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-[#666]">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                                        Loading leads...
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-[#666]">No leads found</td>
                                </tr>
                            ) : (
                                data.map((lead) => (
                                    <tr key={lead.id} className={clsx("hover:bg-[#1a1a1a] transition-colors", isSelected(lead.id) && "bg-[#1a1a1a]")}>
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                className="rounded border-[#2a2a2a] bg-[#0f0f0f]"
                                                checked={isSelected(lead.id)}
                                                onChange={() => toggleSelection(lead.id)}
                                            />
                                        </td>
                                        <td className="px-4 py-3 font-medium text-white">
                                            {lead.company_name}
                                            <div className="text-xs text-[#666]">{lead.contact_person}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={clsx("px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider",
                                                lead.status === 'new' ? 'bg-blue-500/10 text-blue-400' :
                                                    lead.status === 'qualified' ? 'bg-purple-500/10 text-purple-400' :
                                                        lead.status === 'closed_won' ? 'bg-green-500/10 text-green-400' :
                                                            'bg-zinc-800 text-zinc-400'
                                            )}>
                                                {lead.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">{lead.lead_type}</td>
                                        <td className="px-4 py-3">{new Date(lead.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <BulkActionBar
                selectedCount={selectedCount}
                entityType="lead"
                onClearSelection={clearSelection}
                onAction={handleBulkAction}
            />
        </div>
    );
}
