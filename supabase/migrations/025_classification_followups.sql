alter table public.patient_described_patterns
drop constraint if exists patient_described_patterns_pattern_key_check;

alter table public.patient_described_patterns
add constraint patient_described_patterns_pattern_key_check
check (
  pattern_key in (
    'shock_like_paroxysmal',
    'background_between_shocks',
    'postherpetic_neuropathic',
    'glossopharyngeal_sharp',
    'glossopharyngeal_neuropathic',
    'geniculate_sharp',
    'geniculate_neuropathic',
    'occipital_shooting',
    'raeder_eye_pain',
    'ophthalmoplegic_neuropathy',
    'burning_mouth',
    'persistent_idiopathic_facial'
  )
);

create table if not exists public.patient_classification_followups (
  user_id uuid not null references auth.users (id) on delete cascade,
  answer_key text not null check (
    answer_key in (
      'shock_cause_ms',
      'shock_cause_space_occupying',
      'shock_cause_other_condition',
      'shock_cause_vascular_compression',
      'neuropathic_after_injury',
      'neuropathic_after_dental',
      'neuropathic_after_pain_procedure',
      'neuropathic_other_condition',
      'learned_cause_atypical'
    )
  ),
  answer text not null check (answer in ('yes', 'no')),
  detail_text text,
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, answer_key)
);

alter table public.patient_classification_followups enable row level security;

create policy "Users can view their own classification followups"
on public.patient_classification_followups
for select
using (auth.uid() = user_id);

create policy "Users can insert their own classification followups"
on public.patient_classification_followups
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own classification followups"
on public.patient_classification_followups
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own classification followups"
on public.patient_classification_followups
for delete
using (auth.uid() = user_id);
