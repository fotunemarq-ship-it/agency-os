import { createServerClient } from "@/lib/supabase";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import LeadsList from "@/components/lists/LeadsList";

export default async function AdminLeadsPage() {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return <div>Unauthorized</div>;
    }

    return (
        <div className="min-h-screen bg-[#0f0f0f] px-4 py-6">
            <div className="mx-auto max-w-7xl">
                <div className="mb-6">
                    <Link
                        href="/admin/sales"
                        className="inline-flex items-center gap-2 text-sm text-[#a1a1aa] transition-colors hover:text-[#42CA80] mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Sales Dashboard
                    </Link>
                    <h1 className="text-2xl font-bold text-white">Leads Management</h1>
                    <p className="text-sm text-[#a1a1aa]">Manage all leads, create saved views, and perform bulk actions.</p>
                </div>

                <LeadsList userId={user.id} />
            </div>
        </div>
    );
}
