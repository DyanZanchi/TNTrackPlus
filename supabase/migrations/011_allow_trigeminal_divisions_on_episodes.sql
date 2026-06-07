alter table public.episodes
drop constraint if exists episodes_face_area_check;

alter table public.episodes
add constraint episodes_face_area_check check (
  face_area in (
    'left_cheek',
    'right_cheek',
    'jaw',
    'upper_lip',
    'lower_lip',
    'eye_forehead',
    'multiple_areas',
    'v1',
    'v2',
    'v3'
  )
);
