create table if not exists public.face_area_options (
  id uuid primary key,
  label text not null,
  normalized_label text not null unique,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.episode_face_areas (
  episode_id uuid not null references public.episodes (id) on delete cascade,
  face_area_option_id uuid not null references public.face_area_options (id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (episode_id, face_area_option_id)
);

create index if not exists episode_face_areas_face_area_option_idx
on public.episode_face_areas (face_area_option_id);

alter table public.face_area_options enable row level security;
alter table public.episode_face_areas enable row level security;

create policy "Users can read face area options"
on public.face_area_options
for select
using (true);

create policy "Users can read episode face areas"
on public.episode_face_areas
for select
using (
  exists (
    select 1
    from public.episodes
    where episodes.id = episode_face_areas.episode_id
      and episodes.user_id = auth.uid()
  )
);

create policy "Users can insert episode face areas"
on public.episode_face_areas
for insert
with check (
  exists (
    select 1
    from public.episodes
    where episodes.id = episode_face_areas.episode_id
      and episodes.user_id = auth.uid()
  )
  and exists (
    select 1
    from public.face_area_options
    where face_area_options.id = episode_face_areas.face_area_option_id
  )
);

create policy "Users can delete episode face areas"
on public.episode_face_areas
for delete
using (
  exists (
    select 1
    from public.episodes
    where episodes.id = episode_face_areas.episode_id
      and episodes.user_id = auth.uid()
  )
);

insert into public.face_area_options (id, label, normalized_label)
values
  ('33333333-3333-4333-8333-000000000001', 'Left cheek', 'left_cheek'),
  ('33333333-3333-4333-8333-000000000002', 'Right cheek', 'right_cheek'),
  ('33333333-3333-4333-8333-000000000003', 'Jaw', 'jaw'),
  ('33333333-3333-4333-8333-000000000004', 'Upper lip', 'upper_lip'),
  ('33333333-3333-4333-8333-000000000005', 'Lower lip', 'lower_lip'),
  ('33333333-3333-4333-8333-000000000006', 'Eye / forehead', 'eye_forehead')
on conflict (id) do update
set label = excluded.label,
    normalized_label = excluded.normalized_label;

insert into public.episode_face_areas (episode_id, face_area_option_id)
select episodes.id, face_area_options.id
from public.episodes
join public.face_area_options
  on face_area_options.normalized_label = episodes.face_area
where episodes.face_area <> 'multiple_areas'
on conflict do nothing;
