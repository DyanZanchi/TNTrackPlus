alter table public.episodes
add column if not exists duration_status text not null default 'known',
add column if not exists background_severity_before integer,
add column if not exists numbness_location text,
add column if not exists numbness_onset_date date,
add column if not exists numbness_onset_unknown boolean not null default false,
add column if not exists numbness_after_procedure text,
add column if not exists numbness_procedure_note text,
add column if not exists numbness_timing text,
add column if not exists pain_changed_during text,
add column if not exists pain_change_summary text;

alter table public.episodes
drop constraint if exists episodes_duration_status_check;

alter table public.episodes
add constraint episodes_duration_status_check
check (duration_status in ('known', 'unknown', 'ongoing'));

alter table public.episodes
drop constraint if exists episodes_duration_seconds_check;

alter table public.episodes
alter column duration_seconds drop not null;

alter table public.episodes
add constraint episodes_duration_seconds_check
check (duration_seconds is null or duration_seconds between 1 and 1209600);

alter table public.episodes
drop constraint if exists episodes_duration_minutes_check;

alter table public.episodes
alter column duration_minutes drop not null;

alter table public.episodes
add constraint episodes_duration_minutes_check
check (duration_minutes is null or duration_minutes between 1 and 20160);

alter table public.episodes
drop constraint if exists episodes_background_severity_before_check;

alter table public.episodes
add constraint episodes_background_severity_before_check
check (background_severity_before is null or background_severity_before between 1 and 10);

alter table public.episodes
drop constraint if exists episodes_numbness_after_procedure_check;

alter table public.episodes
add constraint episodes_numbness_after_procedure_check
check (
  numbness_after_procedure is null
  or numbness_after_procedure in ('yes', 'no', 'not_sure')
);

alter table public.episodes
drop constraint if exists episodes_numbness_timing_check;

alter table public.episodes
add constraint episodes_numbness_timing_check
check (
  numbness_timing is null
  or numbness_timing in ('current', 'past', 'not_sure')
);

alter table public.episodes
drop constraint if exists episodes_pain_changed_during_check;

alter table public.episodes
add constraint episodes_pain_changed_during_check
check (
  pain_changed_during is null
  or pain_changed_during in ('yes', 'no', 'not_sure')
);

alter table public.patient_profiles
add column if not exists clinician_evaluation_status text,
add column if not exists received_facial_pain_diagnosis text,
add column if not exists additional_undiagnosed_pain text;

alter table public.patient_profiles
drop constraint if exists patient_profiles_clinician_evaluation_status_check;

alter table public.patient_profiles
add constraint patient_profiles_clinician_evaluation_status_check
check (
  clinician_evaluation_status is null
  or clinician_evaluation_status in ('yes', 'no', 'prefer_not_to_say', 'not_sure')
);

alter table public.patient_profiles
drop constraint if exists patient_profiles_received_facial_pain_diagnosis_check;

alter table public.patient_profiles
add constraint patient_profiles_received_facial_pain_diagnosis_check
check (
  received_facial_pain_diagnosis is null
  or received_facial_pain_diagnosis in ('yes', 'no', 'not_sure')
);

alter table public.patient_profiles
drop constraint if exists patient_profiles_additional_undiagnosed_pain_check;

alter table public.patient_profiles
add constraint patient_profiles_additional_undiagnosed_pain_check
check (
  additional_undiagnosed_pain is null
  or additional_undiagnosed_pain in ('yes', 'no', 'not_sure')
);

create table if not exists public.relevant_history_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  event_type text not null check (
    event_type in (
      'accident_injury',
      'dental_work',
      'facial_pain_procedure',
      'other_procedure',
      'no_known_event',
      'not_sure'
    )
  ),
  event_date date,
  event_date_unknown boolean not null default false,
  symptoms_began_afterward text check (
    symptoms_began_afterward is null
    or symptoms_began_afterward in ('yes', 'no', 'not_sure')
  ),
  notes text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists relevant_history_events_user_idx
on public.relevant_history_events (user_id, created_at desc);

alter table public.relevant_history_events enable row level security;

create policy "Users can view their own relevant history events"
on public.relevant_history_events
for select
using (auth.uid() = user_id);

create policy "Users can insert their own relevant history events"
on public.relevant_history_events
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own relevant history events"
on public.relevant_history_events
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own relevant history events"
on public.relevant_history_events
for delete
using (auth.uid() = user_id);
