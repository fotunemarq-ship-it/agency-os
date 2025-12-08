import { createServerClient } from "@/lib/supabase";
import TaskBoard from "@/components/tasks/task-board";
import Link from "next/link";
import { ArrowLeft, ListTodo } from "lucide-react";

export default async function TasksPage() {
  const supabase = createServerClient();

  // Fetch all tasks with project and client information
  const { data: tasks, error } = await supabase
    .from("tasks")
    .select(`
      *,
      projects (
        service_type,
        clients (
          business_name
        )
      )
    `)
    .order("due_date", { ascending: true, nullsFirst: false });

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-4">
        <div className="text-center">
          <p className="text-red-500">Error loading tasks: {error.message}</p>
          <Link
            href="/"
            className="mt-4 inline-block text-[#42CA80] hover:underline"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] px-4 py-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#a1a1aa] transition-colors hover:text-[#42CA80]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
          
          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#42CA80]/10">
              <ListTodo className="h-5 w-5 text-[#42CA80]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Task Board</h1>
              <p className="text-sm text-[#a1a1aa]">
                Manage and track all project tasks
              </p>
            </div>
          </div>
        </div>

        {/* Task Board */}
        <TaskBoard initialTasks={tasks || []} />
      </div>
    </div>
  );
}



