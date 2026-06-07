alter table public.episodes
add column if not exists pain_pattern text check (pain_pattern in ('continuous', 'episodic_pulsing')),
add column if not exists pulse_duration_seconds integer check (
  pulse_duration_seconds is null or (pulse_duration_seconds between 1 and 86399)
);

update public.episodes
set pain_pattern = 'continuous'
where pain_pattern is null;

alter table public.episodes
alter column pain_pattern set not null;
