-- Create Activity Events Table
create table if not exists activity_events (
  id uuid default gen_random_uuid() primary key,
  entity_type text not null,
  entity_id uuid not null,
  event_type text not null,
  title text not null,
  body text,
  metadata jsonb default '{}'::jsonb,
  created_by uuid references profiles(id), -- Changed to profiles for easier joining
  created_at timestamptz default now()
);

-- Indexes for Activity Events
create index if not exists idx_activity_events_entity on activity_events(entity_type, entity_id, created_at desc);
create index if not exists idx_activity_events_created_by on activity_events(created_by, created_at desc);

-- Create Audit Logs Table
create table if not exists audit_logs (
  id uuid default gen_random_uuid() primary key,
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  actor_id uuid references profiles(id), -- Changed to profiles for consistency
  before_data jsonb,
  after_data jsonb,
  request_id text,
  ip_address text,
  user_agent text,
  created_at timestamptz default now()
);

-- Indexes for Audit Logs
create index if not exists idx_audit_logs_entity on audit_logs(entity_type, entity_id, created_at desc);
create index if not exists idx_audit_logs_actor on audit_logs(actor_id, created_at desc);

-- Enable RLS
alter table activity_events enable row level security;
alter table audit_logs enable row level security;

-- Activity Events Policies

-- Admin can read all activity
create policy "Admin can read all activity"
  on activity_events for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Authenticated users can read activity
create policy "Authenticated users can read activity"
  on activity_events for select
  using (
    auth.role() = 'authenticated'
  );

-- Users can insert their own activity
create policy "Users can insert their own activity"
  on activity_events for insert
  with check (
    auth.uid() = created_by
  );

-- Audit Logs Policies

-- Admin can read all logs
create policy "Admin can read all audit logs"
  on audit_logs for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Users can insert their own audit logs
create policy "Users can insert their own audit logs"
  on audit_logs for insert
  with check (
    auth.uid() = actor_id
  );
