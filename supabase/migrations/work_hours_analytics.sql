-- Work Hours Analytics Migration

-- 1. Clamped View (Limits sessions to 16h to avoid bad data skewing reports)
create or replace view user_sessions_clamped as
select 
    *,
    -- If duration > 16h (57600s), cap it.
    LEAST(
        EXTRACT(EPOCH FROM (COALESCE(logout_at, now()) - login_at))::bigint, 
        57600
    ) as duration_seconds_clamped,
    
    ROUND(
        LEAST(
            EXTRACT(EPOCH FROM (COALESCE(logout_at, now()) - login_at))::numeric, 
            57600
        ) / 3600.0, 
        2
    ) as duration_hours_clamped
from user_sessions;

-- 2. Aggregation Helper Function (RPC)
-- Efficiently calculates daily stats per user for a date range
-- Handles timezone logic inside DB
create or replace function get_work_hours_report(
    p_start_date date, 
    p_end_date date, 
    p_timezone text default 'Asia/Kolkata'
)
returns table (
    user_id uuid,
    day text, -- returned as YYYY-MM-DD string
    total_seconds bigint,
    total_hours numeric,
    sessions_count bigint,
    first_login timestamptz,
    last_logout timestamptz
)
language plpgsql
security definer -- to allow reading all sessions
as $$
begin
    return query
    select
        s.user_id,
        to_char(s.login_at at time zone p_timezone, 'YYYY-MM-DD') as day,
        sum(
             LEAST(
                EXTRACT(EPOCH FROM (COALESCE(s.logout_at, now()) - s.login_at))::bigint, 
                57600
             )
        )::bigint as total_seconds,
        round(
            sum(
                LEAST(
                    EXTRACT(EPOCH FROM (COALESCE(s.logout_at, now()) - s.login_at))::numeric, 
                    57600
                )
            ) / 3600.0,
            2
        ) as total_hours,
        count(s.id) as sessions_count,
        min(s.login_at) as first_login,
        max(coalesce(s.logout_at, s.last_seen_at)) as last_logout
    from user_sessions s
    where 
        (s.login_at at time zone p_timezone)::date >= p_start_date
        and (s.login_at at time zone p_timezone)::date <= p_end_date
    group by 1, 2
    order by 2 desc, 3 desc; -- date desc, hours desc
end;
$$;
