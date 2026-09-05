INSERT INTO category (name, sort_order)
SELECT 'Starters', 1 WHERE NOT EXISTS (SELECT 1 FROM category WHERE name = 'Starters');
INSERT INTO category (name, sort_order)
SELECT 'Mains', 2 WHERE NOT EXISTS (SELECT 1 FROM category WHERE name = 'Mains');
INSERT INTO category (name, sort_order)
SELECT 'Desserts', 3 WHERE NOT EXISTS (SELECT 1 FROM category WHERE name = 'Desserts');
INSERT INTO category (name, sort_order)
SELECT 'Drinks', 4 WHERE NOT EXISTS (SELECT 1 FROM category WHERE name = 'Drinks');

INSERT INTO menu_item (name, description, price, available, category_id)
SELECT 'Garlic Bread', 'Toasted baguette with garlic butter', 4.50, true, id FROM category WHERE name = 'Starters'
AND NOT EXISTS (SELECT 1 FROM menu_item WHERE name = 'Garlic Bread');

INSERT INTO menu_item (name, description, price, available, category_id)
SELECT 'Soup of the Day', 'Ask your server for today''s option', 5.00, true, id FROM category WHERE name = 'Starters'
AND NOT EXISTS (SELECT 1 FROM menu_item WHERE name = 'Soup of the Day');

INSERT INTO menu_item (name, description, price, available, category_id)
SELECT 'Grilled Chicken', 'Served with roasted vegetables', 14.00, true, id FROM category WHERE name = 'Mains'
AND NOT EXISTS (SELECT 1 FROM menu_item WHERE name = 'Grilled Chicken');

INSERT INTO menu_item (name, description, price, available, category_id)
SELECT 'Margherita Pizza', 'Tomato, mozzarella, fresh basil', 12.50, true, id FROM category WHERE name = 'Mains'
AND NOT EXISTS (SELECT 1 FROM menu_item WHERE name = 'Margherita Pizza');

INSERT INTO menu_item (name, description, price, available, category_id)
SELECT 'Beef Burger', 'With fries and house sauce', 13.00, false, id FROM category WHERE name = 'Mains'
AND NOT EXISTS (SELECT 1 FROM menu_item WHERE name = 'Beef Burger');

INSERT INTO menu_item (name, description, price, available, category_id)
SELECT 'Chocolate Brownie', 'Warm, with vanilla ice cream', 6.50, true, id FROM category WHERE name = 'Desserts'
AND NOT EXISTS (SELECT 1 FROM menu_item WHERE name = 'Chocolate Brownie');

INSERT INTO menu_item (name, description, price, available, category_id)
SELECT 'Cheesecake', 'Classic New York style', 6.00, true, id FROM category WHERE name = 'Desserts'
AND NOT EXISTS (SELECT 1 FROM menu_item WHERE name = 'Cheesecake');

INSERT INTO menu_item (name, description, price, available, category_id)
SELECT 'Sparkling Water', '330ml bottle', 2.50, true, id FROM category WHERE name = 'Drinks'
AND NOT EXISTS (SELECT 1 FROM menu_item WHERE name = 'Sparkling Water');

INSERT INTO menu_item (name, description, price, available, category_id)
SELECT 'Fresh Orange Juice', 'Squeezed to order', 3.50, true, id FROM category WHERE name = 'Drinks'
AND NOT EXISTS (SELECT 1 FROM menu_item WHERE name = 'Fresh Orange Juice');
