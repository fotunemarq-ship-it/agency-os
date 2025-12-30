"use client";

import TaskModalContent from "./task-modal-content";
import { checkTaskBlocked } from "@/lib/projects/task-logic";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Circle,
  Calendar,
  User,
  Plus,
  Book,
  Trash2,
  Edit3,
  X,
  ChevronDown,
  Loader2,
  AlertTriangle,
  Flag,
  MoreHorizontal,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import clsx from "clsx";

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

interface TaskManagerProps {
  initialTasks: Task[];
  projectId: string;
  tasksError?: any;
}

const TEAM_MEMBERS = [
  "Unassigned",
  "Ahmed",
  "Sara",
  "Mike",
  "Priya",
  "John",
  "Lisa",
];

const PRIORITIES = [
  { value: "high", label: "High", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  { value: "medium", label: "Med", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  { value: "low", label: "Low", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
];

const STATUS_OPTIONS = [
  { value: "not_started", label: "Not Started", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
  { value: "in_progress", label: "In Progress", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { value: "in_review", label: "In Review", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  { value: "completed", label: "Completed", color: "bg-[#42CA80]/20 text-[#42CA80] border-[#42CA80]/30" },
];

function isOverdue(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(dateStr);
  dueDate.setHours(0, 0, 0, 0);
  return dueDate < today;
}

function formatDisplayDate(dateStr: string | null): string {
  if (!dateStr) return "No date";
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(date);
  dueDate.setHours(0, 0, 0, 0);

  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function TaskManager({
  initialTasks,
  projectId,
  tasksError,
}: TaskManagerProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showSOPModal, setShowSOPModal] = useState(false);
  const [selectedSOP, setSelectedSOP] = useState<{ title: string; content: string } | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const router = useRouter();

  // Modal form state
  const [formTitle, setFormTitle] = useState("");
  const [formDueDate, setFormDueDate] = useState("");
  const [formAssignee, setFormAssignee] = useState("Unassigned");
  const [formPriority, setFormPriority] = useState("medium");
  const [formSOP, setFormSOP] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const resetForm = () => {
    setFormTitle("");
    setFormDueDate("");
    setFormAssignee("Unassigned");
    setFormPriority("medium");
    setFormSOP("");
    setEditingTask(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowTaskModal(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDueDate(task.due_date?.split("T")[0] || "");
    setFormAssignee(task.assigned_to || "Unassigned");
    setFormPriority(task.priority || "medium");
    setFormSOP(task.sop_content || "");
    setShowTaskModal(true);
  };

  const openSOPViewer = (task: Task) => {
    if (task.sop_content) {
      setSelectedSOP({ title: task.title, content: task.sop_content });
      setShowSOPModal(true);
    }
  };

  const handleSaveTask = async () => {
    if (!formTitle.trim()) return;

    setIsSaving(true);
    const supabase = createClient();

    try {
      const taskData = {
        title: formTitle.trim(),
        due_date: formDueDate || null,
        assigned_to: formAssignee === "Unassigned" ? null : formAssignee,
        priority: formPriority,
        sop_content: formSOP.trim() || null,
        project_id: projectId,
      };

      if (editingTask) {
        // Update existing task
        const updateQuery2 = (supabase.from("tasks") as any)
          .update(taskData)
          .eq("id", editingTask.id);
        const { error } = await updateQuery2;

        if (error) throw error;

        setTasks(
          tasks.map((t) =>
            t.id === editingTask.id ? { ...t, ...taskData } : t
          )
        );
      } else {
        // Create new task
        const { data, error } = await supabase
          .from("tasks")
          .insert({ ...taskData, status: "not_started" } as any)
          .select()
          .single();

        if (error) throw error;
        if (data) setTasks([...tasks, data]);
      }

      setShowTaskModal(false);
      resetForm();
      router.refresh();
    } catch (error: any) {
      console.error("Error saving task:", error);
      alert("Failed to save task. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Delete this task?")) return;

    setUpdatingTaskId(taskId);
    const supabase = createClient();

    try {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId);
      if (error) throw error;

      setTasks(tasks.filter((t) => t.id !== taskId));
      router.refresh();
    } catch (error: any) {
      console.error("Error deleting task:", error);
      alert("Failed to delete task.");
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const updateTaskField = async (
    taskId: string,
    field: string,
    value: any
  ) => {
    setUpdatingTaskId(taskId);
    const supabase = createClient();

    try {
      const updateQuery = (supabase.from("tasks") as any)
        .update({ [field]: value })
        .eq("id", taskId);
      const { error } = await updateQuery;

      if (error) throw error;

      setTasks(
        tasks.map((t) => (t.id === taskId ? { ...t, [field]: value } : t))
      );
      router.refresh();
    } catch (error: any) {
      console.error(`Error updating ${field}:`, error);
    } finally {
      setUpdatingTaskId(null);
      setOpenDropdown(null);
    }
  };

  const cycleStatus = async (task: Task) => {
    const statusOrder = ["not_started", "in_progress", "in_review", "completed"];
    const currentIndex = statusOrder.indexOf(task.status);
    const nextIndex = (currentIndex + 1) % statusOrder.length;
    await updateTaskField(task.id, "status", statusOrder[nextIndex]);
  };

  if (tasksError) {
    return (
      <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-4 text-center">
        <p className="text-sm text-red-500">
          Error loading tasks: {tasksError.message}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Header with Add Button */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-white sm:text-xl">Tasks</h2>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-lg bg-[#42CA80] px-3 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#3ab872] active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Task</span>
        </button>
      </div>

      {/* Task Table */}
      {tasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#333] p-8 text-center">
          <p className="text-sm text-[#666]">No tasks yet. Add your first task!</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#1a1a1a]">
          {/* Desktop Table */}
          <table className="hidden w-full min-w-[720px] sm:table">
            <thead className="border-b border-[#1a1a1a] bg-[#0a0a0a]">
              <tr>
                <th className="w-28 p-3 text-left text-xs font-medium uppercase tracking-wider text-[#666]">
                  Status
                </th>
                <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-[#666]">
                  Task
                </th>
                <th className="w-32 p-3 text-left text-xs font-medium uppercase tracking-wider text-[#666]">
                  Assignee
                </th>
                <th className="w-28 p-3 text-left text-xs font-medium uppercase tracking-wider text-[#666]">
                  Due Date
                </th>
                <th className="w-20 p-3 text-left text-xs font-medium uppercase tracking-wider text-[#666]">
                  Priority
                </th>
                <th className="w-20 p-3 text-right text-xs font-medium uppercase tracking-wider text-[#666]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1a] bg-[#1a1a1a]">
              {tasks.map((task) => {
                const isCompleted = task.status === "completed";
                const taskOverdue = !isCompleted && isOverdue(task.due_date);
                const priority = PRIORITIES.find((p) => p.value === task.priority) || PRIORITIES[1];

                return (
                  <tr
                    key={task.id}
                    className={clsx(
                      "transition-colors hover:bg-[#252525]",
                      isCompleted && "opacity-50"
                    )}
                  >
                    {/* Status Dropdown */}
                    <td className="p-3">
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdown(openDropdown === `status-${task.id}` ? null : `status-${task.id}`);
                          }}
                          disabled={updatingTaskId === task.id}
                          className={clsx(
                            "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium transition-colors",
                            STATUS_OPTIONS.find((s) => s.value === task.status)?.color || STATUS_OPTIONS[0].color
                          )}
                        >
                          {updatingTaskId === task.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : isCompleted ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : task.status === "in_review" ? (
                            <AlertTriangle className="h-3 w-3" />
                          ) : task.status === "in_progress" ? (
                            <Circle className="h-3 w-3" />
                          ) : (
                            <Circle className="h-3 w-3" />
                          )}
                          {STATUS_OPTIONS.find((s) => s.value === task.status)?.label || "Not Started"}
                          <ChevronDown className="h-3 w-3" />
                        </button>
                        {openDropdown === `status-${task.id}` && (
                          <div className="absolute left-0 top-full z-10 mt-1 w-32 rounded-lg border border-[#333] bg-[#1a1a1a] py-1 shadow-xl">
                            {STATUS_OPTIONS.map((status) => (
                              <button
                                key={status.value}
                                onClick={() => updateTaskField(task.id, "status", status.value)}
                                className={clsx(
                                  "flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors hover:bg-[#252525]",
                                  task.status === status.value ? status.color.split(" ")[1] : "text-[#a1a1aa]"
                                )}
                              >
                                {status.value === "completed" ? (
                                  <CheckCircle2 className="h-3 w-3" />
                                ) : status.value === "in_review" ? (
                                  <AlertTriangle className="h-3 w-3" />
                                ) : (
                                  <Circle className="h-3 w-3" />
                                )}
                                {status.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Task Name + SOP */}
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={clsx(
                            "font-medium",
                            isCompleted ? "line-through text-[#666]" : "text-white"
                          )}
                        >
                          {task.title}
                        </span>
                        {task.sop_content && (
                          <button
                            onClick={() => openSOPViewer(task)}
                            className="rounded p-1 text-indigo-400 transition-colors hover:bg-indigo-500/20"
                            title="View SOP"
                          >
                            <Book className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Assignee Dropdown */}
                    <td className="p-3">
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdown(openDropdown === `assignee-${task.id}` ? null : `assignee-${task.id}`);
                          }}
                          className="flex items-center gap-1.5 rounded-lg bg-[#0f0f0f] px-2 py-1 text-xs text-[#a1a1aa] transition-colors hover:bg-[#252525]"
                        >
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/20 text-[10px] font-medium text-indigo-400">
                            {(task.assigned_to || "U").charAt(0)}
                          </div>
                          <span className="max-w-[60px] truncate">{task.assigned_to || "Unassigned"}</span>
                          <ChevronDown className="h-3 w-3" />
                        </button>
                        {openDropdown === `assignee-${task.id}` && (
                          <div className="absolute left-0 top-full z-10 mt-1 w-36 rounded-lg border border-[#333] bg-[#1a1a1a] py-1 shadow-xl">
                            {TEAM_MEMBERS.map((member) => (
                              <button
                                key={member}
                                onClick={() => updateTaskField(task.id, "assigned_to", member === "Unassigned" ? null : member)}
                                className="w-full px-3 py-1.5 text-left text-xs text-[#a1a1aa] transition-colors hover:bg-[#252525] hover:text-white"
                              >
                                {member}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Due Date */}
                    <td className="p-3">
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdown(openDropdown === `date-${task.id}` ? null : `date-${task.id}`);
                          }}
                          className={clsx(
                            "flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs transition-colors",
                            taskOverdue
                              ? "bg-red-500/20 text-red-400"
                              : "bg-[#0f0f0f] text-[#a1a1aa] hover:bg-[#252525]"
                          )}
                        >
                          <Calendar className="h-3 w-3" />
                          {formatDisplayDate(task.due_date)}
                        </button>
                        {openDropdown === `date-${task.id}` && (
                          <div className="absolute left-0 top-full z-10 mt-1 rounded-lg border border-[#333] bg-[#1a1a1a] p-2 shadow-xl">
                            <input
                              type="date"
                              defaultValue={task.due_date?.split("T")[0] || ""}
                              onChange={(e) => updateTaskField(task.id, "due_date", e.target.value || null)}
                              className="rounded-lg border border-[#333] bg-[#0f0f0f] px-2 py-1 text-sm text-white"
                            />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="p-3">
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdown(openDropdown === `priority-${task.id}` ? null : `priority-${task.id}`);
                          }}
                          className={clsx(
                            "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                            priority.color
                          )}
                        >
                          {priority.label}
                        </button>
                        {openDropdown === `priority-${task.id}` && (
                          <div className="absolute left-0 top-full z-10 mt-1 w-24 rounded-lg border border-[#333] bg-[#1a1a1a] py-1 shadow-xl">
                            {PRIORITIES.map((p) => (
                              <button
                                key={p.value}
                                onClick={() => updateTaskField(task.id, "priority", p.value)}
                                className="w-full px-3 py-1.5 text-left text-xs text-[#a1a1aa] transition-colors hover:bg-[#252525] hover:text-white"
                              >
                                {p.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(task)}
                          className="rounded p-1.5 text-[#666] transition-colors hover:bg-[#252525] hover:text-white"
                          title="Edit"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          disabled={updatingTaskId === task.id}
                          className="rounded p-1.5 text-[#666] transition-colors hover:bg-red-500/20 hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Mobile Cards */}
          <div className="divide-y divide-[#1a1a1a] sm:hidden">
            {tasks.map((task) => {
              const isCompleted = task.status === "completed";
              const taskOverdue = !isCompleted && isOverdue(task.due_date);
              const priority = PRIORITIES.find((p) => p.value === task.priority) || PRIORITIES[1];
              const statusOption = STATUS_OPTIONS.find((s) => s.value === task.status) || STATUS_OPTIONS[0];

              return (
                <div
                  key={task.id}
                  className={clsx(
                    "bg-[#1a1a1a] p-4",
                    isCompleted && "opacity-50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Status Button - Cycles through statuses */}
                    <button
                      onClick={() => cycleStatus(task)}
                      disabled={updatingTaskId === task.id}
                      className={clsx(
                        "mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border",
                        statusOption.color
                      )}
                    >
                      {updatingTaskId === task.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : isCompleted ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : task.status === "in_review" ? (
                        <AlertTriangle className="h-3 w-3" />
                      ) : (
                        <Circle className="h-3 w-3" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={clsx(
                            "font-medium",
                            isCompleted ? "line-through text-[#666]" : "text-white"
                          )}
                        >
                          {task.title}
                        </span>
                        {task.sop_content && (
                          <button
                            onClick={() => openSOPViewer(task)}
                            className="text-indigo-400"
                          >
                            <Book className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {/* Status Badge */}
                        <span
                          className={clsx(
                            "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                            statusOption.color
                          )}
                        >
                          {statusOption.label}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-[#a1a1aa]">
                          <User className="h-3 w-3" />
                          {task.assigned_to || "Unassigned"}
                        </span>
                        <span
                          className={clsx(
                            "flex items-center gap-1 text-xs",
                            taskOverdue ? "text-red-400" : "text-[#a1a1aa]"
                          )}
                        >
                          <Calendar className="h-3 w-3" />
                          {formatDisplayDate(task.due_date)}
                        </span>
                        <span
                          className={clsx(
                            "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                            priority.color
                          )}
                        >
                          {priority.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditModal(task)}
                        className="rounded p-1.5 text-[#666]"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="rounded p-1.5 text-[#666]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add/Edit Task Modal */}
      {showTaskModal && (
        <TaskModalContent
          task={editingTask as Task}
          isNew={!editingTask}
          onClose={() => {
            setShowTaskModal(false);
            resetForm();
          }}
          onSave={handleSaveTask}
          isSaving={isSaving}
          formTitle={formTitle}
          setFormTitle={setFormTitle}
          formDueDate={formDueDate}
          setFormDueDate={setFormDueDate}
          formAssignee={formAssignee}
          setFormAssignee={setFormAssignee}
          formPriority={formPriority}
          setFormPriority={setFormPriority}
          formSOP={formSOP}
          setFormSOP={setFormSOP}
          tasks={tasks}
        />
      )}


      {/* SOP Viewer Modal */}
      {showSOPModal && selectedSOP && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-t-2xl border border-[#1a1a1a] bg-[#0f0f0f] shadow-2xl sm:rounded-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#1a1a1a] bg-indigo-500/10 px-4 py-3 sm:px-6 sm:py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/20">
                  <Book className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white sm:text-lg">
                    Standard Operating Procedure
                  </h2>
                  <p className="text-xs text-[#a1a1aa]">{selectedSOP.title}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowSOPModal(false);
                  setSelectedSOP(null);
                }}
                className="rounded-lg p-2 text-[#666] transition-colors hover:bg-[#1a1a1a] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-6">
              <div className="prose prose-invert max-w-none">
                <pre className="whitespace-pre-wrap rounded-lg bg-[#0a0a0a] p-4 text-sm text-[#e0e0e0]">
                  {selectedSOP.content}
                </pre>
              </div>

              {/* If it looks like a URL, show a link */}
              {selectedSOP.content.match(/^https?:\/\//) && (
                <a
                  href={selectedSOP.content.split("\n")[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-600"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Link
                </a>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-[#1a1a1a] bg-[#0a0a0a] px-4 py-3 sm:px-6 sm:py-4">
              <button
                onClick={() => {
                  setShowSOPModal(false);
                  setSelectedSOP(null);
                }}
                className="w-full rounded-lg border border-[#333] bg-[#1a1a1a] px-4 py-2.5 font-medium text-white transition-colors hover:bg-[#252525]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

