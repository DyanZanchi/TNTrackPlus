create table if not exists public.pain_type_options (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  label text not null,
  normalized_label text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists pain_type_options_global_unique_idx
on public.pain_type_options (normalized_label)
where user_id is null;

create unique index if not exists pain_type_options_user_unique_idx
on public.pain_type_options (user_id, normalized_label)
where user_id is not null;

insert into public.pain_type_options (id, user_id, label, normalized_label, is_active)
values
  ('44444444-4444-4444-8444-000000000001', null, 'Trigeminal Neuralgia', 'trigeminal_neuralgia', true),
  ('44444444-4444-4444-8444-000000000002', null, 'Geniculate Neuralgia', 'geniculate_neuralgia', true),
  ('44444444-4444-4444-8444-000000000003', null, 'Anesthesia Dolorosa', 'anesthesia_dolorosa', true),
  ('44444444-4444-4444-8444-000000000004', null, 'Occipital Neuralgia', 'occipital_neuralgia', true)
on conflict (id) do update
set label = excluded.label,
    normalized_label = excluded.normalized_label,
    is_active = excluded.is_active;

alter table public.patient_pain_types
add column if not exists pain_type_option_id uuid references public.pain_type_options (id) on delete restrict;

update public.patient_pain_types patient_rows
set pain_type_option_id = options.id
from public.pain_type_options options
where options.user_id is null
  and options.normalized_label = patient_rows.pain_type
  and patient_rows.pain_type_option_id is null;

alter table public.patient_pain_types
drop constraint if exists patient_pain_types_pkey;

alter table public.patient_pain_types
drop column if exists pain_type;

alter table public.patient_pain_types
alter column pain_type_option_id set not null;

alter table public.patient_pain_types
add primary key (user_id, pain_type_option_id);

create index if not exists patient_pain_types_option_idx
on public.patient_pain_types (pain_type_option_id);

alter table public.episode_pain_types
add column if not exists pain_type_option_id uuid references public.pain_type_options (id) on delete restrict;

update public.episode_pain_types episode_rows
set pain_type_option_id = options.id
from public.pain_type_options options
where options.user_id is null
  and options.normalized_label = episode_rows.pain_type
  and episode_rows.pain_type_option_id is null;

alter table public.episode_pain_types
drop constraint if exists episode_pain_types_pkey;

alter table public.episode_pain_types
drop column if exists pain_type;

alter table public.episode_pain_types
alter column pain_type_option_id set not null;

alter table public.episode_pain_types
add primary key (episode_id, pain_type_option_id);

create index if not exists episode_pain_types_option_idx
on public.episode_pain_types (pain_type_option_id);

alter table public.episodes
drop constraint if exists episodes_pain_type_check;

update public.patient_profile_revisions revisions
set pain_types = coalesce(
  (
    select jsonb_agg(options.label order by options.label)
    from jsonb_array_elements_text(revisions.pain_types) slug
    join public.pain_type_options options
      on options.user_id is null
     and options.normalized_label = slug.value
  ),
  revisions.pain_types
)
where jsonb_array_length(revisions.pain_types) > 0;

alter table public.pain_type_options enable row level security;

create policy "Users can read pain type options"
on public.pain_type_options
for select
using (user_id is null or auth.uid() = user_id);

create policy "Users can add custom pain type options"
on public.pain_type_options
for insert
with check (auth.uid() = user_id);

create policy "Users can update custom pain type options"
on public.pain_type_options
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can insert their pain types" on public.patient_pain_types;

create policy "Users can insert their pain types"
on public.patient_pain_types
for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.pain_type_options
    where pain_type_options.id = patient_pain_types.pain_type_option_id
      and (pain_type_options.user_id is null or pain_type_options.user_id = auth.uid())
  )
);

drop policy if exists "Users can insert episode pain types" on public.episode_pain_types;

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
  and exists (
    select 1
    from public.pain_type_options
    where pain_type_options.id = episode_pain_types.pain_type_option_id
      and (pain_type_options.user_id is null or pain_type_options.user_id = auth.uid())
  )
);
