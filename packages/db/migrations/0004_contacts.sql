CREATE TABLE "contacts" (
	"entity_id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"website" text,
	"phone" text,
	"email" text,
	"source_ids" text[] NOT NULL,
	CONSTRAINT "contacts_name_check" CHECK (char_length("contacts"."name") between 2 and 80 and "contacts"."name" !~ '[[:cntrl:]]'),
	CONSTRAINT "contacts_website_check" CHECK ("contacts"."website" is null or "contacts"."website" ~ '^https://'),
	CONSTRAINT "contacts_phone_check" CHECK ("contacts"."phone" is null or "contacts"."phone" ~ '^[0-9 +()-]{8,20}$'),
	CONSTRAINT "contacts_email_check" CHECK ("contacts"."email" is null or (char_length("contacts"."email") <= 120 and "contacts"."email" ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$')),
	CONSTRAINT "contacts_any_check" CHECK ("contacts"."website" is not null or "contacts"."phone" is not null or "contacts"."email" is not null),
	CONSTRAINT "contacts_source_ids_check" CHECK (cardinality("contacts"."source_ids") > 0)
);

--> statement-breakpoint
GRANT SELECT ON contacts TO mapa_readonly;
