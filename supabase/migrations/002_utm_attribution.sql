-- UTM attribution: one row per user per content item (first-wins)
create table public.utm_attribution (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  content_type text not null check (content_type in ('module', 'learning_path')),
  content_id text not null,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  first_seen_at timestamptz default now() not null,
  unique(user_id, content_type, content_id)
);

alter table public.utm_attribution enable row level security;

create policy "Users can view own utm_attribution"
  on public.utm_attribution for select using (auth.uid() = user_id);
create policy "Users can insert own utm_attribution"
  on public.utm_attribution for insert with check (auth.uid() = user_id);
