INSERT INTO dish_groups (id, name) VALUES
(1, 'Korean Specials'),
(2, 'Maki - Sushi - Sashimi'),
(3, 'Ramen - Noodle'),
(4, 'Sides'),
(5, 'Salat');

INSERT INTO dishes (id, name, price_cents, description, group_id, is_popular) VALUES
-- Korean Specials
(1, 'Bulgogi', 1150, '', 1, true),
(2, 'Korean Fried Chicken', 1050, '', 1, true),
(3, 'Gebratenes Huhn', 1090, '', 1, false),
(4, 'Bulgogi Bibimbab', 1150, '', 1, true),
(5, 'Gemüse Bibimbab', 990, '', 1, false),
(6, 'Gemüse Tofu Bab', 990, '', 1, true),
(7, 'Lachs Teriyaki Bab', 1290, '', 1, true),
(8, 'Hödup Bab', 1190, '', 1, false),
(9, 'Bulgogi Bento', 1290, '', 1, false),
(10, 'Lachs Bento', 1290, '', 1, false),
(11, 'Sushi Bento', 1190, '', 1, false),
(12, 'Bulgogi Sushi Bento', 1390, '', 1, true),
(13, 'Lachs Sushi Bento', 1390, '', 1, false),

-- Maki - Sushi - Sashimi
(14, 'Tempura Maki', 990, '10 Stück', 2, false),
(15, 'California Maki', 990, '10 Stück', 2, false),
(16, 'Sake Sushi Klein', 840, '6 Stück', 2, false),
(17, 'Sake Sushi Groß', 1140, '8 Stück', 2, false),
(18, 'Sake Sashimi Klein', 1490, '', 2, false),
(19, 'Sake Sashimi Groß', 1840, '', 2, false),
(20, 'Bulgogi Maki', 990, '10 Stück', 2, false),
(21, 'Avocado Maki', 390, '6 Stück', 2, false),
(22, 'Ebi-Avocado Maki', 490, '6 Stück', 2, false),
(23, 'Kimbab', 990, '10 Stück', 2, false),
(24, 'Gurken Maki', 350, '6 Stück', 2, false),
(25, 'Sake Maki', 440, '6 Stück', 2, false),

-- Ramen - Noodle
(26, 'Kimchi Noodle Soup', 990, 'scharf / nicht scharf', 3, false),
(27, 'Chicken Ramen', 990, 'scharf / nicht scharf', 3, false),
(28, 'Gemüse Ramen', 890, 'scharf / nicht scharf', 3, false),

-- Sides
(29, 'Mini Frühlingsrollen', 350, '6 Stück', 4, false),
(30, 'Mandu', 400, '4 Stück', 4, false),
(31, 'Ebi Tempura', 490, '6 Stück', 4, false),
(32, 'Miso Suppe', 350, '', 4, false),

-- Salat
(33, 'Kimchi', 400, '', 5, false),
(34, 'Sojasproßen Salat', 340, '', 5, false),
(35, 'Weißer Rettich Salat', 340, '', 5, true),
(36, 'Spinat Salat', 400, '', 5, false);
