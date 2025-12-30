-- Admin Alerts Engine & Scheduler
-- Moves logic from API to DB-native efficient processing

-- 1. Helper function to check if pg_cron is available
-- (We'll try to create extension if we can, but often requires superuser. 
--  If logic fails, we just don't schedule, relying on external trigger)
create extension if not exists pg_cron with schema extensions;

-- 2. Main KPI & Alert Generation Function (Security Definer to bypass RLS)
create or replace function generate_admin_alerts()
returns jsonb
language plpgsql
security definer
as $$
declare
    v_today date := current_date;
    v_now timestamptz := now();
    v_metrics jsonb;
    v_rule record;
    v_triggered boolean;
    v_alert_count int := 0;
    
    -- KPI variables
    kpi_inbound_new int;
    kpi_inbound_sla_missed int;
    kpi_calls_logged int;
    kpi_connected int;
    kpi_followups_due int;
    kpi_strategy_booked int;
    kpi_active_projects int;
    kpi_tasks_due int;
    kpi_tasks_overdue int;
    kpi_critical_overdue int;
    kpi_stalled_projects int;
    kpi_approvals_pending int;
    kpi_approvals_overdue int;
    kpi_change_requests_open int;
    
begin
    -- ===========================
    -- A. Calculate KPIs
    -- ===========================

    -- Sales
    select count(*) into kpi_inbound_new from leads 
    where created_at >= v_today and source = 'inbound';
    
    kpi_inbound_sla_missed := 0; -- Placeholder logic for now
    
    select count(*) into kpi_calls_logged from lead_outcomes 
    where created_at >= v_today and outcome_type = 'call';
    
    select count(*) into kpi_connected from lead_outcomes 
    where created_at >= v_today and outcome not in ('no_answer','busy','voicemail');
    
    select count(*) into kpi_followups_due from leads 
    where next_action_date >= v_today and next_action_date < v_today + 1;

    select count(*) into kpi_strategy_booked from activity_events 
    where created_at >= v_today and event_type = 'status_change' and description ilike '%strategy%';

    -- Delivery
    select count(*) into kpi_active_projects from projects 
    where status = 'in_progress';
    
    select count(*) into kpi_tasks_due from tasks 
    where due_date = v_today and status <> 'completed';
    
    select count(*) into kpi_tasks_overdue from tasks 
    where due_date < v_today and status <> 'completed';
    
    select count(*) into kpi_critical_overdue from tasks 
    where due_date < (v_today - 3) and status <> 'completed';
    
    -- Stalled Projects (Expensive join, simplified here)
    -- Count projects with no activity in last 7 days
    select count(*) into kpi_stalled_projects 
    from projects p
    where status = 'in_progress'
    and not exists (
        select 1 from activity_events ae 
        where ae.entity_id = p.id 
        and ae.created_at >= (v_now - interval '7 days')
    );

    -- Client Health
    select count(*) into kpi_approvals_pending from milestone_approvals 
    where status = 'pending';
    
    select count(*) into kpi_approvals_overdue from milestone_approvals 
    where status = 'pending' and created_at < (v_now - interval '3 days'); -- Assuming created_at roughly equals requested
    
    select count(*) into kpi_change_requests_open from change_requests 
    where status in ('requested', 'reviewing');

    -- Build JSON
    v_metrics := jsonb_build_object(
        'inbound_new_today', coalesce(kpi_inbound_new, 0),
        'inbound_sla_missed_today', coalesce(kpi_inbound_sla_missed, 0),
        'calls_logged_today', coalesce(kpi_calls_logged, 0),
        'connected_today', coalesce(kpi_connected, 0),
        'followups_due_today', coalesce(kpi_followups_due, 0),
        'strategy_booked_today', coalesce(kpi_strategy_booked, 0),
        'active_projects', coalesce(kpi_active_projects, 0),
        'tasks_due_today', coalesce(kpi_tasks_due, 0),
        'tasks_overdue', coalesce(kpi_tasks_overdue, 0),
        'critical_overdue', coalesce(kpi_critical_overdue, 0),
        'stalled_projects', coalesce(kpi_stalled_projects, 0),
        'approvals_pending', coalesce(kpi_approvals_pending, 0),
        'approvals_overdue', coalesce(kpi_approvals_overdue, 0),
        'change_requests_open', coalesce(kpi_change_requests_open, 0),
        'deals_won_7d', 0, -- Placeholders
        'pipeline_value_open', 0,
        'win_rate_30d', 0
    );

    -- ===========================
    -- B. Store Snapshot
    -- ===========================
    insert into admin_kpi_snapshots (day, metrics)
    values (v_today, v_metrics)
    on conflict (day) do update set metrics = excluded.metrics;

    -- ===========================
    -- C. Evaluate & Generate Alerts
    -- ===========================
    for v_rule in select * from alert_rules where is_enabled = true loop
        v_triggered := false;
        
        -- Parse condition (simple logic support)
        declare
            c_metric text := v_rule.condition->>'metric';
            c_op text := v_rule.condition->>'op';
            c_val numeric := (v_rule.condition->>'value')::numeric;
            m_val numeric := (v_metrics->>c_metric)::numeric;
        begin
            if m_val is not null then
                if c_op = 'gte' and m_val >= c_val then v_triggered := true; end if;
                if c_op = 'gt' and m_val > c_val then v_triggered := true; end if;
                if c_op = 'lte' and m_val <= c_val then v_triggered := true; end if;
                if c_op = 'lt' and m_val < c_val then v_triggered := true; end if;
                if c_op = 'eq' and m_val = c_val then v_triggered := true; end if;
            end if;

            if v_triggered then
                -- Dedupe: Check if open alert exists for this rule today? 
                -- Actually just check if OPEN status exists.
                if not exists (select 1 from alerts where rule_id = v_rule.id and status = 'open') then
                   insert into alerts (rule_id, severity, title, body, status, created_at)
                   values (
                       v_rule.id, 
                       v_rule.severity, 
                       v_rule.name, 
                       format('Current %s: %s (Threshold: %s %s)', c_metric, m_val, c_op, c_val),
                       'open',
                       now()
                   );
                   v_alert_count := v_alert_count + 1;
                end if;
            end if;
        end;
    end loop;

    return jsonb_build_object('success', true, 'alerts_generated', v_alert_count);
end;
$$;

-- 3. Schedule via pg_cron (if available)
do $$
begin
    if exists (select 1 from pg_extension where extname = 'pg_cron') then
        -- Schedule every 15 minutes
        -- job name: 'admin_alerts_job'
        perform cron.schedule('admin_alerts_job', '*/15 * * * *', 'select generate_admin_alerts()');
    end if;
exception when others then
    raise notice 'pg_cron not available or permission denied. Skipping auto-schedule.';
end
$$;
