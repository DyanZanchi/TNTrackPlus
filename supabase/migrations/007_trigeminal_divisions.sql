insert into public.face_area_options (id, label, normalized_label)
values
  ('33333333-3333-4333-8333-000000000007', 'V1 — Ophthalmic', 'v1'),
  ('33333333-3333-4333-8333-000000000008', 'V2 — Maxillary', 'v2'),
  ('33333333-3333-4333-8333-000000000009', 'V3 — Mandibular', 'v3')
on conflict (id) do update
set label = excluded.label,
    normalized_label = excluded.normalized_label;
