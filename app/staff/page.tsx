import { createServerClient } from "@/lib/supabase";
import StaffDashboard from "@/components/staff/staff-dashboard";

// For development, use a placeholder staff name
// In production, this would come from auth and filter by user ID
const STAFF_NAME = "Sarah";

export default async function StaffPage() {
  const supabase = createServerClient();

  // Fetch all tasks with project and client info
  // In production, filter by authenticated user's ID
  // For now, fetch all tasks and show them (assigned_to is a text field with names)
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
        </div>
      </div>
    );
  }

  // Filter tasks assigned to staff member (or show all if assigned_to matches or is null)
  // This handles both UUID and text-based assigned_to fields
  const staffTasks = tasks?.filter((task: any) => {
    // Show all tasks for development - in production, filter by user
    return true;
  }) || [];

  return (
    <div className="min-h-screen bg-[#0f0f0f] px-4 py-6">
      <div className="mx-auto max-w-6xl">
        <StaffDashboard tasks={staffTasks} staffName={STAFF_NAME} />
      </div>
    </div>
  );
}

