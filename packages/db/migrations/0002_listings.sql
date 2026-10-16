CREATE TABLE "listings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" text NOT NULL,
	"name" text NOT NULL,
	"locality" text,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL,
	"material_id" text NOT NULL,
	"tons_per_month" double precision NOT NULL,
	"moisture" double precision,
	"seasonality" text,
	"current_alternative" text,
	"sector" text,
	"contact_name" text,
	"contact_phone" text,
	"contact_email" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"ip_hash" text,
	CONSTRAINT "listings_kind_check" CHECK ("listings"."kind" in ('oferta', 'demanda')),
	CONSTRAINT "listings_name_check" CHECK (char_length("listings"."name") between 2 and 80 and "listings"."name" !~ '[[:cntrl:]]'),
	CONSTRAINT "listings_locality_check" CHECK ("listings"."locality" is null or char_length("listings"."locality") <= 60),
	CONSTRAINT "listings_lat_check" CHECK ("listings"."lat" between -31.5 and -25.5),
	CONSTRAINT "listings_lng_check" CHECK ("listings"."lng" between -60.5 and -53),
	CONSTRAINT "listings_tons_check" CHECK ("listings"."tons_per_month" between 1 and 100000),
	CONSTRAINT "listings_moisture_check" CHECK ("listings"."moisture" is null or "listings"."moisture" between 0 and 0.7),
	CONSTRAINT "listings_seasonality_check" CHECK ("listings"."seasonality" is null or char_length("listings"."seasonality") <= 60),
	CONSTRAINT "listings_sector_check" CHECK ("listings"."sector" is null or "listings"."sector" in ('yerbatera', 'central_biomasa', 'citricola', 'secadero_granos', 'frigorifico')),
	CONSTRAINT "listings_demand_fields_check" CHECK ("listings"."kind" = 'oferta' or ("listings"."current_alternative" is not null and "listings"."sector" is not null)),
	CONSTRAINT "listings_contact_name_check" CHECK ("listings"."contact_name" is null or char_length("listings"."contact_name") <= 60),
	CONSTRAINT "listings_contact_phone_check" CHECK ("listings"."contact_phone" is null or "listings"."contact_phone" ~ '^[0-9 +()-]{8,20}$'),
	CONSTRAINT "listings_contact_email_check" CHECK ("listings"."contact_email" is null or (char_length("listings"."contact_email") <= 120 and "listings"."contact_email" ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$')),
	CONSTRAINT "listings_contact_required_check" CHECK ("listings"."contact_phone" is not null or "listings"."contact_email" is not null)
);
--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_material_id_materials_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_current_alternative_alternatives_id_fk" FOREIGN KEY ("current_alternative") REFERENCES "public"."alternatives"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "listings_created_at_idx" ON "listings" USING btree ("created_at");