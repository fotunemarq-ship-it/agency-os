-- Admin Command Center Tables

-- 1. admin_kpi_snapshots
create table if not exists admin_kpi_snapshots (
  id uuid default gen_random_uuid() primary key,
  day date not null default current_date,
  created_at timestamptz default now(),
  metrics jsonb not null,
  unique(day)
);

-- 2. alert_rules
create table if not exists alert_rules (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  type text not null, -- 'sales','strategy','delivery','sla','pipeline'
  condition jsonb not null, -- e.g. {"metric":"inbound_sla_missed_today","op":"gte","value":3}
  severity text default 'high', -- low|med|high
  is_enabled boolean default true,
  created_at timestamptz default now()
);

-- 3. alerts
create table if not exists alerts (
  id uuid default gen_random_uuid() primary key,
  rule_id uuid references alert_rules(id) on delete set null,
  severity text not null,
  title text not null,
  body text,
  entity_type text,
  entity_id uuid,
  status text default 'open', -- open|acknowledged|resolved
  created_at timestamptz default now(),
  acknowledged_by uuid references auth.users(id),
  acknowledged_at timestamptz,
  resolved_at timestamptz
);

create index if not exists idx_alerts_status_created on alerts(status, created_at desc);
create index if not exists idx_alerts_severity_created on alerts(severity, created_at desc);

-- Performance Indexes for KPIs
create index if not exists idx_leads_next_action_assigned on leads(next_action_date, assigned_to_id);
create index if not exists idx_lead_outcomes_actor_created on lead_outcomes(completed_by, created_at);
create index if not exists idx_tasks_due_status_assignee on tasks(due_date, status, assigned_to);
create index if not exists idx_milestones_status_updated on project_milestones(status, updated_at);
-- activity_events might already have indexes, but ensuring entity_type + created_at
create index if not exists idx_activity_events_created_entity on activity_events(created_at, entity_type);

-- RLS Policies
alter table admin_kpi_snapshots enable row level security;
alter table alert_rules enable row level security;
alter table alerts enable row level security;

-- Admin only access (Assuming admin check via email or metadata, using broad check for now as per previous patterns)
-- For now allowing auth users, but in real enterprise this should be restricted to admin role
create policy "Admins can manage kpi snapshots" on admin_kpi_snapshots
  for all using (auth.uid() is not null); -- refine later

create policy "Admins can manage alert rules" on alert_rules
  for all using (auth.uid() is not null); -- refine later

create policy "Admins can manage alerts" on alerts
  for all using (auth.uid() is not null); -- refine later

-- Seed default alert rules
insert into alert_rules (name, type, condition, severity, is_enabled) values
('High Inbound SLA Miss rate', 'sla', '{"metric":"inbound_sla_missed_today","op":"gte","value":3}', 'high', true),
('Too many overdue tasks', 'delivery', '{"metric":"tasks_overdue","op":"gte","value":25}', 'medium', true),
('Critical Overdue Tasks Spike', 'delivery', '{"metric":"critical_overdue","op":"gte","value":10}', 'high', true),
('Stalled Projects Alert', 'delivery', '{"metric":"stalled_projects","op":"gte","value":5}', 'high', true),
('High Volume of Overdue Approvals', 'delivery', '{"metric":"approvals_overdue","op":"gte","value":3}', 'medium', true);
