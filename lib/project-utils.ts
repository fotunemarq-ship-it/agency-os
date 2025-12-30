import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type ServiceType =
  | "web_dev"
  | "local_seo"
  | "seo"
  | "performance_marketing"
  | "social_media"
  | "whatsapp_marketing";

/**
 * Generates project tasks based on task templates for a given service type
 * @param supabaseClient - Supabase client instance
 * @param projectId - The ID of the newly created project
 * @param serviceType - The service type to match against task templates
 * @param startDate - Project start date (ISO string or Date) to calculate due dates
 */
export async function generateProjectTasks(
  supabaseClient: SupabaseClient<Database>,
  projectId: string,
  serviceType: ServiceType,
  startDate: string | Date
): Promise<void> {
  try {
    // Parse start date
    const projectStartDate = typeof startDate === "string" 
      ? new Date(startDate) 
      : startDate;

    // Fetch task templates for this service type
    const { data: templates, error: templatesError } = await supabaseClient
      .from("task_templates")
      .select("*")
      .eq("service_type", serviceType);

    if (templatesError) {
      // If task_templates table doesn't exist or RLS blocks it, gracefully skip
      if (templatesError.message?.includes("row-level security policy")) {
        console.warn("task_templates table RLS policy blocking read:", templatesError);
      } else {
        console.warn("task_templates table may not exist:", templatesError);
      }
      return;
    }

    if (!templates || templates.length === 0) {
      console.log(`No task templates found for service type: ${serviceType}`);
      return;
    }

    // Create tasks from templates
    const tasksToInsert = templates.map((template: any) => {
      // Calculate due date by adding offset_days to start date
      const dueDate = new Date(projectStartDate);
      dueDate.setDate(dueDate.getDate() + (template.offset_days || 0));

      return {
        project_id: projectId,
        title: template.name || template.title || "Untitled Task",
        status: "not_started",
        assigned_to: null,
        due_date: dueDate.toISOString().split("T")[0], // YYYY-MM-DD format
        created_at: new Date().toISOString(),
      };
    });

    // Insert all tasks
    const tasksInsertQuery = (supabaseClient.from("tasks") as any).insert(tasksToInsert);
    const { error: tasksError } = await tasksInsertQuery;

    if (tasksError) {
      // If tasks table doesn't exist or RLS blocks it, gracefully skip
      if (tasksError.message?.includes("row-level security policy")) {
        console.warn("tasks table RLS policy blocking insert:", tasksError);
      } else {
        console.warn("tasks table may not exist:", tasksError);
      }
      return;
    }

    console.log(`Successfully generated ${tasksToInsert.length} tasks for project ${projectId}`);
  } catch (error) {
    console.error("Error generating project tasks:", error);
    // Don't throw - we don't want to block project creation if task generation fails
  }
}

/**
 * Generates project milestones based on milestone templates for a given service type
 * @param supabaseClient - Supabase client instance
 * @param projectId - The ID of the newly created project
 * @param serviceType - The service type to match against milestone templates
 */
export async function generateProjectMilestones(
  supabaseClient: SupabaseClient<Database>,
  projectId: string,
  serviceType: ServiceType
): Promise<void> {
  try {
    // Fetch milestone templates for this service type
    const { data: templates, error: templatesError } = await supabaseClient
      .from("milestone_templates")
      .select("*")
      .eq("service_type", serviceType)
      .order("order_index", { ascending: true });

    if (templatesError) {
      // If milestone_templates table doesn't exist or RLS blocks it, gracefully skip
      if (templatesError.message?.includes("row-level security policy")) {
        console.warn("milestone_templates table RLS policy blocking read:", templatesError);
      } else {
        console.warn("milestone_templates table may not exist:", templatesError);
      }
      return;
    }

    if (!templates || templates.length === 0) {
      console.log(`No milestone templates found for service type: ${serviceType}`);
      return;
    }

    // Create milestones from templates
    const milestonesToInsert = templates.map((template: any, index: number) => ({
      project_id: projectId,
      name: template.name || "Untitled Milestone",
      status: "not_started",
      order_index: template.order_index ?? index + 1,
      created_at: new Date().toISOString(),
    }));

    // Insert all milestones
    const milestonesInsertQuery = (supabaseClient.from("project_milestones") as any).insert(milestonesToInsert);
    const { error: milestonesError } = await milestonesInsertQuery;

    if (milestonesError) {
      // If project_milestones table doesn't exist or RLS blocks it, gracefully skip
      if (milestonesError.message?.includes("row-level security policy")) {
        console.warn("project_milestones table RLS policy blocking insert:", milestonesError);
      } else {
        console.warn("project_milestones table may not exist:", milestonesError);
      }
      return;
    }

    console.log(`Successfully generated ${milestonesToInsert.length} milestones for project ${projectId}`);
  } catch (error) {
    console.error("Error generating project milestones:", error);
    // Don't throw - we don't want to block project creation if milestone generation fails
  }
}

