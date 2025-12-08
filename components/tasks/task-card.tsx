"use client";

import { useState, useRef, useEffect } from "react";
import { Clock, AlertCircle, ChevronDown, Circle, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase";
import clsx from "clsx";

interface Task {
  id: string;
  title: string;
  status: string;
  due_date: string | null;
  assigned_to: string | null;
  project_id: string;
  projects?: {
    service_type: string;
    clients?: {
      business_name: string;
    } | null;
  } | null;
}

interface TaskCardProps {
  task: Task;
  onStatusChange: () => void;
}

// Status options - these should match the database enum/check constraint
const statusOptions = [
  { value: "not_started", label: "Not Started", color: "bg-gray-500", icon: Circle },
  { value: "in_progress", label: "In Progress", color: "bg-[#42CA80]", icon: Loader2 },
  { value: "in_review", label: "In Review", color: "bg-purple-500", icon: Clock },
  { value: "completed", label: "Completed", color: "bg-blue-500", icon: CheckCircle2 },
];

export default function TaskCard({ task, onStatusChange }: TaskCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDueDateInfo = (dueDate: string | null) => {
    if (!dueDate) return { label: "No due date", color: "text-[#a1a1aa]", icon: Clock };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    const formatted = due.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    if (diffDays < 0) {
      return { label: `Overdue: ${formatted}`, color: "text-red-400", icon: AlertCircle };
    } else if (diffDays === 0) {
      return { label: "Due Today", color: "text-orange-400", icon: AlertCircle };
    } else if (diffDays <= 3) {
      return { label: formatted, color: "text-yellow-400", icon: Clock };
    } else {
      return { label: formatted, color: "text-[#42CA80]", icon: Clock };
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    console.log("=== STATUS CHANGE CLICKED ===");
    console.log("Task ID:", task.id);
    console.log("Current status:", task.status);
    console.log("New status:", newStatus);

    if (newStatus === task.status) {
      console.log("Same status, skipping update");
      setIsDropdownOpen(false);
      return;
    }

    setIsUpdating(true);
    setIsDropdownOpen(false);

    try {
      console.log("Creating Supabase client...");
      const supabase = createClient();
      
      console.log("Sending update request...");
      const { data, error } = await supabase
        .from("tasks")
        .update({ status: newStatus })
        .eq("id", task.id)
        .select();

      console.log("Response received:", { data, error });

      if (error) {
        console.error("Supabase error:", error);
        alert(`Error: ${error.message}\n\nCode: ${error.code}\nDetails: ${error.details || "none"}`);
        return;
      }

      if (!data || data.length === 0) {
        console.warn("No data returned - task may not exist or RLS is blocking");
        alert("Update returned no data. The task may not exist or RLS policies are blocking the update.");
        return;
      }

      console.log("Task updated successfully:", data);
      alert(`✅ Task status updated to "${newStatus}"!`);
      onStatusChange();
    } catch (error: any) {
      console.error("Catch block error:", error);
      alert(`Unexpected error: ${error.message || JSON.stringify(error)}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const dueDateInfo = getDueDateInfo(task.due_date);
  const DueDateIcon = dueDateInfo.icon;
  const clientName = task.projects?.clients?.business_name || "Unknown Client";
  const serviceType = task.projects?.service_type
    ?.split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ") || "";

  const currentStatus = statusOptions.find((s) => s.value === task.status) || statusOptions[0];
  const StatusIcon = currentStatus.icon;

  return (
    <div className="group flex items-center justify-between gap-4 rounded-lg border border-[#1a1a1a] bg-zinc-900/50 px-4 py-3 transition-all hover:border-[#42CA80]/30 hover:bg-zinc-900">
      {/* Left: Status Dropdown + Content */}
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {/* Status Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            disabled={isUpdating}
            className={clsx(
              "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-all",
              "border border-[#2a2a2a] hover:border-[#3a3a3a]",
              isUpdating && "opacity-50 cursor-not-allowed"
            )}
            aria-label="Change task status"
          >
            <div className={clsx("h-2 w-2 rounded-full", currentStatus.color)} />
            <span className="text-[#a1a1aa] hidden sm:inline">{currentStatus.label}</span>
            <ChevronDown className={clsx(
              "h-3 w-3 text-[#666] transition-transform",
              isDropdownOpen && "rotate-180"
            )} />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute left-0 top-full z-50 mt-1 w-44 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] py-1 shadow-xl">
              {statusOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = option.value === task.status;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleStatusChange(option.value)}
                    className={clsx(
                      "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors",
                      isSelected
                        ? "bg-[#42CA80]/10 text-[#42CA80]"
                        : "text-[#a1a1aa] hover:bg-[#2a2a2a] hover:text-white"
                    )}
                  >
                    <div className={clsx("h-2 w-2 rounded-full", option.color)} />
                    <span>{option.label}</span>
                    {isSelected && <CheckCircle2 className="ml-auto h-3.5 w-3.5" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <h4 className="truncate text-sm font-medium text-white">{task.title}</h4>
          <p className="mt-0.5 truncate text-xs text-[#a1a1aa]">
            {clientName} · {serviceType}
          </p>
        </div>
      </div>

      {/* Right: Due Date */}
      <div className={clsx("flex items-center gap-1.5 text-xs flex-shrink-0", dueDateInfo.color)}>
        <DueDateIcon className="h-3.5 w-3.5" />
        <span>{dueDateInfo.label}</span>
      </div>
    </div>
  );
}

