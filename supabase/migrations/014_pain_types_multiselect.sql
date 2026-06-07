create table if not exists public.patient_pain_types (
  user_id uuid not null references auth.users (id) on delete cascade,
  pain_type text not null check (
    pain_type in (
      'trigeminal_neuralgia',
      'geniculate_neuralgia',
      'anesthesia_dolorosa',
      'occipital_neuralgia'
    )
  ),
  created_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, pain_type)
);

create table if not exists public.episode_pain_types (
  episode_id uuid not null references public.episodes (id) on delete cascade,
  pain_type text not null check (
    pain_type in (
      'trigeminal_neuralgia',
      'geniculate_neuralgia',
      'anesthesia_dolorosa',
      'occipital_neuralgia'
    )
  ),
  primary key (episode_id, pain_type)
);

create index if not exists patient_pain_types_user_idx
on public.patient_pain_types (user_id);

create index if not exists episode_pain_types_episode_idx
on public.episode_pain_types (episode_id);

alter table public.patient_pain_types enable row level security;
alter table public.episode_pain_types enable row level security;

create policy "Users can read their pain types"
on public.patient_pain_types
for select
using (auth.uid() = user_id);

create policy "Users can insert their pain types"
on public.patient_pain_types
for insert
with check (auth.uid() = user_id);

create policy "Users can delete their pain types"
on public.patient_pain_types
for delete
using (auth.uid() = user_id);

create policy "Users can read episode pain types"
on public.episode_pain_types
for select
using (
  exists (
    select 1
    from public.episodes
    where episodes.id = episode_pain_types.episode_id
      and episodes.user_id = auth.uid()
  )
);

create policy "Users can insert episode pain types"
on public.episode_pain_types
for insert
with check (
  exists (
    select 1
    from public.episodes
    where episodes.id = episode_pain_types.episode_id
      and episodes.user_id = auth.uid()
  )
);

insert into public.patient_pain_types (user_id, pain_type)
select user_id, pain_type
from public.patient_profiles
where pain_type is not null
on conflict do nothing;

insert into public.episode_pain_types (episode_id, pain_type)
select id, pain_type
from public.episodes
on conflict do nothing;

alter table public.patient_profile_revisions
add column if not exists pain_types jsonb not null default '[]'::jsonb;

update public.patient_profile_revisions
set pain_types = jsonb_build_array(pain_type)
where pain_type is not null
  and pain_types = '[]'::jsonb;

alter table public.patient_profiles
drop column if exists pain_type;

alter table public.patient_profile_revisions
drop column if exists pain_type;
