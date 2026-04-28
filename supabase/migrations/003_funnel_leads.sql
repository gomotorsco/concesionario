alter table landing_leads
add column if not exists funnel_stage text default 'nuevo';

alter table landing_leads
add column if not exists lead_score integer default 50;

alter table landing_leads
add column if not exists temperatura text default 'tibio';

alter table landing_leads
add column if not exists last_activity_at timestamptz;

alter table landing_leads
add column if not exists next_follow_up_at timestamptz;

update landing_leads
set funnel_stage = coalesce(estado, 'nuevo')
where funnel_stage is null;

create index if not exists idx_landing_leads_funnel_stage
on landing_leads(funnel_stage);

create index if not exists idx_landing_leads_score
on landing_leads(lead_score);

create index if not exists idx_landing_leads_last_activity
on landing_leads(last_activity_at);
