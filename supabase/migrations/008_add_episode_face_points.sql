create table if not exists public.episode_face_points (
  id uuid primary key default gen_random_uuid(),
  episode_id uuid not null references public.episodes (id) on delete cascade,
  x numeric(6, 1) not null check (x >= 0 and x <= 1000),
  y numeric(6, 1) not null check (y >= 0 and y <= 1000),
  division text not null check (division in ('v1', 'v2', 'v3')),
  location_key text not null,
  location_label text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists episode_face_points_episode_idx
on public.episode_face_points (episode_id);

alter table public.episode_face_points enable row level security;

create policy "Users can read episode face points"
on public.episode_face_points
for select
using (
  exists (
    select 1
    from public.episodes
    where episodes.id = episode_face_points.episode_id
      and episodes.user_id = auth.uid()
  )
);

create policy "Users can insert episode face points"
on public.episode_face_points
for insert
with check (
  exists (
    select 1
    from public.episodes
    where episodes.id = episode_face_points.episode_id
      and episodes.user_id = auth.uid()
  )
);

create policy "Users can delete episode face points"
on public.episode_face_points
for delete
using (
  exists (
    select 1
    from public.episodes
    where episodes.id = episode_face_points.episode_id
      and episodes.user_id = auth.uid()
  )
);
