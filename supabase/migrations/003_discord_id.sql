-- Capture the Discord snowflake ID on profiles so downstream integrations
-- (e.g. the completion/rank-up webhook) can address a user in Discord.

alter table public.profiles add column discord_id text;

-- Backfill existing profiles from auth.identities, which Supabase populates
-- with the provider's account id (the Discord snowflake) for every OAuth link.
update public.profiles p
set discord_id = i.provider_id
from auth.identities i
where i.user_id = p.id
  and i.provider = 'discord'
  and p.discord_id is null;

-- Going forward, capture it at signup time too. auth.identities isn't written
-- yet when this trigger fires, so fall back to the raw OAuth claims Supabase
-- stashes on auth.users (provider_id, or sub as a last resort).
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, discord_id, discord_username, discord_avatar_url, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'provider_id', new.raw_user_meta_data ->> 'sub'),
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url',
    coalesce(
      new.raw_user_meta_data -> 'custom_claims' ->> 'global_name',
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name'
    )
  );
  return new;
end;
$$ language plpgsql security definer;
