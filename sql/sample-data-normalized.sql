-- Sample data for normalized schema

-- Insert sample stores (first - no dependencies)
INSERT INTO stores (store_name, location, phone) VALUES
('Downtown FastFood', '123 Main St, Downtown City', '555-0101'),
('Mall Branch', '456 Shopping Mall, Mall City', '555-0102'),
('Airport Express', '789 Airport Blvd, Airport City', '555-0103'),
('University Cafe', '321 College Ave, University City', '555-0104');

-- Insert sample employees (after stores)
INSERT INTO employees (first_name, last_name, position, store_id, hire_date, salary) VALUES
('John', 'Manager', 'Store Manager', 1, '2023-01-15', 55000.00),
('Sarah', 'Cashier', 'Cashier', 1, '2023-06-01', 32000.00),
('Mike', 'Cook', 'Line Cook', 1, '2023-03-20', 38000.00),
('Emily', 'Server', 'Wait Staff', 2, '2023-05-10', 31000.00),
('David', 'Manager', 'Store Manager', 2, '2023-02-01', 52000.00),
('Lisa', 'Cashier', 'Cashier', 2, '2023-07-15', 31500.00),
('Tom', 'Cook', 'Line Cook', 3, '2023-04-01', 37000.00),
('Jennifer', 'Server', 'Wait Staff', 3, '2023-08-01', 30500.00),
('Robert', 'Manager', 'Store Manager', 3, '2023-01-20', 53000.00),
('Anna', 'Cashier', 'Cashier', 4, '2023-09-01', 31000.00);

-- Update manager_id in stores (after employees exist)
UPDATE stores SET manager_id = (
    SELECT employee_id FROM employees
    WHERE position = 'Store Manager' AND store_id = stores.store_id
    LIMIT 1
);

-- Insert sample customers (after stores and employees)
INSERT INTO customers (first_name, last_name, email, phone) VALUES
('Alice', 'Johnson', 'alice@email.com', '555-1001'),
('Bob', 'Smith', 'bob@email.com', '555-1002'),
('Carol', 'Williams', 'carol@email.com', '555-1003'),
('David', 'Brown', 'david@email.com', '555-1004'),
('Emma', 'Davis', 'emma@email.com', '555-1005'),
('Frank', 'Miller', 'frank@email.com', '555-1006'),
('Grace', 'Wilson', 'grace@email.com', '555-1007'),
('Henry', 'Moore', 'henry@email.com', '555-1008'),
('Iris', 'Taylor', 'iris@email.com', '555-1009'),
('Jack', 'Anderson', 'jack@email.com', '555-1010');

-- Insert sample menu items (can be inserted anytime)
INSERT INTO menu_items (item_name, category, price, description) VALUES
('Classic Burger', 'Burgers', 8.99, 'Beef patty with lettuce, tomato, and special sauce'),
('Cheese Burger', 'Burgers', 9.99, 'Classic burger with cheese'),
('Chicken Burger', 'Burgers', 9.49, 'Grilled chicken breast with mayo'),
('French Fries', 'Sides', 3.99, 'Crispy golden fries'),
('Onion Rings', 'Sides', 4.49, 'Beer-battered onion rings'),
('Cola', 'Drinks', 2.49, 'Ice cold cola'),
('Orange Juice', 'Drinks', 2.99, 'Fresh orange juice'),
('Vanilla Shake', 'Desserts', 4.99, 'Creamy vanilla milkshake'),
('Chocolate Shake', 'Desserts', 4.99, 'Rich chocolate milkshake'),
('Apple Pie', 'Desserts', 3.49, 'Warm apple pie slice');

-- Insert sample orders (after customers, stores, employees exist) - Expanded to 80+ orders
INSERT INTO orders (customer_id, store_id, employee_id, order_date, total_amount, order_type, status) VALUES
-- Day 1 (20 orders)
(1, 1, 2, NOW() - INTERVAL '15 days' + INTERVAL '10 hours' + INTERVAL '0 minutes', 15.97, 'dine_in', 'completed'),
(2, 1, 2, NOW() - INTERVAL '15 days' + INTERVAL '10 hours' + INTERVAL '15 minutes', 12.48, 'takeout', 'completed'),
(3, 2, 5, NOW() - INTERVAL '15 days' + INTERVAL '10 hours' + INTERVAL '30 minutes', 22.46, 'dine_in', 'completed'),
(4, 3, 8, NOW() - INTERVAL '15 days' + INTERVAL '11 hours' + INTERVAL '0 minutes', 8.99, 'takeout', 'completed'),
(5, 2, 6, NOW() - INTERVAL '15 days' + INTERVAL '11 hours' + INTERVAL '15 minutes', 18.96, 'dine_in', 'completed'),
(6, 4, 10, NOW() - INTERVAL '15 days' + INTERVAL '11 hours' + INTERVAL '30 minutes', 11.47, 'takeout', 'completed'),
(7, 1, 2, NOW() - INTERVAL '15 days' + INTERVAL '12 hours' + INTERVAL '0 minutes', 25.94, 'dine_in', 'completed'),
(8, 3, 8, NOW() - INTERVAL '15 days' + INTERVAL '12 hours' + INTERVAL '15 minutes', 14.97, 'takeout', 'completed'),
(9, 2, 5, NOW() - INTERVAL '15 days' + INTERVAL '12 hours' + INTERVAL '30 minutes', 9.98, 'dine_in', 'completed'),
(10, 4, 10, NOW() - INTERVAL '15 days' + INTERVAL '13 hours' + INTERVAL '0 minutes', 16.95, 'takeout', 'completed'),
(1, 1, 2, NOW() - INTERVAL '15 days' + INTERVAL '13 hours' + INTERVAL '15 minutes', 19.98, 'dine_in', 'completed'),
(2, 2, 5, NOW() - INTERVAL '15 days' + INTERVAL '13 hours' + INTERVAL '30 minutes', 8.99, 'takeout', 'completed'),
(3, 3, 8, NOW() - INTERVAL '15 days' + INTERVAL '14 hours' + INTERVAL '0 minutes', 12.48, 'dine_in', 'completed'),
(4, 4, 10, NOW() - INTERVAL '15 days' + INTERVAL '14 hours' + INTERVAL '15 minutes', 22.46, 'takeout', 'completed'),
(5, 1, 2, NOW() - INTERVAL '15 days' + INTERVAL '14 hours' + INTERVAL '30 minutes', 15.97, 'dine_in', 'completed'),
(6, 2, 6, NOW() - INTERVAL '15 days' + INTERVAL '15 hours' + INTERVAL '0 minutes', 11.47, 'takeout', 'completed'),
(7, 3, 8, NOW() - INTERVAL '15 days' + INTERVAL '15 hours' + INTERVAL '15 minutes', 18.96, 'dine_in', 'completed'),
(8, 4, 10, NOW() - INTERVAL '15 days' + INTERVAL '15 hours' + INTERVAL '30 minutes', 25.94, 'takeout', 'completed'),
(9, 1, 2, NOW() - INTERVAL '15 days' + INTERVAL '16 hours' + INTERVAL '0 minutes', 14.97, 'dine_in', 'completed'),
(10, 2, 5, NOW() - INTERVAL '15 days' + INTERVAL '16 hours' + INTERVAL '15 minutes', 9.98, 'takeout', 'completed'),

-- Day 2 (20 orders)
(1, 3, 8, NOW() - INTERVAL '14 days' + INTERVAL '10 hours' + INTERVAL '0 minutes', 16.95, 'dine_in', 'completed'),
(2, 4, 10, NOW() - INTERVAL '14 days' + INTERVAL '10 hours' + INTERVAL '15 minutes', 19.98, 'takeout', 'completed'),
(3, 1, 2, NOW() - INTERVAL '14 days' + INTERVAL '10 hours' + INTERVAL '30 minutes', 8.99, 'dine_in', 'completed'),
(4, 2, 6, NOW() - INTERVAL '14 days' + INTERVAL '11 hours' + INTERVAL '0 minutes', 12.48, 'takeout', 'completed'),
(5, 3, 8, NOW() - INTERVAL '14 days' + INTERVAL '11 hours' + INTERVAL '15 minutes', 22.46, 'dine_in', 'completed'),
(6, 4, 10, NOW() - INTERVAL '14 days' + INTERVAL '11 hours' + INTERVAL '30 minutes', 15.97, 'takeout', 'completed'),
(7, 1, 2, NOW() - INTERVAL '14 days' + INTERVAL '12 hours' + INTERVAL '0 minutes', 11.47, 'dine_in', 'completed'),
(8, 2, 5, NOW() - INTERVAL '14 days' + INTERVAL '12 hours' + INTERVAL '15 minutes', 18.96, 'takeout', 'completed'),
(9, 3, 8, NOW() - INTERVAL '14 days' + INTERVAL '12 hours' + INTERVAL '30 minutes', 25.94, 'dine_in', 'completed'),
(10, 4, 10, NOW() - INTERVAL '14 days' + INTERVAL '13 hours' + INTERVAL '0 minutes', 14.97, 'takeout', 'completed'),
(1, 1, 2, NOW() - INTERVAL '14 days' + INTERVAL '13 hours' + INTERVAL '15 minutes', 9.98, 'dine_in', 'completed'),
(2, 2, 6, NOW() - INTERVAL '14 days' + INTERVAL '13 hours' + INTERVAL '30 minutes', 16.95, 'takeout', 'completed'),
(3, 3, 8, NOW() - INTERVAL '14 days' + INTERVAL '14 hours' + INTERVAL '0 minutes', 19.98, 'dine_in', 'completed'),
(4, 4, 10, NOW() - INTERVAL '14 days' + INTERVAL '14 hours' + INTERVAL '15 minutes', 8.99, 'takeout', 'completed'),
(5, 1, 2, NOW() - INTERVAL '14 days' + INTERVAL '14 hours' + INTERVAL '30 minutes', 12.48, 'dine_in', 'completed'),
(6, 2, 5, NOW() - INTERVAL '14 days' + INTERVAL '15 hours' + INTERVAL '0 minutes', 22.46, 'takeout', 'completed'),
(7, 3, 8, NOW() - INTERVAL '14 days' + INTERVAL '15 hours' + INTERVAL '15 minutes', 15.97, 'dine_in', 'completed'),
(8, 4, 10, NOW() - INTERVAL '14 days' + INTERVAL '15 hours' + INTERVAL '30 minutes', 11.47, 'takeout', 'completed'),
(9, 1, 2, NOW() - INTERVAL '14 days' + INTERVAL '16 hours' + INTERVAL '0 minutes', 18.96, 'dine_in', 'completed'),
(10, 2, 6, NOW() - INTERVAL '14 days' + INTERVAL '16 hours' + INTERVAL '15 minutes', 25.94, 'takeout', 'completed'),

-- Day 3 (20 orders)
(1, 3, 8, NOW() - INTERVAL '13 days' + INTERVAL '10 hours' + INTERVAL '0 minutes', 14.97, 'dine_in', 'completed'),
(2, 4, 10, NOW() - INTERVAL '13 days' + INTERVAL '10 hours' + INTERVAL '15 minutes', 9.98, 'takeout', 'completed'),
(3, 1, 2, NOW() - INTERVAL '13 days' + INTERVAL '10 hours' + INTERVAL '30 minutes', 16.95, 'dine_in', 'completed'),
(4, 2, 5, NOW() - INTERVAL '13 days' + INTERVAL '11 hours' + INTERVAL '0 minutes', 19.98, 'takeout', 'completed'),
(5, 3, 8, NOW() - INTERVAL '13 days' + INTERVAL '11 hours' + INTERVAL '15 minutes', 8.99, 'dine_in', 'completed'),
(6, 4, 10, NOW() - INTERVAL '13 days' + INTERVAL '11 hours' + INTERVAL '30 minutes', 12.48, 'takeout', 'completed'),
(7, 1, 2, NOW() - INTERVAL '13 days' + INTERVAL '12 hours' + INTERVAL '0 minutes', 22.46, 'dine_in', 'completed'),
(8, 2, 6, NOW() - INTERVAL '13 days' + INTERVAL '12 hours' + INTERVAL '15 minutes', 15.97, 'takeout', 'completed'),
(9, 3, 8, NOW() - INTERVAL '13 days' + INTERVAL '12 hours' + INTERVAL '30 minutes', 11.47, 'dine_in', 'completed'),
(10, 4, 10, NOW() - INTERVAL '13 days' + INTERVAL '13 hours' + INTERVAL '0 minutes', 18.96, 'takeout', 'completed'),
(1, 1, 2, NOW() - INTERVAL '13 days' + INTERVAL '13 hours' + INTERVAL '15 minutes', 25.94, 'dine_in', 'completed'),
(2, 2, 5, NOW() - INTERVAL '13 days' + INTERVAL '13 hours' + INTERVAL '30 minutes', 14.97, 'takeout', 'completed'),
(3, 3, 8, NOW() - INTERVAL '13 days' + INTERVAL '14 hours' + INTERVAL '0 minutes', 9.98, 'dine_in', 'completed'),
(4, 4, 10, NOW() - INTERVAL '13 days' + INTERVAL '14 hours' + INTERVAL '15 minutes', 16.95, 'takeout', 'completed'),
(5, 1, 2, NOW() - INTERVAL '13 days' + INTERVAL '14 hours' + INTERVAL '30 minutes', 19.98, 'dine_in', 'completed'),
(6, 2, 6, NOW() - INTERVAL '13 days' + INTERVAL '15 hours' + INTERVAL '0 minutes', 8.99, 'takeout', 'completed'),
(7, 3, 8, NOW() - INTERVAL '13 days' + INTERVAL '15 hours' + INTERVAL '15 minutes', 12.48, 'dine_in', 'completed'),
(8, 4, 10, NOW() - INTERVAL '13 days' + INTERVAL '15 hours' + INTERVAL '30 minutes', 22.46, 'takeout', 'completed'),
(9, 1, 2, NOW() - INTERVAL '13 days' + INTERVAL '16 hours' + INTERVAL '0 minutes', 15.97, 'dine_in', 'completed'),
(10, 2, 5, NOW() - INTERVAL '13 days' + INTERVAL '16 hours' + INTERVAL '15 minutes', 11.47, 'takeout', 'completed'),

-- Day 4 (20 orders)
(1, 3, 8, NOW() - INTERVAL '12 days' + INTERVAL '10 hours' + INTERVAL '0 minutes', 18.96, 'dine_in', 'completed'),
(2, 4, 10, NOW() - INTERVAL '12 days' + INTERVAL '10 hours' + INTERVAL '15 minutes', 25.94, 'takeout', 'completed'),
(3, 1, 2, NOW() - INTERVAL '12 days' + INTERVAL '10 hours' + INTERVAL '30 minutes', 14.97, 'dine_in', 'completed'),
(4, 2, 6, NOW() - INTERVAL '12 days' + INTERVAL '11 hours' + INTERVAL '0 minutes', 9.98, 'takeout', 'completed'),
(5, 3, 8, NOW() - INTERVAL '12 days' + INTERVAL '11 hours' + INTERVAL '15 minutes', 16.95, 'dine_in', 'completed'),
(6, 4, 10, NOW() - INTERVAL '12 days' + INTERVAL '11 hours' + INTERVAL '30 minutes', 19.98, 'takeout', 'completed'),
(7, 1, 2, NOW() - INTERVAL '12 days' + INTERVAL '12 hours' + INTERVAL '0 minutes', 8.99, 'dine_in', 'completed'),
(8, 2, 5, NOW() - INTERVAL '12 days' + INTERVAL '12 hours' + INTERVAL '15 minutes', 12.48, 'takeout', 'completed'),
(9, 3, 8, NOW() - INTERVAL '12 days' + INTERVAL '12 hours' + INTERVAL '30 minutes', 22.46, 'dine_in', 'completed'),
(10, 4, 10, NOW() - INTERVAL '12 days' + INTERVAL '13 hours' + INTERVAL '0 minutes', 15.97, 'takeout', 'completed'),
(1, 1, 2, NOW() - INTERVAL '12 days' + INTERVAL '13 hours' + INTERVAL '15 minutes', 11.47, 'dine_in', 'completed'),
(2, 2, 6, NOW() - INTERVAL '12 days' + INTERVAL '13 hours' + INTERVAL '30 minutes', 18.96, 'takeout', 'completed'),
(3, 3, 8, NOW() - INTERVAL '12 days' + INTERVAL '14 hours' + INTERVAL '0 minutes', 25.94, 'dine_in', 'completed'),
(4, 4, 10, NOW() - INTERVAL '12 days' + INTERVAL '14 hours' + INTERVAL '15 minutes', 14.97, 'takeout', 'completed'),
(5, 1, 2, NOW() - INTERVAL '12 days' + INTERVAL '14 hours' + INTERVAL '30 minutes', 9.98, 'dine_in', 'completed'),
(6, 2, 5, NOW() - INTERVAL '12 days' + INTERVAL '15 hours' + INTERVAL '0 minutes', 16.95, 'takeout', 'completed'),
(7, 3, 8, NOW() - INTERVAL '12 days' + INTERVAL '15 hours' + INTERVAL '15 minutes', 19.98, 'dine_in', 'completed'),
(8, 4, 10, NOW() - INTERVAL '12 days' + INTERVAL '15 hours' + INTERVAL '30 minutes', 8.99, 'takeout', 'completed'),
(9, 1, 2, NOW() - INTERVAL '12 days' + INTERVAL '16 hours' + INTERVAL '0 minutes', 12.48, 'dine_in', 'completed'),
(10, 2, 6, NOW() - INTERVAL '12 days' + INTERVAL '16 hours' + INTERVAL '15 minutes', 22.46, 'takeout', 'completed');

-- Insert sample order items (after orders and menu_items exist) - Expanded for 80 orders
INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, subtotal) VALUES
-- Orders 1-10 (Day 1)
(1, 1, 1, 8.99, 8.99), (1, 4, 1, 3.99, 3.99), (1, 6, 1, 2.49, 2.49),
(2, 2, 1, 9.99, 9.99), (2, 7, 1, 2.99, 2.99),
(3, 3, 2, 9.49, 18.98), (3, 5, 1, 4.49, 4.49),
(4, 1, 1, 8.99, 8.99),
(5, 8, 2, 4.99, 9.98), (5, 4, 2, 3.99, 7.98),
(6, 9, 1, 4.99, 4.99), (6, 10, 1, 3.49, 3.49), (6, 7, 1, 2.99, 2.99),
(7, 1, 2, 8.99, 17.98), (7, 4, 2, 3.99, 7.96),
(8, 2, 1, 9.99, 9.99), (8, 5, 1, 4.49, 4.49),
(9, 3, 1, 9.49, 9.49), (9, 6, 1, 2.49, 2.49),
(10, 8, 1, 4.99, 4.99), (10, 9, 2, 4.99, 9.98), (10, 6, 1, 2.49, 2.49),
(11, 1, 2, 8.99, 17.98), (11, 5, 1, 4.49, 4.49),
(12, 2, 1, 9.99, 9.99),
(13, 3, 1, 9.49, 9.49), (13, 4, 1, 3.99, 3.99),
(14, 8, 2, 4.99, 9.98),
(15, 9, 1, 4.99, 4.99), (15, 10, 1, 3.49, 3.49),
(16, 1, 1, 8.99, 8.99), (16, 6, 1, 2.49, 2.49),
(17, 2, 2, 9.99, 19.98),
(18, 3, 1, 9.49, 9.49), (18, 7, 1, 2.99, 2.99),
(19, 8, 1, 4.99, 4.99), (19, 4, 1, 3.99, 3.99),
(20, 9, 2, 4.99, 9.98), (20, 5, 1, 4.49, 4.49),

-- Orders 21-40 (Day 2)
(21, 1, 1, 8.99, 8.99), (21, 7, 1, 2.99, 2.99),
(22, 2, 2, 9.99, 19.98),
(23, 3, 1, 9.49, 9.49),
(24, 8, 1, 4.99, 4.99), (24, 4, 1, 3.99, 3.99),
(25, 9, 1, 4.99, 4.99), (25, 6, 1, 2.49, 2.49),
(26, 1, 2, 8.99, 17.98),
(27, 2, 1, 9.99, 9.99), (27, 5, 1, 4.49, 4.49),
(28, 3, 1, 9.49, 9.49), (28, 10, 1, 3.49, 3.49),
(29, 8, 2, 4.99, 9.98),
(30, 9, 1, 4.99, 4.99), (30, 4, 1, 3.99, 3.99),
(31, 1, 1, 8.99, 8.99), (31, 7, 1, 2.99, 2.99),
(32, 2, 1, 9.99, 9.99), (32, 6, 1, 2.49, 2.49),
(33, 3, 2, 9.49, 18.98),
(34, 8, 1, 4.99, 4.99),
(35, 9, 1, 4.99, 4.99), (35, 5, 1, 4.49, 4.49),
(36, 1, 1, 8.99, 8.99), (36, 10, 1, 3.49, 3.49),
(37, 2, 2, 9.99, 19.98),
(38, 3, 1, 9.49, 9.49),
(39, 8, 1, 4.99, 4.99), (39, 4, 1, 3.99, 3.99),
(40, 9, 2, 4.99, 9.98),

-- Orders 41-60 (Day 3)
(41, 1, 1, 8.99, 8.99), (41, 6, 1, 2.49, 2.49),
(42, 2, 1, 9.99, 9.99), (42, 7, 1, 2.99, 2.99),
(43, 3, 1, 9.49, 9.49), (43, 4, 1, 3.99, 3.99),
(44, 8, 2, 4.99, 9.98),
(45, 9, 1, 4.99, 4.99),
(46, 1, 1, 8.99, 8.99), (46, 5, 1, 4.49, 4.49),
(47, 2, 2, 9.99, 19.98),
(48, 3, 1, 9.49, 9.49),
(49, 8, 1, 4.99, 4.99), (49, 10, 1, 3.49, 3.49),
(50, 9, 1, 4.99, 4.99), (50, 6, 1, 2.49, 2.49),
(51, 1, 2, 8.99, 17.98),
(52, 2, 1, 9.99, 9.99),
(53, 3, 1, 9.49, 9.49), (53, 7, 1, 2.99, 2.99),
(54, 8, 1, 4.99, 4.99), (54, 4, 1, 3.99, 3.99),
(55, 9, 2, 4.99, 9.98),
(56, 1, 1, 8.99, 8.99),
(57, 2, 1, 9.99, 9.99), (57, 5, 1, 4.49, 4.49),
(58, 3, 2, 9.49, 18.98),
(59, 8, 1, 4.99, 4.99),
(60, 9, 1, 4.99, 4.99), (60, 10, 1, 3.49, 3.49),

-- Orders 61-80 (Day 4)
(61, 1, 1, 8.99, 8.99), (61, 6, 1, 2.49, 2.49),
(62, 2, 2, 9.99, 19.98),
(63, 3, 1, 9.49, 9.49),
(64, 8, 1, 4.99, 4.99),
(65, 9, 1, 4.99, 4.99), (65, 7, 1, 2.99, 2.99),
(66, 1, 1, 8.99, 8.99), (66, 4, 1, 3.99, 3.99),
(67, 2, 1, 9.99, 9.99), (67, 5, 1, 4.49, 4.49),
(68, 3, 2, 9.49, 18.98),
(69, 8, 1, 4.99, 4.99),
(70, 9, 1, 4.99, 4.99), (70, 10, 1, 3.49, 3.49),
(71, 1, 2, 8.99, 17.98),
(72, 2, 1, 9.99, 9.99),
(73, 3, 1, 9.49, 9.49), (73, 6, 1, 2.49, 2.49),
(74, 8, 1, 4.99, 4.99), (74, 4, 1, 3.99, 3.99),
(75, 9, 2, 4.99, 9.98),
(76, 1, 1, 8.99, 8.99),
(77, 2, 1, 9.99, 9.99), (77, 7, 1, 2.99, 2.99),
(78, 3, 1, 9.49, 9.49), (78, 5, 1, 4.49, 4.49),
(79, 8, 2, 4.99, 9.98),
(80, 9, 1, 4.99, 4.99), (80, 10, 1, 3.49, 3.49);