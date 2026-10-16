-- Esquema inicial de Mapa Circular NEA. Los datos vienen de src/data (ver supabase/seed.sql).
--
-- Trazabilidad: cada valor del dominio es "etiquetado" (valor + tag real|estimado + fuentes + nota).
-- Para no multiplicar columnas, cada fila con varios valores etiquetados tiene una columna
-- `meta jsonb` con un objeto { campo: { "tag": "real|estimado", "sourceIds": [...], "note": "..." } }
-- (nombres de campo en camelCase, igual que en src/data). `assumptions` guarda un solo valor por fila,
-- por eso lleva columnas planas tag / source_ids / note.
-- Acceso: solo lectura pública (RLS). No hay políticas de escritura.

create table public.sources (
  id    text primary key,
  title text not null,
  url   text not null check (url ~ '^https?://'),
  date  text not null
);

create table public.materials (
  id           text primary key,
  name         text not null,
  raw_moisture numeric not null check (raw_moisture >= 0 and raw_moisture < 1),
  meta         jsonb not null default '{}'::jsonb
);

create table public.material_states (
  material_id               text not null references public.materials (id) on delete cascade,
  state                     text not null check (state in ('suelto', 'compactado', 'pellet')),
  bulk_density_t_per_m3     numeric not null check (bulk_density_t_per_m3 > 0),
  moisture                  numeric not null check (moisture >= 0 and moisture < 1),
  lhv_mj_per_kg             numeric not null check (lhv_mj_per_kg > 0),
  price_per_ton             numeric not null check (price_per_ton >= 0),
  conditioning_cost_per_ton numeric not null check (conditioning_cost_per_ton >= 0),
  meta                      jsonb not null default '{}'::jsonb,
  primary key (material_id, state)
);

create table public.alternatives (
  id                 text primary key,
  name               text not null,
  unit               text not null,
  price_per_unit     numeric not null check (price_per_unit > 0),
  lhv_mj_per_unit    numeric not null check (lhv_mj_per_unit > 0),
  efficiency         numeric not null check (efficiency > 0 and efficiency <= 1),
  biomass_efficiency numeric not null check (biomass_efficiency > 0 and biomass_efficiency <= 1),
  meta               jsonb not null default '{}'::jsonb
);

create table public.assumptions (
  key        text primary key,
  label      text not null,
  unit       text not null,
  value      numeric not null,
  tag        text not null check (tag in ('real', 'estimado')),
  source_ids text[] not null default '{}',
  note       text
);

create table public.generators (
  id             text primary key,
  name           text not null,
  kind           text not null check (kind in ('aserradero', 'molino_arrocero', 'foresto_industria')),
  locality       text not null,
  lat            double precision not null check (lat between -90 and 90),
  lng            double precision not null check (lng between -180 and 180),
  location_note  text not null,
  material_id    text not null references public.materials (id),
  tons_per_month numeric not null check (tons_per_month >= 0),
  seasonality    text not null,
  source_ids     text[] not null default '{}',
  meta           jsonb not null default '{}'::jsonb
);

create table public.buyers (
  id                    text primary key,
  name                  text not null,
  sector                text not null check (sector in ('yerbatera', 'central_biomasa', 'citricola', 'secadero_granos', 'frigorifico')),
  locality              text not null,
  lat                   double precision not null check (lat between -90 and 90),
  lng                   double precision not null check (lng between -180 and 180),
  location_note         text not null,
  current_alternative   text not null references public.alternatives (id),
  demand_tons_per_month numeric not null check (demand_tons_per_month >= 0),
  accepts               text[] not null default '{}',
  source_ids            text[] not null default '{}',
  meta                  jsonb not null default '{}'::jsonb
);

create index generators_material_id_idx on public.generators (material_id);
create index buyers_current_alternative_idx on public.buyers (current_alternative);

-- Row Level Security: lectura pública, sin escritura.
alter table public.sources         enable row level security;
alter table public.materials       enable row level security;
alter table public.material_states enable row level security;
alter table public.alternatives    enable row level security;
alter table public.assumptions     enable row level security;
alter table public.generators      enable row level security;
alter table public.buyers          enable row level security;

create policy "lectura publica" on public.sources         for select to anon, authenticated using (true);
create policy "lectura publica" on public.materials       for select to anon, authenticated using (true);
create policy "lectura publica" on public.material_states for select to anon, authenticated using (true);
create policy "lectura publica" on public.alternatives    for select to anon, authenticated using (true);
create policy "lectura publica" on public.assumptions     for select to anon, authenticated using (true);
create policy "lectura publica" on public.generators      for select to anon, authenticated using (true);
create policy "lectura publica" on public.buyers          for select to anon, authenticated using (true);

-- Privilegios mínimos: solo lectura para los roles de la API pública.
revoke all on all tables in schema public from anon, authenticated;
grant select on public.sources, public.materials, public.material_states, public.alternatives,
  public.assumptions, public.generators, public.buyers to anon, authenticated;
alter default privileges in schema public revoke all on tables from anon, authenticated;
