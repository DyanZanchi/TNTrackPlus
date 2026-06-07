alter table public.patient_profiles
add column if not exists pain_type text check (
  pain_type is null or pain_type in (
    'trigeminal_neuralgia',
    'geniculate_neuralgia',
    'anesthesia_dolorosa',
    'occipital_neuralgia'
  )
);

alter table public.patient_profile_revisions
add column if not exists pain_type text;
