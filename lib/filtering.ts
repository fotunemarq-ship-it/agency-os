import { FilterConfig, SortConfig } from "@/types/view";

/**
 * Applies filters to a Supabase query builder.
 * @param query The Supabase query builder (table or view)
 * @param filters The filter configuration object
 * @returns The modified query builder
 */
export function applyFilters(query: any, filters: FilterConfig) {
    if (!filters) return query;

    // Status Filter (Array)
    if (filters.status && filters.status.length > 0) {
        query = query.in("status", filters.status);
    }

    // Lead Type Filter
    if (filters.lead_type) {
        query = query.eq("lead_type", filters.lead_type);
    }

    // Industry Filter
    if (filters.industry && filters.industry.length > 0) {
        query = query.in("industry", filters.industry);
    }

    // City Filter
    if (filters.city && filters.city.length > 0) {
        query = query.in("city", filters.city);
    }

    // Generic Search (Text) - tries to match common fields
    if (filters.search) {
        // This is a simplified search. Ideally, precise fields should be targeted.
        // For leads:
        query = query.or(`company_name.ilike.%${filters.search}%,contact_person.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
    }

    // Date Range
    if (filters.date_range && filters.date_range.field) {
        if (filters.date_range.start) {
            query = query.gte(filters.date_range.field, filters.date_range.start);
        }
        if (filters.date_range.end) {
            // Add time to end date to include the full day
            const endDate = new Date(filters.date_range.end);
            endDate.setHours(23, 59, 59, 999);
            query = query.lte(filters.date_range.field, endDate.toISOString());
        }
    }

    // Boolean flags
    if (filters.has_website === true) {
        query = query.not("email", "is", null); // Assuming email is proxy for website/contactability
    } else if (filters.has_website === false) {
        query = query.is("email", null);
    }

    // Assigned To
    if (filters.assigned_to) {
        query = query.eq("assigned_sales_exec", filters.assigned_to);
    }

    if (filters.strategist_id) {
        query = query.eq("assigned_strategist", filters.strategist_id);
    }

    // Score Range (Leads) - requires score to be a column or joined
    // Skip for now as score is computed on fly mostly, unless persisted.

    return query;
}

/**
 * Applies sorting to a Supabase query builder.
 */
export function applySort(query: any, sort: SortConfig) {
    if (!sort || !sort.field) return query; // Default handled by caller

    return query.order(sort.field, {
        ascending: sort.direction === "asc",
        nullsFirst: false,
    });
}

/**
 * Applies pagination to a Supabase query builder.
 */
export function applyPagination(query: any, page: number, pageSize: number) {
    const from = page * pageSize;
    const to = from + pageSize - 1;
    return query.range(from, to);
}
