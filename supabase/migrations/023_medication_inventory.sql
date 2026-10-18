create table if not exists public.patient_medication_uses (
  user_id uuid not null references auth.users (id) on delete cascade,
  catalog_key text not null,
  use_context text not null check (
    use_context in (
      'regular',
      'brain_fog',
      'rescue',
      'blood_pressure_rescue',
      'injectable',
      'otc',
      'topical_otc'
    )
  ),
  status text not null check (
    status in (
      'taking_now',
      'stopped',
      'never',
      'used_past_year',
      'used_earlier',
      'do_not_know',
      'used_past_week',
      'not_used'
    )
  ),
  times_per_day text,
  dose_amount numeric,
  dose_unknown boolean not null default false,
  administration text,
  administration_other text,
  formulation text,
  formulation_other text,
  stop_reasons text[] not null default '{}',
  stop_reason_other text,
  otc_frequency text,
  tablets_at_once text,
  strength_mg numeric,
  strength_unknown boolean not null default false,
  extra_strength text,
  nighttime text,
  other_text text,
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, catalog_key),
  constraint patient_medication_uses_stop_reasons_check check (
    stop_reasons <@ array[
      'difficult_side_effects',
      'not_relieving_pain',
      'no_longer_needed',
      'too_expensive',
      'changed_drug',
      'other',
      'do_not_know'
    ]::text[]
  )
);

alter table public.patient_medication_uses enable row level security;

create policy "Users can view their own medication uses"
on public.patient_medication_uses
for select
using (auth.uid() = user_id);

create policy "Users can insert their own medication uses"
on public.patient_medication_uses
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own medication uses"
on public.patient_medication_uses
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own medication uses"
on public.patient_medication_uses
for delete
using (auth.uid() = user_id);

create table if not exists public.patient_compounded_medications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  position integer not null check (position between 1 and 3),
  name text not null,
  ingredients text[] not null default '{}',
  ingredient_other text,
  form text,
  form_other text,
  effect text,
  still_using text,
  pharmacy_type text,
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, position),
  constraint patient_compounded_medications_ingredients_check check (
    ingredients <@ array[
      'carbamazepine',
      'oxcarbazepine',
      'clonazepam',
      'gabapentin',
      'ketamine',
      'rimegepant',
      'zavegepant',
      'lidocaine',
      'oxytocin',
      'other',
      'do_not_know'
    ]::text[]
  )
);

alter table public.patient_compounded_medications enable row level security;

create policy "Users can view their own compounded medications"
on public.patient_compounded_medications
for select
using (auth.uid() = user_id);

create policy "Users can insert their own compounded medications"
on public.patient_compounded_medications
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own compounded medications"
on public.patient_compounded_medications
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own compounded medications"
on public.patient_compounded_medications
for delete
using (auth.uid() = user_id);

create table if not exists public.patient_medication_context (
  user_id uuid primary key references auth.users (id) on delete cascade,
  compounded_used text,
  compounded_count integer,
  cannabis_used text,
  cannabis_medical_dispensary text,
  cannabis_open_dispensary text,
  cannabis_other_place text,
  cannabis_relief text,
  er_visited text,
  er_visit_count integer,
  er_sent_home_no_treatment text,
  er_given_opiate text,
  er_given_iv_anticonvulsant text,
  er_asked_for_named_protocol text,
  er_other_medication text,
  er_admitted text,
  er_felt_heard text,
  er_treated_as_drug_seeking text,
  medications_in_front text,
  answer_confidence text,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.patient_medication_context enable row level security;

create policy "Users can view their own medication context"
on public.patient_medication_context
for select
using (auth.uid() = user_id);

create policy "Users can insert their own medication context"
on public.patient_medication_context
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own medication context"
on public.patient_medication_context
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own medication context"
on public.patient_medication_context
for delete
using (auth.uid() = user_id);
