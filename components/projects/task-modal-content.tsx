"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Book } from "lucide-react";
import { createClient } from "@/lib/supabase";
import TaskChecklist from "@/components/tasks/task-checklist";
import TaskDependencies from "@/components/tasks/task-dependencies";

interface Task {
    id: string;
    project_id: string;
    title: string;
    status: string;
    due_date: string | null;
    assigned_to: string | null;
    priority?: string | null;
    sop_content?: string | null;
    created_at: string;
}

const TEAM_MEMBERS = [
    "Unassigned",
    "Ahmed",
    "Sara",
    "Mike",
    "Priya",
    "John",
    "Lisa",
    "Alex"
];

const PRIORITIES = [
    { value: "high", label: "High" },
    { value: "medium", label: "Med" },
    { value: "low", label: "Low" },
];

export default function TaskModalContent({
    task,
    isNew,
    onClose,
    onSave,
    isSaving,
    formTitle,
    setFormTitle,
    formDueDate,
    setFormDueDate,
    formAssignee,
    setFormAssignee,
    formPriority,
    setFormPriority,
    formSOP,
    setFormSOP,
    tasks
}: any) {
    const [activeTab, setActiveTab] = useState<'details' | 'checklist' | 'dependencies'>('details');
    const [checklistItems, setChecklistItems] = useState([]);
    const [dependencies, setDependencies] = useState([]);
    const [loadingExtras, setLoadingExtras] = useState(false);

    // Only fetch extras if existing task
    useEffect(() => {
        if (isNew) return;

        async function fetchExtras() {
            setLoadingExtras(true);
            const supabase = createClient();

            // Fetch checklist
            const { data: cl } = await (supabase.from("task_checklist_items") as any).select("*").eq("task_id", task.id);
            if (cl) setChecklistItems(cl);

            // Fetch dependencies
            const { data: deps } = await (supabase.from("task_dependencies") as any).select(`
                id,
                dependency_type,
                depends_on:depends_on_task_id (id, title, status)
            `).eq("task_id", task.id);
            if (deps) setDependencies(deps);

            setLoadingExtras(false);
        }
        fetchExtras();
    }, [task.id, isNew]);

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4">
            <div className="relative w-full max-w-lg overflow-hidden rounded-t-2xl border border-[#1a1a1a] bg-[#0f0f0f] shadow-2xl sm:rounded-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#1a1a1a] px-4 py-3 sm:px-6 sm:py-4 bg-[#0f0f0f] z-10">
                    <h2 className="text-base font-bold text-white sm:text-lg">
                        {isNew ? "Add New Task" : "Edit Task"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-[#666] transition-colors hover:bg-[#1a1a1a] hover:text-white"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Tabs (only for existing tasks) */}
                {!isNew && (
                    <div className="flex border-b border-[#1a1a1a] bg-[#0a0a0a]">
                        <button
                            onClick={() => setActiveTab('details')}
                            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'details' ? 'border-[#42CA80] text-[#42CA80]' : 'border-transparent text-[#666] hover:text-white'}`}
                        >
                            Details
                        </button>
                        <button
                            onClick={() => setActiveTab('checklist')}
                            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'checklist' ? 'border-[#42CA80] text-[#42CA80]' : 'border-transparent text-[#666] hover:text-white'}`}
                        >
                            Checklist
                        </button>
                        <button
                            onClick={() => setActiveTab('dependencies')}
                            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'dependencies' ? 'border-[#42CA80] text-[#42CA80]' : 'border-transparent text-[#666] hover:text-white'}`}
                        >
                            Dependencies
                        </button>
                    </div>
                )}

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0f0f0f]">
                    {activeTab === 'details' && (
                        <div className="space-y-4">
                            {/* Title */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-white">
                                    Task Title *
                                </label>
                                <input
                                    type="text"
                                    value={formTitle}
                                    onChange={(e) => setFormTitle(e.target.value)}
                                    placeholder="Enter task title..."
                                    className="w-full rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] px-3 py-2.5 text-white placeholder-[#666] focus:border-[#42CA80]/50 focus:outline-none"
                                />
                            </div>

                            {/* Due Date & Priority Row */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-white">
                                        Due Date
                                    </label>
                                    <input
                                        type="date"
                                        value={formDueDate}
                                        onChange={(e) => setFormDueDate(e.target.value)}
                                        className="w-full rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] px-3 py-2.5 text-white focus:border-[#42CA80]/50 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-white">
                                        Priority
                                    </label>
                                    <select
                                        value={formPriority}
                                        onChange={(e) => setFormPriority(e.target.value)}
                                        className="w-full rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] px-3 py-2.5 text-white focus:border-[#42CA80]/50 focus:outline-none"
                                    >
                                        {PRIORITIES.map((p) => (
                                            <option key={p.value} value={p.value}>
                                                {p.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Assignee */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-white">
                                    Assignee
                                </label>
                                <select
                                    value={formAssignee}
                                    onChange={(e) => setFormAssignee(e.target.value)}
                                    className="w-full rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] px-3 py-2.5 text-white focus:border-[#42CA80]/50 focus:outline-none"
                                >
                                    {TEAM_MEMBERS.map((member) => (
                                        <option key={member} value={member}>
                                            {member}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* SOP Section */}
                            <div>
                                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
                                    <Book className="h-4 w-4 text-indigo-400" />
                                    SOP / Instructions
                                </label>
                                <textarea
                                    value={formSOP}
                                    onChange={(e) => setFormSOP(e.target.value)}
                                    placeholder="Paste task instructions, SOP link, or step-by-step guide..."
                                    className="h-32 w-full resize-none rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] px-3 py-2.5 text-sm text-white placeholder-[#666] focus:border-indigo-500/50 focus:outline-none"
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'checklist' && (
                        loadingExtras ? <div className="p-8 text-center text-[#666]">Loading checklist...</div> :
                            <TaskChecklist taskId={task.id} initialItems={checklistItems} />
                    )}

                    {activeTab === 'dependencies' && (
                        loadingExtras ? <div className="p-8 text-center text-[#666]">Loading dependencies...</div> :
                            <TaskDependencies taskId={task.id} projectId={task.project_id} initialDependencies={dependencies} availableTasks={tasks} />
                    )}
                </div>

                {/* Footer */}
                <div className="flex gap-3 border-t border-[#1a1a1a] bg-[#0a0a0a] px-4 py-3 sm:px-6 sm:py-4 z-10 mt-auto">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-lg border border-[#333] bg-[#1a1a1a] px-4 py-2.5 font-medium text-white transition-colors hover:bg-[#252525]"
                    >
                        Close
                    </button>
                    {activeTab === 'details' && (
                        <button
                            onClick={onSave}
                            disabled={isSaving || !formTitle.trim()}
                            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#42CA80] px-4 py-2.5 font-semibold text-black transition-colors hover:bg-[#3ab872] disabled:opacity-50"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
