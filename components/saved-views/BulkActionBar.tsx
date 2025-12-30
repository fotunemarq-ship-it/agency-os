"use client";

import { useState } from "react";
import { CheckSquare, X, ChevronDown, CheckCircle2 } from "lucide-react";
import clsx from "clsx";

interface BulkActionBarProps {
    selectedCount: number;
    entityType: "lead" | "deal" | "project" | "task";
    onClearSelection: () => void;
    // Generic action handler: (actionType, payload) => Promise<void>
    onAction: (action: string, payload?: any) => Promise<void>;
}

export default function BulkActionBar({
    selectedCount,
    entityType,
    onClearSelection,
    onAction,
}: BulkActionBarProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    // Configuration for actions based on entity type
    const getActions = () => {
        switch (entityType) {
            case "lead":
                return [
                    { label: "Change Status...", value: "change_status" },
                    { label: "Assign Sales Exec...", value: "assign_sales" },
                    { label: "Assign Strategist...", value: "assign_strategist" },
                    { label: "Set Follow-up...", value: "set_followup" },
                    { label: "Add Tag...", value: "add_tag" },
                    { label: "Export CSV", value: "export_csv" },
                ];
            case "deal":
                return [
                    { label: "Change Status...", value: "change_status" },
                    { label: "Export CSV", value: "export_csv" },
                ];
            case "project":
                return [
                    { label: "Change Status...", value: "change_status" },
                    { label: "Export CSV", value: "export_csv" },
                ];
            case "task":
                return [
                    { label: "Mark Completed", value: "mark_completed" },
                    { label: "Change Status...", value: "change_status" },
                    { label: "Assign...", value: "assign" },
                    { label: "Export CSV", value: "export_csv" },
                ];
            default:
                return [];
        }
    };

    const handleAction = async (action: string) => {
        setShowMenu(false);

        // For simple actions without modal inputs, we can execute directly
        // For others, we might normally open a modal, but for V1 let's stick to basics or use prompts/simple inputs
        // The parent component should probably handle displaying modals based on the triggered action if it requires input.
        // Here we just bubble up the intent.

        if (action === "mark_completed") {
            if (!confirm(`Mark ${selectedCount} tasks as completed?`)) return;
        }

        setIsProcessing(true);
        try {
            await onAction(action);
        } catch (e) {
            console.error(e);
            alert("Action failed");
        } finally {
            setIsProcessing(false);
        }
    };

    if (selectedCount === 0) return null;

    return (
        <div className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-4 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-2 pl-4 shadow-2xl animate-in slide-in-from-bottom-4">
            <div className="flex items-center gap-3">
                <div className="flex items-center justify-center rounded bg-[#42CA80]/20 p-1">
                    <CheckSquare className="h-4 w-4 text-[#42CA80]" />
                </div>
                <span className="text-sm font-medium text-white">
                    {selectedCount} selected
                </span>
            </div>

            <div className="h-6 w-px bg-[#2a2a2a]" />

            <div className="relative">
                <button
                    onClick={() => setShowMenu(!showMenu)}
                    disabled={isProcessing}
                    className="flex items-center gap-2 rounded-lg bg-[#252525] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#333] transition-colors disabled:opacity-50"
                >
                    Actions
                    <ChevronDown className="h-3.5 w-3.5 text-[#a1a1aa]" />
                </button>

                {showMenu && (
                    <div className="absolute bottom-full left-0 mb-2 w-48 rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] py-1 shadow-xl">
                        {getActions().map((action) => (
                            <button
                                key={action.value}
                                onClick={() => handleAction(action.value)}
                                className="w-full px-4 py-2 text-left text-sm text-[#a1a1aa] hover:bg-[#1a1a1a] hover:text-white"
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <button
                onClick={onClearSelection}
                className="ml-2 rounded-lg p-1.5 text-[#666] hover:bg-[#252525] hover:text-[#a1a1aa]"
                title="Clear selection"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}
