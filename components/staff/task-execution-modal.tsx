"use client";

import { useState } from "react";
import {
  X,
  Calendar,
  Clock,
  Book,
  Play,
  Send,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  MessageSquare,
  Flag,
  Building2,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import ReactMarkdown from "react-markdown";
import clsx from "clsx";

interface Task {
  id: string;
  title: string;
  status: string;
  due_date: string | null;
  assigned_to: string | null;
  priority?: string | null;
  sop_content?: string | null;
  submission_notes?: string | null;
  project_id: string;
  projects?: {
    service_type: string;
    clients?: {
      business_name: string;
    } | null;
  } | null;
}

interface TaskExecutionModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (taskId: string, newStatus: string, notes?: string) => void;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  not_started: { label: "Not Started", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
  in_progress: { label: "In Progress", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  in_review: { label: "In Review", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  needs_attention: { label: "Needs Attention", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  completed: { label: "Completed", color: "bg-[#42CA80]/20 text-[#42CA80] border-[#42CA80]/30" },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  high: { label: "High Priority", color: "bg-red-500/20 text-red-400" },
  medium: { label: "Medium Priority", color: "bg-amber-500/20 text-amber-400" },
  low: { label: "Low Priority", color: "bg-blue-500/20 text-blue-400" },
};

function isOverdue(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(dateStr);
  dueDate.setHours(0, 0, 0, 0);
  return dueDate < today;
}

function isToday(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const today = new Date().toISOString().split("T")[0];
  return dateStr.split("T")[0] === today;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "No due date";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function TaskExecutionModal({
  task,
  isOpen,
  onClose,
  onStatusChange,
}: TaskExecutionModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [showNotesInput, setShowNotesInput] = useState(false);
  const [notes, setNotes] = useState(task.submission_notes || "");
  const [comment, setComment] = useState("");

  if (!isOpen) return null;

  const statusInfo = STATUS_CONFIG[task.status] || STATUS_CONFIG.not_started;
  const priorityInfo = PRIORITY_CONFIG[task.priority || "medium"] || PRIORITY_CONFIG.medium;
  const clientName = task.projects?.clients?.business_name || "Unknown Client";
  const serviceType = task.projects?.service_type || "Unknown Service";
  const taskOverdue = isOverdue(task.due_date);
  const taskDueToday = isToday(task.due_date);

  const handleStatusUpdate = async (newStatus: string, requiresNotes = false) => {
    if (requiresNotes && !notes.trim()) {
      setShowNotesInput(true);
      return;
    }

    setIsUpdating(true);
    setActiveAction(newStatus);

    try {
      const supabase = createClient();
      const updateData: any = { status: newStatus };
      
      if (notes.trim()) {
        updateData.submission_notes = notes.trim();
      }

      const { error } = await supabase
        .from("tasks")
        .update(updateData)
        .eq("id", task.id);

      if (error) throw error;

      onStatusChange(task.id, newStatus, notes.trim() || undefined);
      
      if (newStatus === "completed") {
        onClose();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Please try again.");
    } finally {
      setIsUpdating(false);
      setActiveAction(null);
    }
  };

  const formatServiceType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[#1a1a1a] bg-[#0f0f0f] shadow-2xl lg:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-lg p-2 text-[#666] transition-colors hover:bg-[#1a1a1a] hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Left Side: Context & SOP */}
        <div className="flex flex-1 flex-col border-b border-[#1a1a1a] lg:border-b-0 lg:border-r">
          {/* Task Header */}
          <div className="border-b border-[#1a1a1a] p-4 sm:p-6">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="flex items-center gap-1.5 rounded-lg bg-[#1a1a1a] px-2.5 py-1 text-[#a1a1aa]">
                <Building2 className="h-3.5 w-3.5" />
                {clientName}
              </span>
              <span className="rounded-lg bg-indigo-500/20 px-2.5 py-1 text-xs font-medium text-indigo-400">
                {formatServiceType(serviceType)}
              </span>
              <span className={clsx("rounded-lg px-2.5 py-1 text-xs font-medium", priorityInfo.color)}>
                {priorityInfo.label}
              </span>
            </div>

            <h2 className="mt-3 text-xl font-bold text-white sm:text-2xl">
              {task.title}
            </h2>

            <div className="mt-3 flex items-center gap-4">
              <div className={clsx(
                "flex items-center gap-1.5 text-sm",
                taskOverdue ? "text-red-400" : taskDueToday ? "text-amber-400" : "text-[#a1a1aa]"
              )}>
                <Calendar className="h-4 w-4" />
                <span className="font-medium">
                  {taskOverdue ? "Overdue: " : taskDueToday ? "Due Today: " : "Due: "}
                  {formatDate(task.due_date)}
                </span>
              </div>
            </div>
          </div>

          {/* SOP Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Book className="h-5 w-5 text-indigo-400" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#666]">
                Standard Operating Procedure
              </h3>
            </div>

            {task.sop_content ? (
              <div className="prose prose-invert prose-sm max-w-none rounded-xl bg-[#1a1a1a] p-4 sm:p-6">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => <h1 className="text-xl font-bold text-white mb-4">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-lg font-semibold text-white mt-6 mb-3">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-base font-medium text-white mt-4 mb-2">{children}</h3>,
                    p: ({ children }) => <p className="text-[#a1a1aa] mb-3 leading-relaxed">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc list-inside text-[#a1a1aa] space-y-1 mb-3">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside text-[#a1a1aa] space-y-1 mb-3">{children}</ol>,
                    li: ({ children }) => <li className="text-[#a1a1aa]">{children}</li>,
                    a: ({ href, children }) => (
                      <a href={href} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline">
                        {children}
                      </a>
                    ),
                    code: ({ children }) => (
                      <code className="bg-[#0f0f0f] rounded px-1.5 py-0.5 text-sm text-[#42CA80]">{children}</code>
                    ),
                    pre: ({ children }) => (
                      <pre className="bg-[#0f0f0f] rounded-lg p-4 overflow-x-auto text-sm">{children}</pre>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-indigo-500 pl-4 italic text-[#888]">{children}</blockquote>
                    ),
                  }}
                >
                  {task.sop_content}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#333] bg-[#1a1a1a]/50 p-8 text-center">
                <Book className="h-12 w-12 text-[#333]" />
                <p className="mt-3 text-sm text-[#666]">No SOP provided for this task</p>
                <p className="mt-1 text-xs text-[#555]">
                  Contact your Project Manager for instructions
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex w-full flex-col bg-[#0a0a0a] lg:w-80">
          {/* Current Status */}
          <div className="border-b border-[#1a1a1a] p-4 sm:p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-[#666]">Current Status</p>
            <div className={clsx(
              "mt-2 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold",
              statusInfo.color
            )}>
              {task.status === "completed" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : task.status === "needs_attention" ? (
                <AlertTriangle className="h-4 w-4" />
              ) : (
                <Clock className="h-4 w-4" />
              )}
              {statusInfo.label}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[#666]">Actions</p>
            
            <div className="space-y-3">
              {/* Start Work */}
              {(task.status === "not_started" || task.status === "needs_attention") && (
                <button
                  onClick={() => handleStatusUpdate("in_progress")}
                  disabled={isUpdating}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
                >
                  {activeAction === "in_progress" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  Start Work
                </button>
              )}

              {/* Submit for Review */}
              {task.status === "in_progress" && (
                <button
                  onClick={() => handleStatusUpdate("in_review")}
                  disabled={isUpdating}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-purple-600 disabled:opacity-50"
                >
                  {activeAction === "in_review" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Submit for Review
                </button>
              )}

              {/* Needs Attention */}
              {task.status !== "completed" && task.status !== "needs_attention" && (
                <>
                  <button
                    onClick={() => {
                      setShowNotesInput(true);
                    }}
                    disabled={isUpdating}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-amber-500/50 bg-amber-500/10 px-4 py-3 font-semibold text-amber-400 transition-colors hover:border-amber-500 hover:bg-amber-500/20 disabled:opacity-50"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Needs Attention
                  </button>

                  {showNotesInput && (
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
                      <p className="mb-2 text-xs font-medium text-amber-400">
                        What's blocking you?
                      </p>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Describe the issue..."
                        className="h-24 w-full resize-none rounded-lg border border-[#333] bg-[#0f0f0f] px-3 py-2 text-sm text-white placeholder-[#666] focus:border-amber-500/50 focus:outline-none"
                      />
                      <button
                        onClick={() => handleStatusUpdate("needs_attention", true)}
                        disabled={isUpdating || !notes.trim()}
                        className="mt-2 w-full rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-black transition-colors hover:bg-amber-400 disabled:opacity-50"
                      >
                        {activeAction === "needs_attention" ? (
                          <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                        ) : (
                          "Submit Issue"
                        )}
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* Mark Complete */}
              {(task.status === "in_progress" || task.status === "in_review") && (
                <button
                  onClick={() => handleStatusUpdate("completed")}
                  disabled={isUpdating}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#42CA80] px-4 py-3 font-semibold text-black transition-colors hover:bg-[#3ab872] disabled:opacity-50"
                >
                  {activeAction === "completed" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  Mark Complete
                </button>
              )}
            </div>

            {/* Comment Box */}
            <div className="mt-6">
              <label className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#666]">
                <MessageSquare className="h-3.5 w-3.5" />
                Notes for PM
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add any notes or updates..."
                className="h-24 w-full resize-none rounded-xl border border-[#1a1a1a] bg-[#1a1a1a] px-3 py-2 text-sm text-white placeholder-[#666] focus:border-indigo-500/50 focus:outline-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-[#1a1a1a] p-4">
            <button
              onClick={onClose}
              className="w-full rounded-xl border border-[#333] bg-[#1a1a1a] px-4 py-2.5 font-medium text-white transition-colors hover:bg-[#252525]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

