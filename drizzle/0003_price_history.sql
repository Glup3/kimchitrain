CREATE TABLE "dish_price_history" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "dish_price_history_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"dish_id" integer NOT NULL,
	"price_cents" integer NOT NULL,
	"effective_from" timestamp with time zone,
	"recorded_at" timestamp with time zone NOT NULL,
	"source" text NOT NULL,
	"is_baseline" boolean NOT NULL,
	CONSTRAINT "dish_price_history_nonnegative" CHECK ("dish_price_history"."price_cents" >= 0)
);
--> statement-breakpoint
ALTER TABLE "dish_price_history" ADD CONSTRAINT "dish_price_history_dish_id_dishes_id_fk" FOREIGN KEY ("dish_id") REFERENCES "public"."dishes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "dish_price_history_baseline" ON "dish_price_history" USING btree ("dish_id") WHERE "dish_price_history"."is_baseline";
--> statement-breakpoint
INSERT INTO dish_price_history (dish_id, price_cents, effective_from, recorded_at, source, is_baseline)
SELECT id, price_cents, NULL, transaction_timestamp(), 'Initial recorded price', true FROM dishes;
--> statement-breakpoint
CREATE FUNCTION set_dish_price(
  p_dish_id integer,
  p_price_cents integer,
  p_effective_from timestamptz DEFAULT NULL,
  p_source text DEFAULT 'Menu price update'
) RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  current_price integer;
BEGIN
  IF p_price_cents IS NULL OR p_price_cents < 0 THEN
    RAISE EXCEPTION 'Price must be a nonnegative integer in cents';
  END IF;
  IF p_source IS NULL OR btrim(p_source) = '' THEN
    RAISE EXCEPTION 'A source or migration name is required';
  END IF;
  IF p_effective_from > transaction_timestamp() THEN
    RAISE EXCEPTION 'Future prices are not supported; apply the migration when the price takes effect';
  END IF;
  SELECT price_cents INTO current_price FROM dishes WHERE id = p_dish_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Unknown dish: %', p_dish_id;
  END IF;
  IF current_price = p_price_cents AND EXISTS (SELECT 1 FROM dish_price_history WHERE dish_id = p_dish_id) THEN
    RETURN;
  END IF;
  UPDATE dishes SET price_cents = p_price_cents WHERE id = p_dish_id;
  INSERT INTO dish_price_history (dish_id, price_cents, effective_from, recorded_at, source, is_baseline)
  VALUES (p_dish_id, p_price_cents, p_effective_from, transaction_timestamp(), p_source, false);
END;
$$;
