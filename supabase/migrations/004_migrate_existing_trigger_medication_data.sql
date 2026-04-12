insert into public.episode_triggers (episode_id, trigger_option_id)
select episodes.id, trigger_options.id
from public.episodes
join public.trigger_options
  on trigger_options.user_id is null
 and trigger_options.normalized_label = episodes.trigger_name
where episodes.trigger_name is not null
on conflict do nothing;

insert into public.episode_medications (episode_id, medication_option_id)
select episodes.id, medication_options.id
from public.episodes
join public.medication_options
  on medication_options.user_id is null
 and medication_options.normalized_label = case
   when episodes.medication_taken = 'none' then 'no_medication'
   else episodes.medication_taken
 end
where episodes.medication_taken is not null
on conflict do nothing;
