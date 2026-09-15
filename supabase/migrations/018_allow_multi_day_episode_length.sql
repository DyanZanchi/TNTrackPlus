alter table public.episodes
drop constraint if exists episodes_duration_seconds_check;

alter table public.episodes
add constraint episodes_duration_seconds_check
check (duration_seconds between 1 and 1209600);

alter table public.episodes
drop constraint if exists episodes_duration_minutes_check;

alter table public.episodes
add constraint episodes_duration_minutes_check
check (duration_minutes between 1 and 20160);
