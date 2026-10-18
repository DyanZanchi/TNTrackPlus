alter table public.patient_medication_uses
add column if not exists follow_up jsonb;

create table if not exists public.patient_headache_patterns (
  user_id uuid not null references auth.users (id) on delete cascade,
  pattern_key text not null check (
    pattern_key in (
      'cluster_attacks',
      'hemifacial_spasm',
      'sunfa_face',
      'sunct_head',
      'suna_head',
      'hemicrania_continua'
    )
  ),
  status text not null check (
    status in ('now_under_one_year', 'now_and_past', 'past_only', 'never')
  ),
  long_course text check (long_course in ('yes', 'no')),
  autonomic_symptoms text check (autonomic_symptoms in ('yes', 'no')),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, pattern_key)
);

alter table public.patient_headache_patterns enable row level security;

create policy "Users can view their own headache patterns"
on public.patient_headache_patterns
for select
using (auth.uid() = user_id);

create policy "Users can insert their own headache patterns"
on public.patient_headache_patterns
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own headache patterns"
on public.patient_headache_patterns
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own headache patterns"
on public.patient_headache_patterns
for delete
using (auth.uid() = user_id);
