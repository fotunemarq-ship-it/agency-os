-- Task Checklists
create table if not exists task_checklist_items (
  id uuid default gen_random_uuid() primary key,
  task_id uuid not null references tasks(id) on delete cascade,
  title text not null,
  is_done boolean default false,
  sort_order int default 0,
  completed_by uuid references auth.users(id),
  completed_at timestamptz,
  created_at timestamptz default now()
);
create index if not exists idx_checklist_task on task_checklist_items(task_id, sort_order);

-- Task Dependencies
create table if not exists task_dependencies (
  id uuid default gen_random_uuid() primary key,
  task_id uuid not null references tasks(id) on delete cascade,
  depends_on_task_id uuid not null references tasks(id) on delete cascade,
  dependency_type text not null default 'blocks', -- blocks | relates
  created_at timestamptz default now(),
  unique(task_id, depends_on_task_id)
);
create index if not exists idx_deps_task on task_dependencies(task_id);
create index if not exists idx_deps_depends on task_dependencies(depends_on_task_id);

-- Milestone Approvals
create table if not exists milestone_approvals (
  id uuid default gen_random_uuid() primary key,
  milestone_id uuid not null references project_milestones(id) on delete cascade,
  requested_by uuid references auth.users(id),
  requested_at timestamptz default now(),
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  status text not null default 'pending', -- pending|approved|rejected
  feedback text,
  created_at timestamptz default now()
);
create index if not exists idx_milestone_approvals on milestone_approvals(milestone_id, requested_at desc);

-- Change Requests
create table if not exists change_requests (
  id uuid default gen_random_uuid() primary key,
  project_id uuid not null references projects(id) on delete cascade,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  title text not null,
  description text not null,
  priority text default 'medium',
  impact_timeline_days int,
  impact_cost numeric,
  status text not null default 'requested', -- requested|reviewing|approved|rejected|implemented
  decision_by uuid references auth.users(id),
  decision_at timestamptz,
  decision_note text
);
create index if not exists idx_cr_project on change_requests(project_id, created_at desc);

-- Deliverables
create table if not exists deliverables (
  id uuid default gen_random_uuid() primary key,
  project_id uuid not null references projects(id) on delete cascade,
  milestone_id uuid references project_milestones(id),
  uploaded_by uuid references auth.users(id),
  created_at timestamptz default now(),
  type text not null, -- 'file'|'link'|'note'
  title text not null,
  url text,
  storage_path text,
  version text,
  description text
);
create index if not exists idx_deliverables_project on deliverables(project_id, created_at desc);

-- RLS Policies

-- Checklist
alter table task_checklist_items enable row level security;
create policy "Users manage checklist for visible tasks" on task_checklist_items
  for all using (
    exists (
       select 1 from tasks t
       join projects p on t.project_id = p.id
       where t.id = task_checklist_items.task_id
       -- Simplify: If user can access project (or is admin)
       -- Assuming users have project access logic or simple open access for staff
       and (auth.uid() is not null) 
    )
  );

-- Dependencies
alter table task_dependencies enable row level security;
create policy "Users view dependencies" on task_dependencies for select using (true);
create policy "Staff manage dependencies" on task_dependencies for all using (
    exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'strategist', 'sales'))
);

-- Milestone Approvals
alter table milestone_approvals enable row level security;
create policy "Users view milestone approvals" on milestone_approvals for select using (true);
create policy "Users manage milestone approvals" on milestone_approvals for all using (auth.uid() is not null);

-- Change Requests
alter table change_requests enable row level security;
create policy "Users view change requests" on change_requests for select using (true);
create policy "Users manage change requests" on change_requests for all using (auth.uid() is not null);

-- Deliverables
alter table deliverables enable row level security;
create policy "Users view deliverables" on deliverables for select using (true);
create policy "Users manage deliverables" on deliverables for all using (auth.uid() is not null);
