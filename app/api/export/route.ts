import { createServerClient } from "@/lib/supabase";
import { type NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import { applyFilters, applySort } from "@/lib/filtering";

export async function POST(req: NextRequest) {
    try {
        const supabase = createServerClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { entityType, filters, sort, columns } = body;

        let tableName = "";
        switch (entityType) {
            case "lead":
                tableName = "leads";
                break;
            case "deal":
                tableName = "deals";
                break;
            case "project":
                tableName = "projects";
                break;
            case "task":
                tableName = "tasks";
                break;
            default:
                return new NextResponse("Invalid entity type", { status: 400 });
        }

        // Build Query
        let query = supabase.from(tableName).select("*");
        query = applyFilters(query, filters);
        query = applySort(query, sort);

        // Default limit for export to prevent timeouts
        query = query.limit(5000);

        const { data, error } = await query;

        if (error) {
            console.error("Export error", error);
            return new NextResponse("Database error", { status: 500 });
        }

        if (!data || data.length === 0) {
            return new NextResponse("No data to export", { status: 404 });
        }

        // Convert to CSV
        // If columns config is present, mapped specific fields? For now, dump all or standard fields.
        const csv = Papa.unparse(data);

        return new NextResponse(csv, {
            status: 200,
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename="${entityType}s_export_${new Date().toISOString().split("T")[0]}.csv"`,
            },
        });
    } catch (err) {
        console.error("Export handler error", err);
        return new NextResponse("Server Error", { status: 500 });
    }
}
