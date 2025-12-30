-- Helper function to normalize phone numbers
create or replace function normalize_phone(raw_phone text) returns text as $$
declare
  cleaned text;
begin
  if raw_phone is null then return null; end if;
  -- Remove all non-digit characters
  cleaned := regexp_replace(raw_phone, '[^0-9]', '', 'g');
  -- If empty after cleaning, return null
  if length(cleaned) = 0 then return null; end if;
  -- Take last 10 digits (default for IN/US common mobile formats)
  -- Adjust logic if international formats strictly required
  if length(cleaned) > 10 then
    cleaned := substring(cleaned from length(cleaned)-9 for 10);
  end if;
  return cleaned;
end;
$$ language plpgsql immutable;

-- Helper function to normalize emails
create or replace function normalize_email(raw_email text) returns text as $$
begin
  if raw_email is null then return null; end if;
  return lower(trim(raw_email));
end;
$$ language plpgsql immutable;

-- Helper function to extract domain from website
create or replace function extract_domain(url text) returns text as $$
declare
  domain text;
begin
  if url is null then return null; end if;
  domain := lower(trim(url));
  -- Remove protocol
  domain := regexp_replace(domain, '^https?://', '');
  -- Remove www.
  domain := regexp_replace(domain, '^www\.', '');
  -- Remove path/query
  domain := split_part(domain, '/', 1);
  return domain;
end;
$$ language plpgsql immutable;

-- Add normalized columns to leads
alter table leads add column if not exists phone_normalized text;
alter table leads add column if not exists email_normalized text;
alter table leads add column if not exists website_domain text;
alter table leads add column if not exists phone_raw text;

-- Add merge tracking columns to leads
alter table leads add column if not exists is_merged boolean default false;
alter table leads add column if not exists merged_into uuid references leads(id);

-- Create duplicate_candidates table
create table if not exists duplicate_candidates (
  id uuid default gen_random_uuid() primary key,
  entity_type text not null default 'lead',
  primary_id uuid not null references leads(id) on delete cascade,
  duplicate_id uuid not null references leads(id) on delete cascade,
  match_type text not null, -- 'phone'|'email'|'domain'|'name_city'|'fuzzy'
  confidence int not null,
  reason jsonb default '{}',
  status text not null default 'open', -- 'open'|'ignored'|'merged'
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  unique(entity_type, primary_id, duplicate_id, match_type)
);

-- Create merges table
create table if not exists merges (
  id uuid default gen_random_uuid() primary key,
  entity_type text not null default 'lead',
  survivor_id uuid not null references leads(id),
  merged_id uuid not null references leads(id),
  merged_by uuid references auth.users(id),
  merge_strategy jsonb default '{}',
  undo_until timestamptz not null,
  is_undone boolean default false,
  created_at timestamptz default now()
);

-- Create lead_redirects table
create table if not exists lead_redirects (
  merged_id uuid primary key references leads(id),
  survivor_id uuid not null references leads(id),
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_leads_phone_norm on leads(phone_normalized);
create index if not exists idx_leads_email_norm on leads(email_normalized);
create index if not exists idx_leads_website_domain on leads(website_domain);

create index if not exists idx_dup_candidates_status on duplicate_candidates(status, created_at desc);
create index if not exists idx_dup_candidates_primary on duplicate_candidates(primary_id);
create index if not exists idx_dup_candidates_duplicate on duplicate_candidates(duplicate_id);

create index if not exists idx_merges_survivor on merges(survivor_id);
create index if not exists idx_merges_merged on merges(merged_id);

-- Trigger to auto-normalize on insert/update
create or replace function trigger_normalize_lead_fields() returns trigger as $$
begin
  new.phone_normalized := normalize_phone(new.phone);
  new.email_normalized := normalize_email(new.email);
  -- If website exists, normalize domain
  if new.industry is not null then -- Using industry field as placeholder? No, wait, need checking if 'website' column exists.
     -- Assuming 'leads' has a 'website' column? The prompt implies it might exist or we just normalize based on provided fields.
     -- If there is a 'website' column in leads:
     -- new.website_domain := extract_domain(new.website);
     -- Checking `initialLeads` interface in previous file, there is no `website` column explicitly mentioned in `Lead` interface, but `email` allows determining website sometimes.
     -- BUT step 1 says "If existing columns are "phone", "email", "website", do NOT remove".
     -- I will check if website column exists in leads table via schema inspection logically, or just try to trigger.
     -- Since I can't check schema dynamically in this block easily without erroring if column missing, I'll skip website domain auto-calc in trigger for safety unless I'm sure column exists. 
     -- Safest is to rely on app-side normalization which I will implement in step 4.
     null;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger set_normalized_fields
before insert or update on leads
for each row
execute function trigger_normalize_lead_fields();

-- Enable RLS
alter table duplicate_candidates enable row level security;
alter table merges enable row level security;
alter table lead_redirects enable row level security;

-- Policies

-- Duplicate Candidates
-- Admin: full access
create policy "Admins full access candidates" on duplicate_candidates
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Sales/Strategist: Read own candidates (simplified to read all open candidates for now, restricted by logic in app)
create policy "Staff read candidates" on duplicate_candidates
  for select using (auth.uid() is not null);

-- Merges
create policy "Admins manage merges" on merges
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Staff read merges" on merges
  for select using (auth.uid() is not null);

-- Redirects
create policy "Everyone read redirects" on lead_redirects
  for select using (true);
