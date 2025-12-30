export type EntityType = 'lead' | 'deal' | 'project' | 'task';

export type Visibility = 'private' | 'role' | 'global';

export type RoleScope = 'admin' | 'sales' | 'strategist' | 'pm' | 'staff' | 'client';

export interface FilterConfig {
    [key: string]: any;
    status?: string[];
    date_range?: { start: string; end: string; field: string };
    search?: string;
}

export interface SortConfig {
    field: string;
    direction: 'asc' | 'desc';
}

export interface ColumnConfig {
    visible: string[];
    order: string[];
}

export interface SavedView {
    id: string;
    name: string;
    entity_type: EntityType;
    owner_id: string | null;
    visibility: Visibility;
    role_scope?: RoleScope | null;
    filters: FilterConfig;
    sort: SortConfig;
    columns?: ColumnConfig;
    is_default: boolean;
    created_at?: string;
    updated_at?: string;
}
