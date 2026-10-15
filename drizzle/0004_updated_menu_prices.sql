-- Transcribed from the supplied menu photos IMG_7874.jpg and IMG_7875.jpg.
-- Compared all 36 dishes with the existing menu: 9 increases, 1 decrease,
-- and 26 unchanged prices. Changes were noticed on 26 August 2026.
-- Use that observation date; the restaurant's exact change date is unknown.
-- Midnight Europe/Vienna on that date is UTC+02:00.
-- The preceding migration captures the original prices before these updates.

-- Bulgogi: EUR 11.50 -> EUR 12.50
SELECT set_dish_price(1, 1250, '2026-08-26 00:00:00+02', 'Noticed 26 August 2026; menu photo IMG_7874.jpg (0004_updated_menu_prices)');
--> statement-breakpoint
-- Gebratenes Huhn: EUR 10.90 -> EUR 11.50
SELECT set_dish_price(3, 1150, '2026-08-26 00:00:00+02', 'Noticed 26 August 2026; menu photo IMG_7874.jpg (0004_updated_menu_prices)');
--> statement-breakpoint
-- Hödup Bab: EUR 11.90 -> EUR 12.50
SELECT set_dish_price(8, 1250, '2026-08-26 00:00:00+02', 'Noticed 26 August 2026; menu photo IMG_7874.jpg (0004_updated_menu_prices)');
--> statement-breakpoint
-- Bulgogi Bento: EUR 12.90 -> EUR 13.50
SELECT set_dish_price(9, 1350, '2026-08-26 00:00:00+02', 'Noticed 26 August 2026; menu photo IMG_7874.jpg (0004_updated_menu_prices)');
--> statement-breakpoint
-- Lachs Bento: EUR 12.90 -> EUR 13.50
SELECT set_dish_price(10, 1350, '2026-08-26 00:00:00+02', 'Noticed 26 August 2026; menu photo IMG_7874.jpg (0004_updated_menu_prices)');
--> statement-breakpoint
-- Sushi Bento: EUR 11.90 -> EUR 12.50
SELECT set_dish_price(11, 1250, '2026-08-26 00:00:00+02', 'Noticed 26 August 2026; menu photo IMG_7874.jpg (0004_updated_menu_prices)');
--> statement-breakpoint
-- Bulgogi Sushi Bento: EUR 13.90 -> EUR 14.50
SELECT set_dish_price(12, 1450, '2026-08-26 00:00:00+02', 'Noticed 26 August 2026; menu photo IMG_7874.jpg (0004_updated_menu_prices)');
--> statement-breakpoint
-- Lachs Sushi Bento: EUR 13.90 -> EUR 14.50
SELECT set_dish_price(13, 1450, '2026-08-26 00:00:00+02', 'Noticed 26 August 2026; menu photo IMG_7874.jpg (0004_updated_menu_prices)');
--> statement-breakpoint
-- Kimbab (10 pieces): EUR 9.90 -> EUR 8.90 (decrease)
SELECT set_dish_price(23, 890, '2026-08-26 00:00:00+02', 'Noticed 26 August 2026; menu photo IMG_7874.jpg (0004_updated_menu_prices)');
--> statement-breakpoint
-- Sake Maki (6 pieces): EUR 4.40 -> EUR 5.40
SELECT set_dish_price(25, 540, '2026-08-26 00:00:00+02', 'Noticed 26 August 2026; menu photo IMG_7874.jpg (0004_updated_menu_prices)');
