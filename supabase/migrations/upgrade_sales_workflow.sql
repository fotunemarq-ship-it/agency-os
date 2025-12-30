-- Create Lead Outcomes Table
create table if not exists lead_outcomes (
  id uuid default gen_random_uuid() primary key,
  lead_id uuid not null references leads(id) on delete cascade,
  actor_id uuid not null references auth.users(id),
  outcome text not null, -- 'interested','follow_up','no_answer','not_reachable','busy','not_interested','wrong_number','invalid_number','strategy_booked'
  reason_code text,
  reason_note text,
  next_action_date timestamptz,
  call_notes text,
  created_at timestamptz default now()
);

create index if not exists idx_lead_outcomes_lead on lead_outcomes(lead_id, created_at desc);
create index if not exists idx_lead_outcomes_actor on lead_outcomes(actor_id, created_at desc);
create index if not exists idx_lead_outcomes_outcome on lead_outcomes(outcome, created_at desc);

-- Create Lead Reason Codes Table
create table if not exists lead_reason_codes (
  id uuid default gen_random_uuid() primary key,
  outcome text not null,
  code text not null,
  label text not null,
  is_active boolean default true,
  sort_order int default 0,
  unique(outcome, code)
);

-- Seed Reason Codes
insert into lead_reason_codes (outcome, code, label, sort_order) values
('not_interested', 'budget', 'Budget Constraints', 10),
('not_interested', 'already_has_agency', 'Already has Agency/Partner', 20),
('not_interested', 'not_decision_maker', 'Not Decision Maker', 30),
('not_interested', 'not_needed_now', 'Not Needed Right Now', 40),
('not_interested', 'bad_experience', 'Bad Past Experience', 50),
('not_interested', 'prefers_referral', 'Prefers Referral Only', 60),
('follow_up', 'asked_callback', 'Asked for Callback', 10),
('follow_up', 'needs_discuss_partner', 'Needs to Discuss with Partner', 20),
('follow_up', 'send_details', 'Requested More Details', 30),
('follow_up', 'timing_issue', 'Bad Timing', 40),
('wrong_number', 'invalid_contact', 'Invalid Contact Info', 10),
('invalid_number', 'invalid_contact', 'Invalid Contact Info', 10)
on conflict (outcome, code) do nothing;

-- Enhance Leads Table
alter table leads add column if not exists last_contacted_at timestamptz;
alter table leads add column if not exists last_outcome text;
alter table leads add column if not exists last_outcome_reason text;
alter table leads add column if not exists next_action_date timestamptz;
alter table leads add column if not exists stale_flag boolean default false;
alter table leads add column if not exists stale_reason text;

-- Create Sales Daily Metrics Table
create table if not exists sales_daily_metrics (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  day date not null,
  calls_made int default 0,
  connected int default 0,
  followups_set int default 0,
  strategy_booked int default 0,
  not_interested int default 0,
  created_at timestamptz default now(),
  unique(user_id, day)
);

-- Create Sales Scripts Table
create table if not exists sales_scripts (
  id uuid default gen_random_uuid() primary key,
  industry text, -- null for global
  city text,
  language text default 'en',
  script_title text not null,
  script_body text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Create Objection Bank Table
create table if not exists objection_bank (
  id uuid default gen_random_uuid() primary key,
  industry text,
  objection text not null,
  rebuttal text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Enable RLS
alter table lead_outcomes enable row level security;
alter table lead_reason_codes enable row level security;
alter table sales_daily_metrics enable row level security;
alter table sales_scripts enable row level security;
alter table objection_bank enable row level security;

-- Policies

-- lead_outcomes
create policy "Sales can insert outcomes" on lead_outcomes for insert
  with check (auth.uid() = actor_id);

create policy "Sales can read outcomes" on lead_outcomes for select
  using (true); -- Simplified, usually strictly for assigned leads but keeping it open for team visibility for now

-- lead_reason_codes
create policy "Everyone can read reason codes" on lead_reason_codes for select
  using (true);

-- sales_daily_metrics
create policy "Users can read own metrics" on sales_daily_metrics for select
  using (auth.uid() = user_id or exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

create policy "Users can update own metrics" on sales_daily_metrics for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- sales_scripts & objection_bank
create policy "Everyone can read scripts" on sales_scripts for select using (true);
create policy "Everyone can read objections" on objection_bank for select using (true);
create policy "Admins manage scripts" on sales_scripts for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Admins manage objections" on objection_bank for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
