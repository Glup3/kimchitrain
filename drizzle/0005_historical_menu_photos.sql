-- Historical menu observations supplied by the user, not price-change dates.
-- recorded_at denotes when the menu was photographed/observed. Only the month
-- is known: the first day at midnight Europe/Vienna is a sorting placeholder.
-- effective_from stays NULL because the actual effective date is unknown.
-- Import every visible price, including unchanged prices; omit absent dishes.
-- Shared Bulgogi/Lachs bento prices apply to both existing dish variants.
-- Insert history directly: set_dish_price would overwrite today's menu prices.
-- The original basket baseline and saved order prices are left intact.

-- April 2022: 29 dishes.
INSERT INTO dish_price_history (dish_id, price_cents, effective_from, recorded_at, source, is_baseline)
SELECT dish_id, price_cents, NULL,
  TIMESTAMPTZ '2022-04-01 00:00:00+02',
  'Menu photos IMG_8408.jpeg; observed April 2022 (month only; day 1 is a placeholder)',
  false
FROM (VALUES
  (1, 940), -- Bulgogi
  (2, 890), -- Korean Fried Chicken
  (4, 940), -- Bulgogi Bibimbab
  (5, 840), -- Gemüse Bibimbab
  (6, 840), -- Gemüse Tofu Bab
  (7, 1140), -- Lachs Teriyaki Bab
  (8, 1040), -- Hödup Bab
  (14, 890), -- Tempura Maki
  (15, 890), -- California Maki
  (16, 790), -- Sake Sushi Klein
  (17, 1090), -- Sake Sushi Groß
  (18, 1290), -- Sake Sashimi Klein
  (19, 1650), -- Sake Sashimi Groß
  (20, 890), -- Bulgogi Maki
  (21, 350), -- Avocado Maki
  (22, 450), -- Ebi-Avocado Maki
  (24, 320), -- Gurken Maki
  (25, 390), -- Sake Maki
  (26, 840), -- Kimchi Noodle Soup
  (27, 840), -- Chicken Ramen
  (28, 740), -- Gemüse Ramen
  (29, 350), -- Mini Frühlingsrollen
  (30, 400), -- Mandu
  (31, 450), -- Ebi Tempura
  (32, 320), -- Miso Suppe
  (33, 300), -- Kimchi
  (34, 250), -- Sojasproßen Salat
  (35, 250), -- Weißer Rettich Salat
  (36, 250) -- Spinat Salat
) AS observed(dish_id, price_cents);

--> statement-breakpoint
-- September 2024: 28 dishes.
INSERT INTO dish_price_history (dish_id, price_cents, effective_from, recorded_at, source, is_baseline)
SELECT dish_id, price_cents, NULL,
  TIMESTAMPTZ '2024-09-01 00:00:00+02',
  'Menu photos IMG_8405.png; observed September 2024 (month only; day 1 is a placeholder)',
  false
FROM (VALUES
  (1, 1090), -- Bulgogi
  (2, 990), -- Korean Fried Chicken
  (3, 990), -- Gebratenes Huhn
  (4, 1090), -- Bulgogi Bibimbab
  (5, 890), -- Gemüse Bibimbab
  (6, 890), -- Gemüse Tofu Bab
  (7, 1290), -- Lachs Teriyaki Bab
  (8, 1190), -- Hödup Bab
  (9, 1190), -- Bulgogi Bento
  (10, 1190), -- Lachs Bento
  (11, 1190), -- Sushi Bento
  (12, 1290), -- Bulgogi Sushi Bento
  (13, 1290), -- Lachs Sushi Bento
  (14, 890), -- Tempura Maki
  (15, 940), -- California Maki
  (16, 840), -- Sake Sushi Klein
  (17, 1140), -- Sake Sushi Groß
  (18, 1490), -- Sake Sashimi Klein
  (19, 1840), -- Sake Sashimi Groß
  (20, 990), -- Bulgogi Maki
  (21, 390), -- Avocado Maki
  (22, 490), -- Ebi-Avocado Maki
  (23, 790), -- Kimbab
  (24, 350), -- Gurken Maki
  (25, 440), -- Sake Maki
  (26, 890), -- Kimchi Noodle Soup
  (27, 890), -- Chicken Ramen
  (28, 790) -- Gemüse Ramen
) AS observed(dish_id, price_cents);

--> statement-breakpoint
-- June 2025: 36 dishes.
INSERT INTO dish_price_history (dish_id, price_cents, effective_from, recorded_at, source, is_baseline)
SELECT dish_id, price_cents, NULL,
  TIMESTAMPTZ '2025-06-01 00:00:00+02',
  'Menu photos IMG_8406.jpeg and IMG_8407.png; observed June 2025 (month only; day 1 is a placeholder)',
  false
FROM (VALUES
  (1, 1150), -- Bulgogi
  (2, 1050), -- Korean Fried Chicken
  (3, 1090), -- Gebratenes Huhn
  (4, 1150), -- Bulgogi Bibimbab
  (5, 990), -- Gemüse Bibimbab
  (6, 990), -- Gemüse Tofu Bab
  (7, 1290), -- Lachs Teriyaki Bab
  (8, 1190), -- Hödup Bab
  (9, 1290), -- Bulgogi Bento
  (10, 1290), -- Lachs Bento
  (11, 1190), -- Sushi Bento
  (12, 1390), -- Bulgogi Sushi Bento
  (13, 1390), -- Lachs Sushi Bento
  (14, 990), -- Tempura Maki
  (15, 990), -- California Maki
  (16, 840), -- Sake Sushi Klein
  (17, 1140), -- Sake Sushi Groß
  (18, 1490), -- Sake Sashimi Klein
  (19, 1840), -- Sake Sashimi Groß
  (20, 990), -- Bulgogi Maki
  (21, 540), -- Avocado Maki
  (22, 490), -- Ebi-Avocado Maki
  (23, 890), -- Kimbab
  (24, 350), -- Gurken Maki
  (25, 540), -- Sake Maki
  (26, 990), -- Kimchi Noodle Soup
  (27, 990), -- Chicken Ramen
  (28, 890), -- Gemüse Ramen
  (29, 350), -- Mini Frühlingsrollen
  (30, 400), -- Mandu
  (31, 490), -- Ebi Tempura
  (32, 350), -- Miso Suppe
  (33, 400), -- Kimchi
  (34, 340), -- Sojasproßen Salat
  (35, 340), -- Weißer Rettich Salat
  (36, 400) -- Spinat Salat
) AS observed(dish_id, price_cents);
