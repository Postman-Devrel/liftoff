-- LiftOff: Supabase schema for persistent user progress
-- Run this in the Supabase SQL editor or via `supabase db push`

-- Profiles table: one row per Discord-registered user
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  discord_username text,
  discord_avatar_url text,
  display_name text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Progress table: one row per completed step (normalized)
create table public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  step_id text not null,
  points_awarded integer not null default 10,
  completed_at timestamptz default now() not null,
  postman_user_id text,
  unique(user_id, step_id)
);

alter table public.progress enable row level security;

create policy "Users can view own progress"
  on public.progress for select using (auth.uid() = user_id);
create policy "Users can insert own progress"
  on public.progress for insert with check (auth.uid() = user_id);
create policy "Users can update own progress"
  on public.progress for update using (auth.uid() = user_id);
create policy "Users can delete own progress"
  on public.progress for delete using (auth.uid() = user_id);

-- Validation contexts: per-org context, supports org switching
create table public.validation_contexts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  postman_user_id text not null,
  context jsonb not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(user_id, postman_user_id)
);

alter table public.validation_contexts enable row level security;

create policy "Users can view own contexts"
  on public.validation_contexts for select using (auth.uid() = user_id);
create policy "Users can insert own contexts"
  on public.validation_contexts for insert with check (auth.uid() = user_id);
create policy "Users can update own contexts"
  on public.validation_contexts for update using (auth.uid() = user_id);

-- Computed view: total points per user
create or replace view public.user_points as
select
  user_id,
  coalesce(sum(points_awarded), 0) as total_points,
  count(*) as total_steps_completed
from public.progress
group by user_id;

-- Auto-create profile on Discord signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, discord_username, discord_avatar_url, display_name)
  values (
    new.id,
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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Org-switch function: deactivates old contexts, upserts new one
create or replace function public.switch_postman_org(
  p_user_id uuid,
  p_postman_user_id text,
  p_initial_context jsonb default '{}'
)
returns uuid as $$
declare
  v_context_id uuid;
begin
  update public.validation_contexts
  set is_active = false, updated_at = now()
  where user_id = p_user_id and is_active = true;

  insert into public.validation_contexts (user_id, postman_user_id, context, is_active)
  values (p_user_id, p_postman_user_id, p_initial_context, true)
  on conflict (user_id, postman_user_id) do update
  set is_active = true, context = p_initial_context, updated_at = now()
  returning id into v_context_id;

  return v_context_id;
end;
$$ language plpgsql security definer;
