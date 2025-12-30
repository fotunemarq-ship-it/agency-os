-- Automation Rules
create table if not exists automation_rules (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  entity_type text not null, -- 'lead'|'deal'|'project'|'task'
  trigger text not null,
  is_enabled boolean default true,
  priority int default 100,
  conditions jsonb not null default '{}',
  actions jsonb not null default '[]',
  throttle_minutes int default 0,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_auto_rules_trigger on automation_rules(entity_type, trigger, is_enabled, priority);

-- Automation Runs (Logs)
create table if not exists automation_runs (
  id uuid default gen_random_uuid() primary key,
  rule_id uuid references automation_rules(id),
  entity_type text not null,
  entity_id uuid not null,
  trigger text not null,
  status text not null, -- 'skipped'|'success'|'failed'
  reason text,
  input_snapshot jsonb default '{}',
  actions_executed jsonb default '[]',
  created_at timestamptz default now()
);
create index if not exists idx_auto_runs_rule on automation_runs(rule_id, created_at desc);
create index if not exists idx_auto_runs_entity on automation_runs(entity_type, entity_id, created_at desc);

-- Automation Throttle
create table if not exists automation_throttle (
  id uuid default gen_random_uuid() primary key,
  rule_id uuid not null references automation_rules(id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  last_ran_at timestamptz not null default now(),
  unique(rule_id, entity_type, entity_id)
);

-- SLA Policies
create table if not exists sla_policies (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  entity_type text not null default 'lead',
  lead_type text, -- 'inbound'|'outbound'|null
  condition jsonb default '{}',
  contact_within_minutes int,
  followup_missed_minutes int,
  is_enabled boolean default true,
  created_at timestamptz default now()
);

-- Notifications
create table if not exists notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  body text,
  entity_type text,
  entity_id uuid,
  is_read boolean default false,
  created_at timestamptz default now()
);
create index if not exists idx_notifications_user on notifications(user_id, is_read, created_at desc);

-- Round Robin Assignment
create table if not exists assignment_pools (
  id uuid default gen_random_uuid() primary key,
  pool_name text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  is_active boolean default true,
  weight int default 1,
  created_at timestamptz default now(),
  unique(pool_name, user_id)
);

create table if not exists assignment_state (
  pool_name text primary key,
  last_user_id uuid,
  updated_at timestamptz default now()
);

-- RLS
alter table automation_rules enable row level security;
alter table automation_runs enable row level security;
alter table automation_throttle enable row level security;
alter table sla_policies enable row level security;
alter table notifications enable row level security;
alter table assignment_pools enable row level security;
alter table assignment_state enable row level security;

-- Admin policies
create policy "Admins manage rules" on automation_rules for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Read rules for engine" on automation_rules for select using (true);

create policy "Admins manage runs" on automation_runs for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Engine inserts runs" on automation_runs for insert with check (true);

create policy "Admins manage throttle" on automation_throttle for all using (true); -- simplified for engine usage

create policy "Admins manage sla" on sla_policies for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Read sla" on sla_policies for select using (true);

-- Notification policies
create policy "Users read own notifications" on notifications for select using (
  auth.uid() = user_id or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Users update own notifications" on notifications for update using (
  auth.uid() = user_id
) with check ( auth.uid() = user_id );
create policy "Engine inserts notifications" on notifications for insert with check (true); -- allow system inserts

-- Assignment policies
create policy "Admins manage pools" on assignment_pools for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Read pools" on assignment_pools for select using (true);
create policy "Manage assignment state" on assignment_state for all using (true);

-- Seed Default Rules
insert into automation_rules (name, entity_type, trigger, actions, conditions, priority)
values 
('Auto-Assign Inbound', 'lead', 'lead_created', 
 '[{"type":"assign_owner","value":"round_robin:sales"}, {"type":"set_status","value":"calling"}, {"type":"notify_owner","value":{}}, {"type":"set_next_action_date","value":{"preset":"now_plus_10min"}}]',
 '{"all":[{"field":"lead_type","op":"eq","value":"inbound"}]}',
 10
),
('Inbound SLA Check', 'lead', 'lead_sla_missed',
 '[{"type":"mark_stale","value":{"reason":"Inbound SLA Missed"}}, {"type":"notify_admin","value":{"message":"Inbound SLA missed"}}, {"type":"add_tag","value":"sla_missed"}]',
 '{"all":[{"field":"lead_type","op":"eq","value":"inbound"}]}',
 10
),
('Outbound Setup', 'lead', 'lead_created',
 '[{"type":"assign_owner","value":"round_robin:sales"}, {"type":"set_next_action_date","value":{"preset":"today_6pm"}}]',
 '{"all":[{"field":"lead_type","op":"eq","value":"outbound"}]}',
 20
),
('Follow-up Reminder', 'lead', 'lead_followup_due',
 '[{"type":"notify_owner","value":{"message":"Follow-up is due now"}}, {"type":"add_tag","value":"followup_due"}]',
 '{}',
 50
);
