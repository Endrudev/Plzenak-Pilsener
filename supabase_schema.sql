-- Run this in Supabase SQL editor

create table events (
  id          serial primary key,
  name        text        not null,
  date        text,
  date_short  text,
  location    text,
  tags        text[]      default '{}',
  badge       text,
  badge_type  text,
  img_class   text,
  url         text,
  description text[]      default '{}',
  map_src     text,
  created_at  timestamptz default now()
);

-- Allow public read access (visitors can see events)
alter table events enable row level security;

create policy "Public read" on events
  for select using (true);

-- Allow authenticated users (admins) full access
create policy "Admin full access" on events
  for all using (auth.role() = 'authenticated');
