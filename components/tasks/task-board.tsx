"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, Clock, ListTodo } from "lucide-react";
import TaskCard from "./task-card";
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

interface TaskBoardProps {
  initialTasks: Task[];
}

type TabType = "open" | "my_tasks" | "completed";

const tabs: { id: TabType; label: string; icon: typeof ListTodo }[] = [
  { id: "open", label: "All Open Tasks", icon: ListTodo },
  { id: "my_tasks", label: "My Tasks", icon: Circle },
  { id: "completed", label: "Completed", icon: CheckCircle2 },
];

const statusOrder = ["not_started", "in_progress", "in_review"];
const statusLabels: Record<string, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  in_review: "In Review",
  completed: "Completed",
};

const statusColors: Record<string, string> = {
  not_started: "bg-gray-500",
  in_progress: "bg-[#42CA80]",
  in_review: "bg-purple-500",
  completed: "bg-blue-500",
};

export default function TaskBoard({ initialTasks }: TaskBoardProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [activeTab, setActiveTab] = useState<TabType>("open");
  const router = useRouter();

  const handleStatusChange = () => {
    router.refresh();
  };

  // Filter tasks based on active tab
  const filteredTasks = tasks.filter((task) => {
    if (activeTab === "open") {
      return task.status !== "completed";
    } else if (activeTab === "completed") {
      return task.status === "completed";
    } else {
      // "my_tasks" - for now show all open tasks (would filter by assigned_to in production)
      return task.status !== "completed";
    }
  });

  // Group tasks by status
  const groupedTasks = statusOrder.reduce(
    (acc, status) => {
      acc[status] = filteredTasks.filter((task) => task.status === status);
      return acc;
    },
    {} as Record<string, Task[]>
  );

  // For completed tab, just show all completed tasks
  const completedTasks = tasks.filter((task) => task.status === "completed");

  const totalOpen = tasks.filter((t) => t.status !== "completed").length;
  const totalCompleted = tasks.filter((t) => t.status === "completed").length;

  return (
    <div>
      {/* Stats Bar */}
      <div className="mb-6 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[#42CA80]" />
          <span className="text-sm text-[#a1a1aa]">
            <span className="font-semibold text-white">{totalOpen}</span> open tasks
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-500" />
          <span className="text-sm text-[#a1a1aa]">
            <span className="font-semibold text-white">{totalCompleted}</span> completed
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg bg-[#1a1a1a] p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all",
                isActive
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-[#a1a1aa] hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Task List */}
      {activeTab === "completed" ? (
        <div className="space-y-2">
          {completedTasks.length === 0 ? (
            <div className="rounded-lg border border-[#1a1a1a] bg-zinc-900/50 p-8 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-[#3a3a3a]" />
              <p className="mt-2 text-sm text-[#a1a1aa]">No completed tasks yet</p>
            </div>
          ) : (
            completedTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 rounded-lg border border-[#1a1a1a] bg-zinc-900/30 px-4 py-3 opacity-60"
              >
                <CheckCircle2 className="h-5 w-5 text-[#42CA80]" />
                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-sm text-[#a1a1aa] line-through">
                    {task.title}
                  </h4>
                  <p className="mt-0.5 truncate text-xs text-[#666]">
                    {task.projects?.clients?.business_name || "Unknown Client"}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {statusOrder.map((status) => {
            const statusTasks = groupedTasks[status] || [];
            if (statusTasks.length === 0) return null;

            return (
              <div key={status}>
                {/* Status Header */}
                <div className="mb-3 flex items-center gap-2">
                  <div className={clsx("h-2 w-2 rounded-full", statusColors[status])} />
                  <h3 className="text-sm font-semibold text-white">
                    {statusLabels[status]}
                  </h3>
                  <span className="rounded-full bg-[#1a1a1a] px-2 py-0.5 text-xs text-[#a1a1aa]">
                    {statusTasks.length}
                  </span>
                </div>

                {/* Tasks */}
                <div className="space-y-2">
                  {statusTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {filteredTasks.length === 0 && (
            <div className="rounded-lg border border-[#1a1a1a] bg-zinc-900/50 p-8 text-center">
              <ListTodo className="mx-auto h-8 w-8 text-[#3a3a3a]" />
              <p className="mt-2 text-sm text-[#a1a1aa]">No tasks found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

