alter table public.episodes
add column if not exists had_numbness text,
add column if not exists throbbing_associations text[] not null default '{}'::text[];

alter table public.episodes
drop constraint if exists episodes_had_numbness_check;

alter table public.episodes
add constraint episodes_had_numbness_check
check (
  had_numbness is null or had_numbness in ('yes', 'no', 'unsure')
);

alter table public.episodes
drop constraint if exists episodes_throbbing_associations_check;

alter table public.episodes
add constraint episodes_throbbing_associations_check
check (
  throbbing_associations <@ array[
    'headache',
    'visual_disturbances',
    'migraine_aura',
    'none'
  ]::text[]
);
