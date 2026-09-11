alter table public.episodes
add column if not exists pain_qualities text[] not null default '{}'::text[],
add column if not exists pain_quality_other text;

alter table public.episodes
drop constraint if exists episodes_pain_qualities_check;

alter table public.episodes
add constraint episodes_pain_qualities_check
check (
  pain_qualities <@ array[
    'sharp_stabbing',
    'electrical',
    'icicles',
    'burning',
    'throbbing',
    'dull',
    'other'
  ]::text[]
);
