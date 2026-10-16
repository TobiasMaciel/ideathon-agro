CREATE TABLE "alternatives" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"unit" text NOT NULL,
	"price_per_unit" double precision NOT NULL,
	"lhv_mj_per_unit" double precision NOT NULL,
	"efficiency" double precision NOT NULL,
	"biomass_efficiency" double precision NOT NULL,
	"meta" jsonb DEFAULT '{}'::jsonb NOT NULL,
	CONSTRAINT "alternatives_price_check" CHECK ("alternatives"."price_per_unit" > 0),
	CONSTRAINT "alternatives_lhv_check" CHECK ("alternatives"."lhv_mj_per_unit" > 0),
	CONSTRAINT "alternatives_efficiency_check" CHECK ("alternatives"."efficiency" > 0 and "alternatives"."efficiency" <= 1),
	CONSTRAINT "alternatives_biomass_efficiency_check" CHECK ("alternatives"."biomass_efficiency" > 0 and "alternatives"."biomass_efficiency" <= 1)
);
--> statement-breakpoint
CREATE TABLE "assumptions" (
	"key" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"unit" text NOT NULL,
	"value" double precision NOT NULL,
	"tag" text NOT NULL,
	"source_ids" text[] DEFAULT '{}'::text[] NOT NULL,
	"note" text,
	CONSTRAINT "assumptions_tag_check" CHECK ("assumptions"."tag" in ('real', 'estimado'))
);
--> statement-breakpoint
CREATE TABLE "buyers" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"sector" text NOT NULL,
	"locality" text NOT NULL,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL,
	"location_note" text NOT NULL,
	"current_alternative" text NOT NULL,
	"demand_tons_per_month" double precision NOT NULL,
	"accepts" text[] DEFAULT '{}'::text[] NOT NULL,
	"source_ids" text[] DEFAULT '{}'::text[] NOT NULL,
	"meta" jsonb DEFAULT '{}'::jsonb NOT NULL,
	CONSTRAINT "buyers_sector_check" CHECK ("buyers"."sector" in ('yerbatera', 'central_biomasa', 'citricola', 'secadero_granos', 'frigorifico')),
	CONSTRAINT "buyers_lat_check" CHECK ("buyers"."lat" between -90 and 90),
	CONSTRAINT "buyers_lng_check" CHECK ("buyers"."lng" between -180 and 180),
	CONSTRAINT "buyers_demand_check" CHECK ("buyers"."demand_tons_per_month" >= 0)
);
--> statement-breakpoint
CREATE TABLE "generators" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"kind" text NOT NULL,
	"locality" text NOT NULL,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL,
	"location_note" text NOT NULL,
	"material_id" text NOT NULL,
	"tons_per_month" double precision NOT NULL,
	"seasonality" text NOT NULL,
	"source_ids" text[] DEFAULT '{}'::text[] NOT NULL,
	"meta" jsonb DEFAULT '{}'::jsonb NOT NULL,
	CONSTRAINT "generators_kind_check" CHECK ("generators"."kind" in ('aserradero', 'molino_arrocero', 'foresto_industria')),
	CONSTRAINT "generators_lat_check" CHECK ("generators"."lat" between -90 and 90),
	CONSTRAINT "generators_lng_check" CHECK ("generators"."lng" between -180 and 180),
	CONSTRAINT "generators_tons_check" CHECK ("generators"."tons_per_month" >= 0)
);
--> statement-breakpoint
CREATE TABLE "material_states" (
	"material_id" text NOT NULL,
	"state" text NOT NULL,
	"bulk_density_t_per_m3" double precision NOT NULL,
	"moisture" double precision NOT NULL,
	"lhv_mj_per_kg" double precision NOT NULL,
	"price_per_ton" double precision NOT NULL,
	"conditioning_cost_per_ton" double precision NOT NULL,
	"meta" jsonb DEFAULT '{}'::jsonb NOT NULL,
	CONSTRAINT "material_states_material_id_state_pk" PRIMARY KEY("material_id","state"),
	CONSTRAINT "material_states_state_check" CHECK ("material_states"."state" in ('suelto', 'compactado', 'pellet')),
	CONSTRAINT "material_states_bulk_density_check" CHECK ("material_states"."bulk_density_t_per_m3" > 0),
	CONSTRAINT "material_states_moisture_check" CHECK ("material_states"."moisture" >= 0 and "material_states"."moisture" < 1),
	CONSTRAINT "material_states_lhv_check" CHECK ("material_states"."lhv_mj_per_kg" > 0),
	CONSTRAINT "material_states_price_check" CHECK ("material_states"."price_per_ton" >= 0),
	CONSTRAINT "material_states_conditioning_check" CHECK ("material_states"."conditioning_cost_per_ton" >= 0)
);
--> statement-breakpoint
CREATE TABLE "materials" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"raw_moisture" double precision NOT NULL,
	"meta" jsonb DEFAULT '{}'::jsonb NOT NULL,
	CONSTRAINT "materials_raw_moisture_check" CHECK ("materials"."raw_moisture" >= 0 and "materials"."raw_moisture" < 1)
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"url" text NOT NULL,
	"date" text NOT NULL,
	CONSTRAINT "sources_url_check" CHECK ("sources"."url" ~ '^https?://')
);
--> statement-breakpoint
ALTER TABLE "buyers" ADD CONSTRAINT "buyers_current_alternative_alternatives_id_fk" FOREIGN KEY ("current_alternative") REFERENCES "public"."alternatives"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generators" ADD CONSTRAINT "generators_material_id_materials_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "material_states" ADD CONSTRAINT "material_states_material_id_materials_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "buyers_current_alternative_idx" ON "buyers" USING btree ("current_alternative");--> statement-breakpoint
CREATE INDEX "generators_material_id_idx" ON "generators" USING btree ("material_id");