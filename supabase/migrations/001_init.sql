create extension if not exists pgcrypto;

create table if not exists public.episodes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  face_area text not null check (
    face_area in (
      'left_cheek',
      'right_cheek',
      'jaw',
      'upper_lip',
      'lower_lip',
      'eye_forehead',
      'multiple_areas'
    )
  ),
  severity integer not null check (severity between 1 and 10),
  duration_minutes integer not null check (duration_minutes between 1 and 180),
  onset_at timestamptz not null,
  trigger_name text not null check (
    trigger_name in (
      'chewing',
      'brushing_teeth',
      'talking',
      'touching_face',
      'cold_air',
      'washing_face',
      'stress',
      'spontaneous'
    )
  ),
  medication_taken text not null check (
    medication_taken in (
      'carbamazepine',
      'oxcarbazepine',
      'gabapentin',
      'baclofen',
      'none'
    )
  ),
  notes text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists episodes_user_id_idx on public.episodes (user_id);
create index if not exists episodes_onset_at_idx on public.episodes (onset_at desc);

alter table public.episodes enable row level security;

create policy "Users can view their own episodes"
on public.episodes
for select
using (auth.uid() = user_id);

create policy "Users can insert their own episodes"
on public.episodes
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own episodes"
on public.episodes
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own episodes"
on public.episodes
for delete
using (auth.uid() = user_id);
