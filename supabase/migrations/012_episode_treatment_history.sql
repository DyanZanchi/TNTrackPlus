alter table public.episodes
add column if not exists treatment_change_date date,
add column if not exists treatment_history_snapshot jsonb;

alter table public.patient_profile_revisions
add column if not exists episode_id uuid references public.episodes (id) on delete cascade,
add column if not exists change_date date;

create index if not exists patient_profile_revisions_episode_idx
on public.patient_profile_revisions (episode_id);
