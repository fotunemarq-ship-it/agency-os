"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, Calendar, User } from "lucide-react";
import { createClient } from "@/lib/supabase";

interface Task {
  id: string;
  project_id: string;
  title: string;
  status: string;
  due_date: string | null;
  assigned_to: string | null;
  created_at: string;
}

interface ProjectTaskListProps {
  initialTasks: Task[];
  projectId: string;
  tasksError?: any;
}

export default function ProjectTaskList({
  initialTasks,
  projectId,
  tasksError,
}: ProjectTaskListProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const router = useRouter();

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    setUpdatingTaskId(taskId);
    try {
      const supabase = createClient();
      const newStatus =
        currentStatus === "completed" ? "not_started" : "completed";

      const updateQuery = (supabase.from("tasks") as any)
        .update({ status: newStatus })
        .eq("id", taskId);
      const { error } = await updateQuery;

      if (error) throw error;

      // Update local state
      setTasks(
        tasks.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );

      // Refresh the page to sync with server
      router.refresh();
    } catch (error: any) {
      console.error("Error updating task:", error);
      alert("Failed to update task. Please try again.");
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDate = new Date(date);
    taskDate.setHours(0, 0, 0, 0);

    const diffTime = taskDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `${Math.abs(diffDays)} days overdue`, isOverdue: true };
    } else if (diffDays === 0) {
      return { text: "Due today", isOverdue: false };
    } else if (diffDays === 1) {
      return { text: "Due tomorrow", isOverdue: false };
    } else {
      return {
        text: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        isOverdue: false,
      };
    }
  };

  if (tasksError) {
    return (
      <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-center">
        <p className="text-sm text-red-500">
          Error loading tasks: {tasksError.message}
        </p>
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="rounded-lg border border-[#1a1a1a] bg-zinc-900 p-8 text-center">
        <p className="text-[#a1a1aa]">No tasks found for this project.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const isCompleted = task.status === "completed";
        const dateInfo = formatDate(task.due_date);
        const isUpdating = updatingTaskId === task.id;

        return (
          <div
            key={task.id}
            onClick={() => toggleTaskStatus(task.id, task.status)}
            className={`flex cursor-pointer items-start gap-4 rounded-lg border border-[#1a1a1a] bg-zinc-900 p-4 transition-all hover:border-[#42CA80]/30 ${
              isCompleted ? "opacity-60" : ""
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {isCompleted ? (
                <CheckCircle2 className="h-5 w-5 text-[#42CA80]" />
              ) : (
                <Circle className="h-5 w-5 text-[#a1a1aa]" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              {/* Title */}
              <h3
                className={`font-medium ${
                  isCompleted ? "line-through text-[#a1a1aa]" : "text-white"
                }`}
              >
                {task.title}
              </h3>

              {/* Bottom Row: Assigned To, Due Date, Status Badge */}
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
                {/* Assigned To (Placeholder Avatar) */}
                <div className="flex items-center gap-1.5 text-[#a1a1aa]">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1a1a1a] border border-[#42CA80]/20">
                    <User className="h-3 w-3 text-[#42CA80]" />
                  </div>
                  <span>{task.assigned_to || "Unassigned"}</span>
                </div>

                {/* Due Date */}
                {dateInfo && (
                  <div
                    className={`flex items-center gap-1.5 ${
                      dateInfo.isOverdue && !isCompleted
                        ? "text-red-500"
                        : "text-[#a1a1aa]"
                    }`}
                  >
                    <Calendar
                      className={`h-3 w-3 ${
                        dateInfo.isOverdue && !isCompleted
                          ? "text-red-500"
                          : "text-[#a1a1aa]"
                      }`}
                    />
                    <span>{dateInfo.text}</span>
                  </div>
                )}

                {/* Status Badge */}
                <span
                  className={`rounded-full px-2 py-0.5 font-medium ${
                    isCompleted
                      ? "bg-[#42CA80] text-white"
                      : "bg-gray-700 text-gray-300"
                  }`}
                >
                  {isCompleted ? "Completed" : "Not Started"}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

