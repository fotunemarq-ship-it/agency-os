-- Create Saved Views Table
create table if not exists saved_views (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  entity_type text not null, -- 'lead', 'deal', 'project', 'task'
  owner_id uuid references auth.users(id), -- null for global views
  visibility text not null default 'private', -- 'private', 'role', 'global'
  role_scope text, -- 'admin', 'sales', 'strategist', 'pm', 'staff', 'client'
  filters jsonb not null default '{}'::jsonb,
  sort jsonb not null default '{}'::jsonb,
  columns jsonb not null default '{}'::jsonb,
  is_default boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for Saved Views
create index if not exists idx_saved_views_entity_owner on saved_views(entity_type, owner_id);
create index if not exists idx_saved_views_visibility on saved_views(entity_type, visibility, role_scope);

-- Create Entity Tags Table
create table if not exists entity_tags (
  id uuid default gen_random_uuid() primary key,
  entity_type text not null,
  entity_id uuid not null,
  tag text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  unique(entity_type, entity_id, tag)
);

-- Index for Entity Tags
create index if not exists idx_entity_tags_lookup on entity_tags(entity_type, tag);
create index if not exists idx_entity_tags_entity on entity_tags(entity_type, entity_id);

-- Trigger for updating timestamps
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language 'plpgsql';

create trigger update_saved_views_updated_at
    before update on saved_views
    for each row
    execute function update_updated_at_column();

-- Enable RLS
alter table saved_views enable row level security;
alter table entity_tags enable row level security;

-- Saved Views Policies

-- Read Policy
create policy "Users can read their own, global, or role-based views"
  on saved_views for select
  using (
    -- Own views
    owner_id = auth.uid()
    -- Global views
    or (visibility = 'global' and owner_id is null)
    -- Role-based views (simplified check against profiles)
    or (
      visibility = 'role' 
      and exists (
        select 1 from profiles 
        where profiles.id = auth.uid() 
        and profiles.role::text = role_scope
      )
    )
  );

-- Insert Policy
create policy "Users can create their own views, Admins can create global"
  on saved_views for insert
  with check (
    -- Private views
    (owner_id = auth.uid() and visibility = 'private')
    -- Admin creating global/role views
    or (
      exists (select 1 from profiles where id = auth.uid() and role = 'admin')
      and (
        (owner_id is null and visibility = 'global')
        or (visibility = 'role')
      )
    )
  );

-- Update Policy
create policy "Users can update their own views, Admins update global"
  on saved_views for update
  using (
    (owner_id = auth.uid())
    or (
      owner_id is null 
      and visibility = 'global' 
      and exists (select 1 from profiles where id = auth.uid() and role = 'admin')
    )
  );

-- Delete Policy
create policy "Users can delete their own views, Admins delete global"
  on saved_views for delete
  using (
    (owner_id = auth.uid())
    or (
      owner_id is null 
      and visibility = 'global' 
      and exists (select 1 from profiles where id = auth.uid() and role = 'admin')
    )
  );

-- Entity Tags Policies

-- Read Policy (Admin read all, others read related - simplified to all authenticated for now as per "allow for now")
create policy "Authenticated users can read tags"
  on entity_tags for select
  using (auth.role() = 'authenticated');

-- Insert/Delete Policy (Admin can manage all, others detailed control later)
create policy "Authenticated users can manage tags"
  on entity_tags for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
