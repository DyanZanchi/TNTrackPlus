alter table public.episodes
add column if not exists duration_seconds integer;

update public.episodes
set duration_seconds = duration_minutes * 60
where duration_seconds is null
  and duration_minutes is not null;

alter table public.episodes
alter column duration_seconds set not null;

alter table public.episodes
drop constraint if exists episodes_duration_seconds_check;

alter table public.episodes
add constraint episodes_duration_seconds_check
check (duration_seconds between 1 and 86399);
