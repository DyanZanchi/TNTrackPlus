create table if not exists public.trigger_options (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  label text not null,
  normalized_label text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.medication_options (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  label text not null,
  normalized_label text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists trigger_options_global_unique_idx
on public.trigger_options (normalized_label)
where user_id is null;

create unique index if not exists trigger_options_user_unique_idx
on public.trigger_options (user_id, normalized_label)
where user_id is not null;

create unique index if not exists medication_options_global_unique_idx
on public.medication_options (normalized_label)
where user_id is null;

create unique index if not exists medication_options_user_unique_idx
on public.medication_options (user_id, normalized_label)
where user_id is not null;

create table if not exists public.episode_triggers (
  episode_id uuid not null references public.episodes (id) on delete cascade,
  trigger_option_id uuid not null references public.trigger_options (id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (episode_id, trigger_option_id)
);

create table if not exists public.episode_medications (
  episode_id uuid not null references public.episodes (id) on delete cascade,
  medication_option_id uuid not null references public.medication_options (id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (episode_id, medication_option_id)
);

create index if not exists episode_triggers_trigger_option_idx
on public.episode_triggers (trigger_option_id);

create index if not exists episode_medications_medication_option_idx
on public.episode_medications (medication_option_id);

alter table public.episodes
alter column trigger_name drop not null;

alter table public.episodes
alter column medication_taken drop not null;

alter table public.episodes
drop constraint if exists episodes_trigger_name_check;

alter table public.episodes
drop constraint if exists episodes_medication_taken_check;

alter table public.trigger_options enable row level security;
alter table public.medication_options enable row level security;
alter table public.episode_triggers enable row level security;
alter table public.episode_medications enable row level security;

create policy "Users can read trigger options"
on public.trigger_options
for select
using (user_id is null or auth.uid() = user_id);

create policy "Users can add custom trigger options"
on public.trigger_options
for insert
with check (auth.uid() = user_id);

create policy "Users can update custom trigger options"
on public.trigger_options
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can read medication options"
on public.medication_options
for select
using (user_id is null or auth.uid() = user_id);

create policy "Users can add custom medication options"
on public.medication_options
for insert
with check (auth.uid() = user_id);

create policy "Users can update custom medication options"
on public.medication_options
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can read episode triggers"
on public.episode_triggers
for select
using (
  exists (
    select 1
    from public.episodes
    where episodes.id = episode_triggers.episode_id
      and episodes.user_id = auth.uid()
  )
);

create policy "Users can insert episode triggers"
on public.episode_triggers
for insert
with check (
  exists (
    select 1
    from public.episodes
    where episodes.id = episode_triggers.episode_id
      and episodes.user_id = auth.uid()
  )
  and exists (
    select 1
    from public.trigger_options
    where trigger_options.id = episode_triggers.trigger_option_id
      and (trigger_options.user_id is null or trigger_options.user_id = auth.uid())
  )
);

create policy "Users can delete episode triggers"
on public.episode_triggers
for delete
using (
  exists (
    select 1
    from public.episodes
    where episodes.id = episode_triggers.episode_id
      and episodes.user_id = auth.uid()
  )
);

create policy "Users can read episode medications"
on public.episode_medications
for select
using (
  exists (
    select 1
    from public.episodes
    where episodes.id = episode_medications.episode_id
      and episodes.user_id = auth.uid()
  )
);

create policy "Users can insert episode medications"
on public.episode_medications
for insert
with check (
  exists (
    select 1
    from public.episodes
    where episodes.id = episode_medications.episode_id
      and episodes.user_id = auth.uid()
  )
  and exists (
    select 1
    from public.medication_options
    where medication_options.id = episode_medications.medication_option_id
      and (medication_options.user_id is null or medication_options.user_id = auth.uid())
  )
);

create policy "Users can delete episode medications"
on public.episode_medications
for delete
using (
  exists (
    select 1
    from public.episodes
    where episodes.id = episode_medications.episode_id
      and episodes.user_id = auth.uid()
  )
);

insert into public.trigger_options (id, user_id, label, normalized_label, is_active)
values
  ('11111111-1111-4111-8111-000000000001', null, 'Chewing', 'chewing', true),
  ('11111111-1111-4111-8111-000000000002', null, 'Brushing teeth', 'brushing_teeth', true),
  ('11111111-1111-4111-8111-000000000003', null, 'Talking', 'talking', true),
  ('11111111-1111-4111-8111-000000000004', null, 'Touching face', 'touching_face', true),
  ('11111111-1111-4111-8111-000000000005', null, 'Cold air', 'cold_air', true),
  ('11111111-1111-4111-8111-000000000006', null, 'Washing face', 'washing_face', true),
  ('11111111-1111-4111-8111-000000000007', null, 'Stress', 'stress', true),
  ('11111111-1111-4111-8111-000000000008', null, 'Spontaneous / no clear trigger', 'spontaneous', true)
on conflict (id) do update
set label = excluded.label,
    normalized_label = excluded.normalized_label,
    is_active = excluded.is_active;

insert into public.medication_options (id, user_id, label, normalized_label, is_active)
values
  ('22222222-2222-4222-8222-000000000001', null, 'No medication', 'no_medication', true),
  ('22222222-2222-4222-8222-000000000002', null, 'Carbamazepine', 'carbamazepine', true),
  ('22222222-2222-4222-8222-000000000003', null, 'Oxcarbazepine', 'oxcarbazepine', true),
  ('22222222-2222-4222-8222-000000000004', null, 'Gabapentin', 'gabapentin', true),
  ('22222222-2222-4222-8222-000000000005', null, 'Baclofen', 'baclofen', true),
  ('22222222-2222-4222-8222-000000000006', null, 'Ibuprofen', 'ibuprofen', true),
  ('22222222-2222-4222-8222-000000000007', null, 'Acetaminophen', 'acetaminophen', true),
  ('22222222-2222-4222-8222-000000000008', null, 'Naproxen', 'naproxen', true),
  ('22222222-2222-4222-8222-000000000009', null, 'Aspirin', 'aspirin', true)
on conflict (id) do update
set label = excluded.label,
    normalized_label = excluded.normalized_label,
    is_active = excluded.is_active;
