import { createServerClient } from "@/lib/supabase";
import PMDashboard from "@/components/projects/pm-dashboard";

export default async function ProjectsPage() {
  const supabase = createServerClient();

  // Fetch all projects with client relationship
  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select(`
      *,
      clients (
        id,
        business_name,
        primary_email
      )
    `)
    .order("deadline", { ascending: true, nullsFirst: false });

  // Fetch all tasks
  const { data: tasks, error: tasksError } = await supabase
    .from("tasks")
    .select("*")
    .order("due_date", { ascending: true, nullsFirst: false });

  // If projects don't have client_id, try to get it from deals
  const projectsWithoutClients = projects?.filter((p: any) => !p.client_id && p.deal_id) || [];
  let dealsMap = new Map();
  
  if (projectsWithoutClients.length > 0) {
    const dealIds = projectsWithoutClients.map((p: any) => p.deal_id);
    const { data: deals } = await supabase
      .from("deals")
      .select("id, client_id")
      .in("id", dealIds);
    
    if (deals) {
      deals.forEach((deal: any) => {
        if (deal.client_id) {
          dealsMap.set(deal.id, deal.client_id);
        }
      });
    }
  }

  // Fetch clients for deals that have client_id
  const clientIdsFromDeals = Array.from(dealsMap.values());
  let clientsFromDealsMap = new Map();
  
  if (clientIdsFromDeals.length > 0) {
    const { data: clientsFromDeals } = await supabase
      .from("clients")
      .select("id, business_name, primary_email")
      .in("id", clientIdsFromDeals);
    
    if (clientsFromDeals) {
      clientsFromDeals.forEach((client: any) => {
        clientsFromDealsMap.set(client.id, client);
      });
    }
  }

  if (projectsError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-4">
        <div className="text-center">
          <p className="text-red-500">Error loading projects: {projectsError.message}</p>
          <p className="mt-2 text-sm text-[#a1a1aa]">
            Debug: Check if projects table exists and has data.
          </p>
        </div>
      </div>
    );
  }

  // Enrich projects with clients from deals if needed
  const enrichedProjects = (projects || []).map((project: any) => {
    let client = project.clients;
    
    if (!client && project.deal_id) {
      const clientIdFromDeal = dealsMap.get(project.deal_id);
      if (clientIdFromDeal) {
        client = clientsFromDealsMap.get(clientIdFromDeal) || null;
      }
    }
    
    return {
      ...project,
      clients: client,
    };
  });

  return (
    <div className="min-h-screen bg-[#0f0f0f] px-4 py-6">
      <div className="mx-auto max-w-7xl">
        {/* Info banner for orphaned projects */}
        {projects && projects.some((p: any) => !p.client_id && !p.deal_id) && (
          <div className="mb-4 rounded-lg border border-yellow-600/50 bg-yellow-900/20 p-4 text-sm sm:mb-6">
            <p className="font-semibold text-yellow-400">⚠️ Some projects are missing client/deal links</p>
            <p className="mt-1 text-yellow-300">
              These projects were created before a bug fix. Delete them in Supabase and re-close the deals.
            </p>
          </div>
        )}

        <PMDashboard 
          projects={enrichedProjects} 
          tasks={tasks || []} 
        />
      </div>
    </div>
  );
}
