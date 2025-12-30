import { createServerClientWithCookies } from "@/lib/supabase-server";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function UploadDebugPage() {
  const supabase = await createServerClientWithCookies();

  // Get current user
  const { data: userData } = await supabase.auth.getUser();

  // Check if csv_uploads table exists
  const { data: uploads, error: uploadsError } = await supabase
    .from("csv_uploads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  // Check recent leads
  const { data: recentLeads, error: leadsError } = await supabase
    .from("leads")
    .select("id, company_name, lead_type, industry, city, created_at, import_batch_id")
    .order("created_at", { ascending: false })
    .limit(10);

  // Determine RLS status based on whether we can read leads
  const canReadLeads = !leadsError;

  return (
    <div className="min-h-screen bg-[#0f0f0f] px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/admin/upload"
          className="mb-4 inline-flex items-center gap-2 text-sm text-[#a1a1aa] transition-colors hover:text-[#42CA80]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Upload
        </Link>

        <h1 className="mb-6 text-2xl font-bold text-white">Upload Debug Info</h1>

        {/* User Info */}
        <div className="mb-6 rounded-lg border border-[#1a1a1a] bg-[#1a1a1a] p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Current User</h2>
          {userData?.user ? (
            <div>
              <p className="text-green-400 mb-2">✓ Authenticated</p>
              <div className="text-sm text-[#a1a1aa] space-y-1">
                <p>Email: {userData.user.email}</p>
                <p>User ID: {userData.user.id}</p>
              </div>
            </div>
          ) : (
            <p className="text-yellow-400">⚠ Not authenticated (server-side session not detected)</p>
          )}
        </div>

        {/* RLS Check */}
        <div className="mb-6 rounded-lg border border-[#1a1a1a] bg-[#1a1a1a] p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Row Level Security (RLS)</h2>
          {canReadLeads ? (
            <div>
              <p className="text-green-400">✓ Can read leads table</p>
              <p className="mt-2 text-sm text-[#a1a1aa]">
                If uploads fail, run this SQL in Supabase:
              </p>
              <pre className="mt-2 rounded bg-[#0f0f0f] p-3 text-xs text-[#a1a1aa] overflow-x-auto">
{`-- Fix RLS policies for leads and csv_uploads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for leads" ON public.leads;
CREATE POLICY "Enable all for leads" ON public.leads
    FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.csv_uploads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for csv_uploads" ON public.csv_uploads;
CREATE POLICY "Enable all for csv_uploads" ON public.csv_uploads
    FOR ALL USING (true) WITH CHECK (true);`}
              </pre>
            </div>
          ) : (
            <div className="rounded-lg bg-red-500/10 border border-red-500/50 p-4">
              <p className="text-red-400 font-medium">✗ Cannot read leads</p>
              <p className="mt-2 text-sm text-red-300">Error: {leadsError?.message}</p>
            </div>
          )}
        </div>

        {/* CSV Uploads Table Status */}
        <div className="mb-6 rounded-lg border border-[#1a1a1a] bg-[#1a1a1a] p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">CSV Uploads Table</h2>
          {uploadsError ? (
            <div className="rounded-lg bg-red-500/10 border border-red-500/50 p-4">
              <p className="text-red-400 font-medium">Error: {uploadsError.message}</p>
              <p className="mt-2 text-sm text-red-300">
                The csv_uploads table may not exist. Run this migration:
              </p>
              <code className="mt-2 block rounded bg-[#0f0f0f] p-2 text-xs text-[#a1a1aa]">
                supabase/migrations/create_csv_uploads_table.sql
              </code>
            </div>
          ) : (
            <div>
              <p className="text-green-400 mb-2">✓ Table exists</p>
              <p className="text-sm text-[#a1a1aa]">
                Found {uploads?.length || 0} upload(s) in history
              </p>
              {uploads && uploads.length > 0 && (
                <div className="mt-4 space-y-2">
                  {uploads.map((upload: any) => (
                    <div key={upload.id} className="rounded bg-[#0f0f0f] p-3 text-sm">
                      <p className="text-white">{upload.filename}</p>
                      <p className="text-[#a1a1aa]">
                        {upload.leads_count} leads • {upload.lead_type} • {new Date(upload.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recent Leads */}
        <div className="rounded-lg border border-[#1a1a1a] bg-[#1a1a1a] p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Recent Leads</h2>
          {leadsError ? (
            <div className="rounded-lg bg-red-500/10 border border-red-500/50 p-4">
              <p className="text-red-400">Error: {leadsError.message}</p>
            </div>
          ) : (
            <div>
              <p className="text-green-400 mb-2">✓ Leads table accessible</p>
              <p className="text-sm text-[#a1a1aa] mb-4">
                Showing {recentLeads?.length || 0} most recent leads
              </p>
              {recentLeads && recentLeads.length > 0 ? (
                <div className="space-y-2">
                  {recentLeads.map((lead: any) => (
                    <div key={lead.id} className="rounded bg-[#0f0f0f] p-3 text-sm">
                      <p className="text-white font-medium">{lead.company_name || "Unknown"}</p>
                      <div className="mt-1 flex gap-4 text-xs text-[#a1a1aa]">
                        <span>Type: {lead.lead_type || "outbound"}</span>
                        <span>Industry: {lead.industry || "N/A"}</span>
                        <span>City: {lead.city || "N/A"}</span>
                        <span>{new Date(lead.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#a1a1aa]">No leads found</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
