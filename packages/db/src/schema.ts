import { sql } from 'drizzle-orm';
import { boolean, check, doublePrecision, index, jsonb, pgTable, primaryKey, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import type {
  AlternativeId,
  BuyerSector,
  DataLabel,
  GeneratorKind,
  ListingKind,
  MaterialId,
  MaterialState,
} from '@mapa/core/catalog';
import type { Meta } from './mappers/catalog-rows';

// Esquema de Mapa Circular NEA (Postgres estándar, sin dependencias de ningún proveedor).
//
// Números: `doublePrecision` (float8) en vez de `numeric`. Los valores del dominio son `number` de JS
// (float64): float8 los guarda y devuelve idénticos, sin conversión string<->number del driver
// (numeric vuelve como string) y sin pérdida. No hay dinero con precisión decimal fija: los precios son
// estimaciones o valores de fuente. Los límites (0..1, > 0) se aplican con checks.
//
// Trazabilidad: cada fila con varios valores etiquetados lleva `meta jsonb` = { campo: { tag, sourceIds, note } }
// (campos en camelCase, igual que en @mapa/core/data). `assumptions` guarda un solo valor por fila.

const sourceIds = () => text('source_ids').array().notNull().default(sql`'{}'::text[]`);
const meta = () => jsonb('meta').$type<Meta>().notNull().default(sql`'{}'::jsonb`);

export const sources = pgTable(
  'sources',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    url: text('url').notNull(),
    date: text('date').notNull(),
  },
  (t) => [check('sources_url_check', sql`${t.url} ~ '^https?://'`)],
);

export const materials = pgTable(
  'materials',
  {
    id: text('id').$type<MaterialId>().primaryKey(),
    name: text('name').notNull(),
    rawMoisture: doublePrecision('raw_moisture').notNull(),
    meta: meta(),
  },
  (t) => [check('materials_raw_moisture_check', sql`${t.rawMoisture} >= 0 and ${t.rawMoisture} < 1`)],
);

export const materialStates = pgTable(
  'material_states',
  {
    materialId: text('material_id')
      .$type<MaterialId>()
      .notNull()
      .references(() => materials.id, { onDelete: 'cascade' }),
    state: text('state').$type<MaterialState>().notNull(),
    bulkDensityTPerM3: doublePrecision('bulk_density_t_per_m3').notNull(),
    moisture: doublePrecision('moisture').notNull(),
    lhvMjPerKg: doublePrecision('lhv_mj_per_kg').notNull(),
    pricePerTon: doublePrecision('price_per_ton').notNull(),
    conditioningCostPerTon: doublePrecision('conditioning_cost_per_ton').notNull(),
    meta: meta(),
  },
  (t) => [
    primaryKey({ columns: [t.materialId, t.state] }),
    check('material_states_state_check', sql`${t.state} in ('suelto', 'compactado', 'pellet')`),
    check('material_states_bulk_density_check', sql`${t.bulkDensityTPerM3} > 0`),
    check('material_states_moisture_check', sql`${t.moisture} >= 0 and ${t.moisture} < 1`),
    check('material_states_lhv_check', sql`${t.lhvMjPerKg} > 0`),
    check('material_states_price_check', sql`${t.pricePerTon} >= 0`),
    check('material_states_conditioning_check', sql`${t.conditioningCostPerTon} >= 0`),
  ],
);

export const alternatives = pgTable(
  'alternatives',
  {
    id: text('id').$type<AlternativeId>().primaryKey(),
    name: text('name').notNull(),
    unit: text('unit').notNull(),
    pricePerUnit: doublePrecision('price_per_unit').notNull(),
    lhvMjPerUnit: doublePrecision('lhv_mj_per_unit').notNull(),
    efficiency: doublePrecision('efficiency').notNull(),
    biomassEfficiency: doublePrecision('biomass_efficiency').notNull(),
    meta: meta(),
  },
  (t) => [
    check('alternatives_price_check', sql`${t.pricePerUnit} > 0`),
    check('alternatives_lhv_check', sql`${t.lhvMjPerUnit} > 0`),
    check('alternatives_efficiency_check', sql`${t.efficiency} > 0 and ${t.efficiency} <= 1`),
    check('alternatives_biomass_efficiency_check', sql`${t.biomassEfficiency} > 0 and ${t.biomassEfficiency} <= 1`),
  ],
);

export const assumptions = pgTable(
  'assumptions',
  {
    key: text('key').primaryKey(),
    label: text('label').notNull(),
    unit: text('unit').notNull(),
    value: doublePrecision('value').notNull(),
    tag: text('tag').$type<DataLabel>().notNull(),
    sourceIds: sourceIds(),
    note: text('note'),
  },
  (t) => [check('assumptions_tag_check', sql`${t.tag} in ('real', 'estimado')`)],
);

export const generators = pgTable(
  'generators',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    kind: text('kind').$type<GeneratorKind>().notNull(),
    locality: text('locality').notNull(),
    lat: doublePrecision('lat').notNull(),
    lng: doublePrecision('lng').notNull(),
    locationNote: text('location_note').notNull(),
    materialId: text('material_id')
      .$type<MaterialId>()
      .notNull()
      .references(() => materials.id),
    tonsPerMonth: doublePrecision('tons_per_month').notNull(),
    seasonality: text('seasonality').notNull(),
    sourceIds: sourceIds(),
    meta: meta(),
  },
  (t) => [
    index('generators_material_id_idx').on(t.materialId),
    check('generators_kind_check', sql`${t.kind} in ('aserradero', 'molino_arrocero', 'foresto_industria')`),
    check('generators_lat_check', sql`${t.lat} between -90 and 90`),
    check('generators_lng_check', sql`${t.lng} between -180 and 180`),
    check('generators_tons_check', sql`${t.tonsPerMonth} >= 0`),
  ],
);

export const buyers = pgTable(
  'buyers',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    sector: text('sector').$type<BuyerSector>().notNull(),
    locality: text('locality').notNull(),
    lat: doublePrecision('lat').notNull(),
    lng: doublePrecision('lng').notNull(),
    locationNote: text('location_note').notNull(),
    currentAlternative: text('current_alternative')
      .$type<AlternativeId>()
      .notNull()
      .references(() => alternatives.id),
    demandTonsPerMonth: doublePrecision('demand_tons_per_month').notNull(),
    accepts: text('accepts').$type<MaterialId>().array().notNull().default(sql`'{}'::text[]`),
    sourceIds: sourceIds(),
    meta: meta(),
  },
  (t) => [
    index('buyers_current_alternative_idx').on(t.currentAlternative),
    check('buyers_sector_check', sql`${t.sector} in ('yerbatera', 'central_biomasa', 'citricola', 'secadero_granos', 'frigorifico')`),
    check('buyers_lat_check', sql`${t.lat} between -90 and 90`),
    check('buyers_lng_check', sql`${t.lng} between -180 and 180`),
    check('buyers_demand_check', sql`${t.demandTonsPerMonth} >= 0`),
  ],
);

// Publicaciones abiertas (F1): ofertas y demandas declaradas por cualquiera, sin cuenta ni verificación.
// Los checks replican `validateListing` de @mapa/core/listings. El contacto (contact_*) nunca sale en el
// catálogo; solo lo lee GET /api/listings/:id/contact. `ip_hash` es SHA-256 salado (no la IP en claro).
export const listings = pgTable(
  'listings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    kind: text('kind').$type<ListingKind>().notNull(),
    name: text('name').notNull(),
    locality: text('locality'),
    lat: doublePrecision('lat').notNull(),
    lng: doublePrecision('lng').notNull(),
    materialId: text('material_id')
      .$type<MaterialId>()
      .notNull()
      .references(() => materials.id),
    tonsPerMonth: doublePrecision('tons_per_month').notNull(),
    moisture: doublePrecision('moisture'),
    seasonality: text('seasonality'),
    currentAlternative: text('current_alternative')
      .$type<AlternativeId>()
      .references(() => alternatives.id),
    sector: text('sector').$type<BuyerSector>(),
    contactName: text('contact_name'),
    contactPhone: text('contact_phone'),
    contactEmail: text('contact_email'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
    verified: boolean('verified').notNull().default(false),
    ipHash: text('ip_hash'),
  },
  (t) => [
    index('listings_created_at_idx').on(t.createdAt),
    check('listings_kind_check', sql`${t.kind} in ('oferta', 'demanda')`),
    check('listings_name_check', sql`char_length(${t.name}) between 2 and 80 and ${t.name} !~ '[[:cntrl:]]'`),
    check('listings_locality_check', sql`${t.locality} is null or char_length(${t.locality}) <= 60`),
    check('listings_lat_check', sql`${t.lat} between -31.5 and -25.5`),
    check('listings_lng_check', sql`${t.lng} between -60.5 and -53`),
    check('listings_tons_check', sql`${t.tonsPerMonth} between 1 and 100000`),
    check('listings_moisture_check', sql`${t.moisture} is null or ${t.moisture} between 0 and 0.7`),
    check('listings_seasonality_check', sql`${t.seasonality} is null or char_length(${t.seasonality}) <= 60`),
    check(
      'listings_sector_check',
      sql`${t.sector} is null or ${t.sector} in ('yerbatera', 'central_biomasa', 'citricola', 'secadero_granos', 'frigorifico')`,
    ),
    check(
      'listings_demand_fields_check',
      sql`${t.kind} = 'oferta' or (${t.currentAlternative} is not null and ${t.sector} is not null)`,
    ),
    check('listings_contact_name_check', sql`${t.contactName} is null or char_length(${t.contactName}) <= 60`),
    check('listings_contact_phone_check', sql`${t.contactPhone} is null or ${t.contactPhone} ~ '^[0-9 +()-]{8,20}$'`),
    check(
      'listings_contact_email_check',
      sql`${t.contactEmail} is null or (char_length(${t.contactEmail}) <= 120 and ${t.contactEmail} ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$')`,
    ),
    check('listings_contact_required_check', sql`${t.contactPhone} is not null or ${t.contactEmail} is not null`),
  ],
);

// Contacto corporativo público de los establecimientos curados (sin FK: el id es el de un generador o
// comprador). No va en `generators`/`buyers` ni en el catálogo: solo lo lee GET /api/listings/:id/contact.
export const contacts = pgTable(
  'contacts',
  {
    entityId: text('entity_id').primaryKey(),
    name: text('name').notNull(),
    website: text('website'),
    phone: text('phone'),
    email: text('email'),
    sourceIds: text('source_ids').array().notNull(),
  },
  (t) => [
    check('contacts_name_check', sql`char_length(${t.name}) between 2 and 80 and ${t.name} !~ '[[:cntrl:]]'`),
    check('contacts_website_check', sql`${t.website} is null or ${t.website} ~ '^https://'`),
    check('contacts_phone_check', sql`${t.phone} is null or ${t.phone} ~ '^[0-9 +()-]{8,20}$'`),
    check(
      'contacts_email_check',
      sql`${t.email} is null or (char_length(${t.email}) <= 120 and ${t.email} ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$')`,
    ),
    check('contacts_any_check', sql`${t.website} is not null or ${t.phone} is not null or ${t.email} is not null`),
    check('contacts_source_ids_check', sql`cardinality(${t.sourceIds}) > 0`),
  ],
);
