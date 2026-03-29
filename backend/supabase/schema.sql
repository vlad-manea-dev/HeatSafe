-- Enable UUID generation
create extension if not exists "pgcrypto";

-- PEOPLE
create table if not exists people (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  dob           date not null,
  address       text,
  phone         text,
  floor         integer not null default 1,
  south_facing  boolean not null default false,
  lives_alone   boolean not null default false,
  low_green_cover boolean not null default false,
  conditions    text[] not null default '{}'
);

-- MEDICATIONS
create table if not exists medications (
  id          uuid primary key default gen_random_uuid(),
  person_id   uuid references people(id) on delete cascade,
  drug_class  text not null,
  multiplier  float not null default 1.0
);

-- SCORES
create table if not exists scores (
  id              uuid primary key default gen_random_uuid(),
  person_id       uuid references people(id) on delete cascade,
  date            date not null default current_date,
  base_temp       float not null,
  final_score     integer not null,
  breakdown_json  jsonb
);

-- SEED: María García (HIGH RISK)
-- Age 76, top floor (4), south-facing, lives alone, heart condition, in Triana, Seville
insert into people (id, name, dob, address, phone, floor, south_facing, lives_alone, low_green_cover, conditions)
values (
  'aaaaaaaa-0000-0000-0000-000000000001',
  'María García',
  '1948-03-15',
  'Calle Betis 12, 4º, Triana, Sevilla 41010',
  '+34 654 111 222',
  4,
  true,
  true,
  true,
  array['heart_condition']
);

insert into medications (person_id, drug_class, multiplier)
values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'diuretics',     1.3),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'beta_blockers',  1.2);

-- SEED: Pablo Martínez (LOW RISK)
-- Age 33, ground floor, not alone, no conditions, in Nervión, Seville
insert into people (id, name, dob, address, phone, floor, south_facing, lives_alone, low_green_cover, conditions)
values (
  'aaaaaaaa-0000-0000-0000-000000000002',
  'Pablo Martínez',
  '1991-07-22',
  'Avenida de la Buharia 8, 1º, Nervión, Sevilla 41005',
  '+34 666 555 444',
  1,
  false,
  false,
  false,
  array[]::text[]
);
-- No medications for Pablo
