alter table public.episodes
add column if not exists pain_type text;

update public.episodes
set pain_type = 'trigeminal_neuralgia'
where pain_type is null;

alter table public.episodes
alter column pain_type set not null;

alter table public.episodes
drop constraint if exists episodes_pain_type_check;

alter table public.episodes
add constraint episodes_pain_type_check
check (
  pain_type in (
    'trigeminal_neuralgia',
    'geniculate_neuralgia',
    'anesthesia_dolorosa',
    'occipital_neuralgia'
  )
);
