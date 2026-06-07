create table if not exists public.patient_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  age integer check (age is null or (age between 1 and 120)),
  gender text check (
    gender is null or gender in ('female', 'male', 'non_binary', 'prefer_not_to_say', 'other')
  ),
  gender_other text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.patient_prior_treatments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  treatment_type text not null check (
    treatment_type in (
      'mvd',
      'glycerin_rhizotomy',
      'radiofrequency',
      'balloon_rhizotomy',
      'gamma_knife',
      'cyberknife',
      'other'
    )
  ),
  other_label text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.patient_other_therapies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  therapy_type text not null check (
    therapy_type in ('holistic_therapy', 'acupuncture', 'meditation', 'other')
  ),
  other_label text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.patient_profile_revisions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  age integer,
  gender text,
  gender_other text,
  prior_treatments jsonb not null default '[]'::jsonb,
  other_therapies jsonb not null default '[]'::jsonb,
  treatment_history_changed boolean not null default false,
  source text not null check (source in ('profile', 'episode')),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists patient_prior_treatments_user_idx
on public.patient_prior_treatments (user_id);

create index if not exists patient_other_therapies_user_idx
on public.patient_other_therapies (user_id);

create index if not exists patient_profile_revisions_user_idx
on public.patient_profile_revisions (user_id, created_at desc);

alter table public.patient_profiles enable row level security;
alter table public.patient_prior_treatments enable row level security;
alter table public.patient_other_therapies enable row level security;
alter table public.patient_profile_revisions enable row level security;

create policy "Users can read their patient profile"
on public.patient_profiles
for select
using (auth.uid() = user_id);

create policy "Users can insert their patient profile"
on public.patient_profiles
for insert
with check (auth.uid() = user_id);

create policy "Users can update their patient profile"
on public.patient_profiles
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can read their prior treatments"
on public.patient_prior_treatments
for select
using (auth.uid() = user_id);

create policy "Users can insert their prior treatments"
on public.patient_prior_treatments
for insert
with check (auth.uid() = user_id);

create policy "Users can delete their prior treatments"
on public.patient_prior_treatments
for delete
using (auth.uid() = user_id);

create policy "Users can read their other therapies"
on public.patient_other_therapies
for select
using (auth.uid() = user_id);

create policy "Users can insert their other therapies"
on public.patient_other_therapies
for insert
with check (auth.uid() = user_id);

create policy "Users can delete their other therapies"
on public.patient_other_therapies
for delete
using (auth.uid() = user_id);

create policy "Users can read their profile revisions"
on public.patient_profile_revisions
for select
using (auth.uid() = user_id);

create policy "Users can insert their profile revisions"
on public.patient_profile_revisions
for insert
with check (auth.uid() = user_id);

alter table public.episodes
add column if not exists treatment_history_changed boolean;
