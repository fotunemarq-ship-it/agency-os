import { createServerClientWithCookies } from "@/lib/supabase-server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import ProjectsList from "@/components/lists/ProjectsList";

export default async function ProjectsListPage() {
    const supabase = await createServerClientWithCookies();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return <div>Unauthorized</div>;

    return (
        <div className="min-h-screen bg-[#0f0f0f] px-4 py-6">
            <div className="mx-auto max-w-7xl">
                <div className="mb-6">
                    <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-[#a1a1aa] hover:text-[#42CA80] mb-4">
                        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                    </Link>
                    <h1 className="text-2xl font-bold text-white">All Projects</h1>
                    <p className="text-sm text-[#a1a1aa]">List view with bulk actions.</p>
                </div>
                <ProjectsList userId={user.id} />
            </div>
        </div>
    );
}
