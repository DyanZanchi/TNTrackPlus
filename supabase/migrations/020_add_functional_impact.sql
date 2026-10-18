alter table public.episodes
add column if not exists functional_impact integer;

alter table public.episodes
drop constraint if exists episodes_functional_impact_check;

alter table public.episodes
add constraint episodes_functional_impact_check
check (functional_impact is null or functional_impact between 1 and 10);
