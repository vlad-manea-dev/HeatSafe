-- Run this in Supabase SQL Editor

-- Users table (account info for carers / self-registered)
create table if not exists users (
  id         uuid primary key default gen_random_uuid(),
  email      text unique,
  name       text,
  phone      text,
  role       text check (role in ('self', 'carer')),
  created_at timestamp with time zone default now()
);

-- Carer relationships (links a user account to a person they care for)
create table if not exists carer_relationships (
  id         uuid primary key default gen_random_uuid(),
  carer_id   uuid references users(id) on delete cascade,
  person_id  uuid references people(id) on delete cascade
);

-- Add missing columns to people table (safe to run multiple times)
alter table people add column if not exists created_at timestamp with time zone default now();
alter table people add column if not exists lat  float;
alter table people add column if not exists lng  float;
alter table people add column if not exists zone_id text default 'nervion';
