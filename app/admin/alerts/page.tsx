import { createServerClient } from "@/lib/supabase";
import AlertsManager from "@/components/admin/alerts-manager";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function AdminAlertsPage() {
    const supabase = createServerClient();

    const { data: alerts } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

    return (
        <div className="min-h-screen bg-[#0f0f0f] px-4 py-8">
            <div className="mx-auto max-w-5xl">
                <div className="mb-6">
                    <Link href="/admin" className="text-[#a1a1aa] hover:text-white flex items-center gap-2 mb-4 text-sm transition-colors">
                        <ArrowLeft className="h-4 w-4" /> Back to Command Hub
                    </Link>
                    <h1 className="text-2xl font-bold text-white">System Alerts</h1>
                    <p className="text-[#666]">Monitor and resolve system anomalies and SLA breaches.</p>
                </div>

                <AlertsManager initialAlerts={alerts || []} />
            </div>
        </div>
    );
}
