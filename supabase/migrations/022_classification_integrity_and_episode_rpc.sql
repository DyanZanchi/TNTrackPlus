alter table public.episodes
drop constraint if exists episodes_pain_qualities_check;

alter table public.episodes
add constraint episodes_pain_qualities_check
check (
  pain_qualities <@ array[
    'sharp_stabbing',
    'shooting',
    'electrical',
    'pins_needles',
    'icicles',
    'burning',
    'throbbing',
    'dull',
    'other'
  ]::text[]
);

alter table public.background_pain_check_ins
drop constraint if exists background_pain_check_ins_pain_qualities_check;

alter table public.background_pain_check_ins
add constraint background_pain_check_ins_pain_qualities_check
check (
  pain_qualities <@ array[
    'sharp_stabbing',
    'shooting',
    'electrical',
    'pins_needles',
    'icicles',
    'burning',
    'throbbing',
    'dull',
    'other'
  ]::text[]
);

insert into public.trigger_options (id, user_id, label, normalized_label, is_active)
values (
  '11111111-1111-4111-8111-000000000009',
  null,
  'Not sure',
  'not_sure',
  true
)
on conflict (id) do update
set label = excluded.label,
    normalized_label = excluded.normalized_label,
    is_active = excluded.is_active;

insert into public.pain_type_options (id, user_id, label, normalized_label, is_active)
values
  ('44444444-4444-4444-8444-000000000005', null, 'TMJ / TMD', 'tmj_tmd', true),
  ('44444444-4444-4444-8444-000000000006', null, 'Glossopharyngeal Neuralgia', 'glossopharyngeal_neuralgia', true),
  ('44444444-4444-4444-8444-000000000007', null, 'Burning Mouth Syndrome', 'burning_mouth_syndrome', true),
  ('44444444-4444-4444-8444-000000000008', null, 'Persistent Idiopathic Facial Pain', 'persistent_idiopathic_facial_pain', true)
on conflict (id) do update
set label = excluded.label,
    normalized_label = excluded.normalized_label,
    is_active = excluded.is_active;

create table if not exists public.patient_described_patterns (
  user_id uuid not null references auth.users (id) on delete cascade,
  pattern_key text not null check (
    pattern_key in (
      'shock_like_paroxysmal',
      'background_between_shocks',
      'postherpetic_neuropathic',
      'glossopharyngeal_sharp',
      'geniculate_sharp',
      'occipital_shooting',
      'burning_mouth',
      'persistent_idiopathic_facial'
    )
  ),
  status text not null check (status in ('have_now', 'had_past', 'never')),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, pattern_key)
);

alter table public.patient_described_patterns enable row level security;

create policy "Users can view their own described patterns"
on public.patient_described_patterns
for select
using (auth.uid() = user_id);

create policy "Users can insert their own described patterns"
on public.patient_described_patterns
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own described patterns"
on public.patient_described_patterns
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own described patterns"
on public.patient_described_patterns
for delete
using (auth.uid() = user_id);

create or replace function public.create_episode(
  episode_payload jsonb,
  pain_type_option_ids uuid[] default '{}'::uuid[],
  trigger_option_ids uuid[] default '{}'::uuid[],
  face_area_option_ids uuid[] default '{}'::uuid[],
  face_points jsonb default '[]'::jsonb,
  medication_option_ids uuid[] default '{}'::uuid[]
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  created_episode_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  insert into public.episodes (
    user_id,
    pain_type,
    pain_qualities,
    pain_quality_other,
    had_numbness,
    numbness_location,
    numbness_onset_date,
    numbness_onset_unknown,
    numbness_after_procedure,
    numbness_procedure_note,
    numbness_timing,
    throbbing_associations,
    pain_pattern,
    pulse_duration_seconds,
    face_area,
    severity,
    functional_impact,
    background_severity_before,
    duration_status,
    duration_minutes,
    duration_seconds,
    pain_changed_during,
    pain_change_summary,
    onset_at,
    notes,
    treatment_history_changed,
    treatment_change_date,
    treatment_history_snapshot,
    trigger_name,
    medication_taken
  )
  values (
    auth.uid(),
    episode_payload->>'pain_type',
    case
      when jsonb_typeof(episode_payload->'pain_qualities') = 'array'
        then array(select jsonb_array_elements_text(episode_payload->'pain_qualities'))
      else '{}'::text[]
    end,
    nullif(episode_payload->>'pain_quality_other', ''),
    episode_payload->>'had_numbness',
    nullif(episode_payload->>'numbness_location', ''),
    nullif(episode_payload->>'numbness_onset_date', '')::date,
    coalesce((episode_payload->>'numbness_onset_unknown')::boolean, false),
    nullif(episode_payload->>'numbness_after_procedure', ''),
    nullif(episode_payload->>'numbness_procedure_note', ''),
    nullif(episode_payload->>'numbness_timing', ''),
    case
      when jsonb_typeof(episode_payload->'throbbing_associations') = 'array'
        then array(select jsonb_array_elements_text(episode_payload->'throbbing_associations'))
      else '{}'::text[]
    end,
    episode_payload->>'pain_pattern',
    nullif(episode_payload->>'pulse_duration_seconds', '')::integer,
    episode_payload->>'face_area',
    (episode_payload->>'severity')::integer,
    nullif(episode_payload->>'functional_impact', '')::integer,
    nullif(episode_payload->>'background_severity_before', '')::integer,
    coalesce(episode_payload->>'duration_status', 'known'),
    nullif(episode_payload->>'duration_minutes', '')::integer,
    nullif(episode_payload->>'duration_seconds', '')::integer,
    nullif(episode_payload->>'pain_changed_during', ''),
    nullif(episode_payload->>'pain_change_summary', ''),
    (episode_payload->>'onset_at')::timestamptz,
    nullif(episode_payload->>'notes', ''),
    coalesce((episode_payload->>'treatment_history_changed')::boolean, false),
    nullif(episode_payload->>'treatment_change_date', '')::date,
    episode_payload->'treatment_history_snapshot',
    null,
    null
  )
  returning id into created_episode_id;

  insert into public.episode_pain_types (episode_id, pain_type_option_id)
  select created_episode_id, option_id
  from unnest(coalesce(pain_type_option_ids, '{}'::uuid[])) as option_id;

  insert into public.episode_triggers (episode_id, trigger_option_id)
  select created_episode_id, option_id
  from unnest(coalesce(trigger_option_ids, '{}'::uuid[])) as option_id;

  insert into public.episode_face_areas (episode_id, face_area_option_id)
  select created_episode_id, option_id
  from unnest(coalesce(face_area_option_ids, '{}'::uuid[])) as option_id;

  insert into public.episode_face_points (
    episode_id,
    x,
    y,
    division,
    location_key,
    location_label
  )
  select
    created_episode_id,
    point.x,
    point.y,
    point.division,
    point.location,
    point.label
  from jsonb_to_recordset(coalesce(face_points, '[]'::jsonb)) as point(
    x numeric,
    y numeric,
    division text,
    location text,
    label text
  );

  insert into public.episode_medications (episode_id, medication_option_id)
  select created_episode_id, option_id
  from unnest(coalesce(medication_option_ids, '{}'::uuid[])) as option_id;

  return created_episode_id;
end;
$$;
