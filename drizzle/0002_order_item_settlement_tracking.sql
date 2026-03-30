ALTER TABLE "order_items" ADD COLUMN "settled" boolean;
UPDATE "order_items" SET "settled" = false WHERE "settled" IS NULL;
ALTER TABLE "order_items" ALTER COLUMN "settled" SET NOT NULL;