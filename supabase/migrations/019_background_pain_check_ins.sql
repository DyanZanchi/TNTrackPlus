create table if not exists public.patient_pain_pattern_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  pattern_type text not null check (
    pattern_type in (
      'episodes_with_pain_free_periods',
      'continuous_background',
      'continuous_with_episodes',
      'varies_unsure'
    )
  ),
  effective_from date not null default current_date,
  effective_to date,
  created_at timestamptz not null default timezone('utc', now()),
  check (effective_to is null or effective_to >= effective_from)
);

create unique index if not exists patient_pain_pattern_one_current_idx
on public.patient_pain_pattern_history (user_id)
where effective_to is null;

create index if not exists patient_pain_pattern_user_date_idx
on public.patient_pain_pattern_history (user_id, effective_from desc);

alter table public.patient_pain_pattern_history enable row level security;

create policy "Users can view their own pain pattern history"
on public.patient_pain_pattern_history
for select
using (auth.uid() = user_id);

create policy "Users can insert their own pain pattern history"
on public.patient_pain_pattern_history
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own pain pattern history"
on public.patient_pain_pattern_history
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own pain pattern history"
on public.patient_pain_pattern_history
for delete
using (auth.uid() = user_id);

create or replace function public.set_current_pain_pattern(
  requested_pattern_type text,
  requested_effective_from date default current_date
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  current_pattern public.patient_pain_pattern_history%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if requested_pattern_type not in (
    'episodes_with_pain_free_periods',
    'continuous_background',
    'continuous_with_episodes',
    'varies_unsure'
  ) then
    raise exception 'Invalid pain pattern';
  end if;

  select *
  into current_pattern
  from public.patient_pain_pattern_history
  where user_id = auth.uid()
    and effective_to is null
  for update;

  if found and current_pattern.pattern_type = requested_pattern_type then
    return;
  end if;

  if found and current_pattern.effective_from >= requested_effective_from then
    update public.patient_pain_pattern_history
    set pattern_type = requested_pattern_type,
        effective_from = requested_effective_from
    where id = current_pattern.id;
    return;
  end if;

  if found then
    update public.patient_pain_pattern_history
    set effective_to = requested_effective_from - 1
    where id = current_pattern.id;
  end if;

  insert into public.patient_pain_pattern_history (
    user_id,
    pattern_type,
    effective_from
  )
  values (
    auth.uid(),
    requested_pattern_type,
    requested_effective_from
  );
end;
$$;

create table if not exists public.background_pain_check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  recorded_at timestamptz not null,
  severity integer not null check (severity between 1 and 10),
  functional_impact integer check (functional_impact between 1 and 10),
  pain_qualities text[] not null default '{}'::text[] check (
    pain_qualities <@ array[
      'sharp_stabbing',
      'electrical',
      'icicles',
      'burning',
      'throbbing',
      'dull',
      'other'
    ]::text[]
  ),
  pain_quality_other text,
  notes text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists background_pain_check_ins_user_recorded_idx
on public.background_pain_check_ins (user_id, recorded_at desc);

alter table public.background_pain_check_ins enable row level security;

create policy "Users can view their own background pain check-ins"
on public.background_pain_check_ins
for select
using (auth.uid() = user_id);

create policy "Users can insert their own background pain check-ins"
on public.background_pain_check_ins
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own background pain check-ins"
on public.background_pain_check_ins
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own background pain check-ins"
on public.background_pain_check_ins
for delete
using (auth.uid() = user_id);

create table if not exists public.background_pain_check_in_face_points (
  id uuid primary key default gen_random_uuid(),
  check_in_id uuid not null references public.background_pain_check_ins (id) on delete cascade,
  x numeric(8, 3) not null check (x between 0 and 1000),
  y numeric(8, 3) not null check (y between 0 and 1000),
  division text not null check (division in ('v1', 'v2', 'v3')),
  location_key text not null,
  location_label text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists background_pain_check_in_face_points_check_in_idx
on public.background_pain_check_in_face_points (check_in_id);

alter table public.background_pain_check_in_face_points enable row level security;

create policy "Users can view their own background pain face points"
on public.background_pain_check_in_face_points
for select
using (
  exists (
    select 1
    from public.background_pain_check_ins
    where background_pain_check_ins.id = background_pain_check_in_face_points.check_in_id
      and background_pain_check_ins.user_id = auth.uid()
  )
);

create policy "Users can insert their own background pain face points"
on public.background_pain_check_in_face_points
for insert
with check (
  exists (
    select 1
    from public.background_pain_check_ins
    where background_pain_check_ins.id = background_pain_check_in_face_points.check_in_id
      and background_pain_check_ins.user_id = auth.uid()
  )
);

create policy "Users can delete their own background pain face points"
on public.background_pain_check_in_face_points
for delete
using (
  exists (
    select 1
    from public.background_pain_check_ins
    where background_pain_check_ins.id = background_pain_check_in_face_points.check_in_id
      and background_pain_check_ins.user_id = auth.uid()
  )
);

create or replace function public.create_background_pain_check_in(
  check_in_recorded_at timestamptz,
  check_in_severity integer,
  check_in_functional_impact integer,
  check_in_pain_qualities text[],
  check_in_pain_quality_other text,
  check_in_notes text,
  check_in_face_points jsonb default '[]'::jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  created_check_in_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  insert into public.background_pain_check_ins (
    user_id,
    recorded_at,
    severity,
    functional_impact,
    pain_qualities,
    pain_quality_other,
    notes
  )
  values (
    auth.uid(),
    check_in_recorded_at,
    check_in_severity,
    check_in_functional_impact,
    coalesce(check_in_pain_qualities, '{}'::text[]),
    nullif(trim(check_in_pain_quality_other), ''),
    nullif(trim(check_in_notes), '')
  )
  returning id into created_check_in_id;

  insert into public.background_pain_check_in_face_points (
    check_in_id,
    x,
    y,
    division,
    location_key,
    location_label
  )
  select
    created_check_in_id,
    point.x,
    point.y,
    point.division,
    point.location,
    point.label
  from jsonb_to_recordset(coalesce(check_in_face_points, '[]'::jsonb)) as point(
    x numeric,
    y numeric,
    division text,
    location text,
    label text
  );

  return created_check_in_id;
end;
$$;
