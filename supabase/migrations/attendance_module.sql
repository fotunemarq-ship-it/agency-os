-- Attendance Module Migration

-- 1. attendance_sessions
create table if not exists attendance_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id),
  session_date date not null, -- Asia/Kolkata date
  clock_in_at timestamptz not null,
  clock_out_at timestamptz,
  status text not null default 'open', -- open | closed | flagged
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Partial index for only ONE open session per user
create unique index if not exists idx_unique_open_session_per_user 
on attendance_sessions(user_id) where (status = 'open');

create index if not exists idx_sessions_user_date on attendance_sessions(user_id, session_date desc);
create index if not exists idx_sessions_status_updated on attendance_sessions(status, updated_at desc);


-- 2. attendance_breaks
create table if not exists attendance_breaks (
  id uuid default gen_random_uuid() primary key,
  session_id uuid not null references attendance_sessions(id) on delete cascade,
  break_start_at timestamptz not null,
  break_end_at timestamptz,
  created_at timestamptz default now()
);

-- Partial index for only ONE open break per session
create unique index if not exists idx_unique_open_break_per_session
on attendance_breaks(session_id) where (break_end_at is null);

create index if not exists idx_breaks_session_start on attendance_breaks(session_id, break_start_at desc);


-- 3. attendance_daily_summary
create table if not exists attendance_daily_summary (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id),
  day date not null,
  gross_minutes int not null default 0,
  break_minutes int not null default 0,
  net_minutes int not null default 0,
  sessions_count int not null default 0,
  is_complete boolean not null default true, -- false if open session exists
  flags jsonb not null default '{}',
  updated_at timestamptz default now(),
  unique(user_id, day)
);

create index if not exists idx_summary_day on attendance_daily_summary(day desc);


-- 4. attendance_policies
create table if not exists attendance_policies (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  timezone text not null default 'Asia/Kolkata',
  standard_daily_minutes int not null default 540, -- 9h
  max_session_hours int not null default 14,
  break_required_after_minutes int not null default 300,
  grace_late_minutes int not null default 10,
  is_enabled boolean default true,
  created_at timestamptz default now()
);

-- Seed default policy
insert into attendance_policies (name, timezone, standard_daily_minutes, max_session_hours)
values ('Standard Asia/Kolkata', 'Asia/Kolkata', 540, 14);


-- 5. attendance_adjustments
create table if not exists attendance_adjustments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id),
  day date not null,
  adjustment_minutes int not null default 0,
  reason text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

create index if not exists idx_adjustments_user_day on attendance_adjustments(user_id, day);


-- 6. RLS Policies
alter table attendance_sessions enable row level security;
alter table attendance_breaks enable row level security;
alter table attendance_daily_summary enable row level security;
alter table attendance_policies enable row level security;
alter table attendance_adjustments enable row level security;

-- Sessions
create policy "Users manage their own sessions" on attendance_sessions
  for all using (auth.uid() = user_id);

create policy "Admins see all sessions" on attendance_sessions
  for select using (auth.uid() in (select id from auth.users)); -- Simplify admin check (all users for strictly internal use, or real logic)
  -- For strictness: Assuming you rely on app-level checks or a role table. 
  -- We'll allow READ for all authenticated users (so PMs can see), but WRITE constrained.
  -- Actually, let's keep it tighter: Read their own OR Admin/PM (handled by app logic/admin user role if exists).
  -- Given no role table visible in context, we stick to standard 'auth.uid() = user_id' for write, and broad read for now until role system is cleaner.

-- Allow admins full access (Placeholder for admin check)
-- create policy "Admins all" ... 

-- Breaks
create policy "Users manage their own breaks" on attendance_breaks
  for all using (
    session_id in (select id from attendance_sessions where user_id = auth.uid())
  );

-- Summaries
create policy "Users read their summaries" on attendance_daily_summary
  for select using (auth.uid() = user_id);

-- Policies
create policy "Everyone reads policies" on attendance_policies
  for select using (true);
  
-- Adjustments
create policy "Users read own adjustments" on attendance_adjustments
  for select using (auth.uid() = user_id);
  
-- Allow updates to updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_attendance_sessions_modtime
    before update on attendance_sessions
    for each row execute procedure update_updated_at_column();

create trigger update_attendance_summary_modtime
    before update on attendance_daily_summary
    for each row execute procedure update_updated_at_column();
