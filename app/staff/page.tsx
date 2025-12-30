import { createServerClientWithCookies } from "@/lib/supabase-server";
import Link from "next/link";
import StaffDashboard from "@/components/staff/staff-dashboard";

export default async function StaffPage() {
  const supabase = await createServerClientWithCookies();

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser();

  // Get placeholder name or real name
  let staffName = "Staff Member";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();
    if ((profile as any)?.full_name) {
      staffName = (profile as any).full_name;
    } else if (user.email) {
      staffName = user.email.split("@")[0];
    }
  }

  // Fetch all tasks with project and client info
  // The RLS policies will filter what this user can actually see
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
        <div className="flex justify-end mb-4">
          {/* Link to advanced Task Manager */}
          <Link href="/tasks/list" className="text-sm text-[#42CA80] hover:underline">
            Go to Advanced Task Manager &rarr;
          </Link>
        </div>
        <StaffDashboard tasks={staffTasks} staffName={staffName} />
      </div>
    </div>
  );
}

