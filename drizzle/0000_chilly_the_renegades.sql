CREATE TABLE "dish_groups" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dishes" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"price_cents" integer NOT NULL,
	"description" text NOT NULL,
	"is_popular" boolean NOT NULL,
	"group_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"orderer" text NOT NULL,
	"price_cents" integer NOT NULL,
	"dish_id" integer NOT NULL,
	"order_id" varchar(26) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"completed" boolean NOT NULL,
	"created_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "dishes" ADD CONSTRAINT "dishes_group_id_dish_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."dish_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_dish_id_dishes_id_fk" FOREIGN KEY ("dish_id") REFERENCES "public"."dishes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;