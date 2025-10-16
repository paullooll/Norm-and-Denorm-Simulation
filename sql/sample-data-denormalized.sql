-- Sample data for denormalized schema
-- This data combines information from multiple normalized tables

-- Insert sample denormalized orders (combining orders, customers, stores, employees, menu_items)
INSERT INTO denormalized_orders (
    order_id, order_date, total_amount, order_type, status,
    customer_id, customer_first_name, customer_last_name, customer_email, customer_phone,
    store_id, store_name, store_location, store_phone,
    employee_id, employee_first_name, employee_last_name, employee_position,
    menu_item_id, item_name, category, unit_price, quantity, subtotal,
    order_month, order_day, order_hour
) VALUES
-- Order 1: Alice Johnson - Classic Burger combo
(NOW() - INTERVAL '15 days' + INTERVAL '12 hours', 15.97, 'dine_in', 'completed',
1, 'Alice', 'Johnson', 'alice@email.com', '555-1001',
1, 'Downtown FastFood', '123 Main St, Downtown City', '555-0101',
2, 'Sarah', 'Cashier', 'Cashier',
1, 'Classic Burger', 'Burgers', 8.99, 1, 8.99,
EXTRACT(YEAR FROM NOW()) * 100 + EXTRACT(MONTH FROM NOW()), CURRENT_DATE - INTERVAL '15 days', 12),

-- Order 2: Bob Smith - Cheese Burger and juice
(NOW() - INTERVAL '15 days' + INTERVAL '13 hours', 12.48, 'takeout', 'completed',
2, 'Bob', 'Smith', 'bob@email.com', '555-1002',
1, 'Downtown FastFood', '123 Main St, Downtown City', '555-0101',
2, 'Sarah', 'Cashier', 'Cashier',
2, 'Cheese Burger', 'Burgers', 9.99, 1, 9.99,
EXTRACT(YEAR FROM NOW()) * 100 + EXTRACT(MONTH FROM NOW()), CURRENT_DATE - INTERVAL '15 days', 13),

-- Order 3: Carol Williams - Double Chicken Burger and onion rings
(NOW() - INTERVAL '15 days' + INTERVAL '18 hours', 22.46, 'dine_in', 'completed',
3, 'Carol', 'Williams', 'carol@email.com', '555-1003',
2, 'Mall Branch', '456 Shopping Mall, Mall City', '555-0102',
5, 'Emily', 'Server', 'Wait Staff',
3, 'Chicken Burger', 'Burgers', 9.49, 2, 18.98,
EXTRACT(YEAR FROM NOW()) * 100 + EXTRACT(MONTH FROM NOW()), CURRENT_DATE - INTERVAL '15 days', 18),

-- Order 4: David Brown - Single Classic Burger
(NOW() - INTERVAL '14 days' + INTERVAL '9 hours', 8.99, 'takeout', 'completed',
4, 'David', 'Brown', 'david@email.com', '555-1004',
3, 'Airport Express', '789 Airport Blvd, Airport City', '555-0103',
8, 'Jennifer', 'Server', 'Wait Staff',
1, 'Classic Burger', 'Burgers', 8.99, 1, 8.99,
EXTRACT(YEAR FROM NOW()) * 100 + EXTRACT(MONTH FROM NOW()), CURRENT_DATE - INTERVAL '14 days', 9),

-- Order 5: Emma Davis - Two milkshakes and fries
(NOW() - INTERVAL '14 days' + INTERVAL '12 hours', 18.96, 'dine_in', 'completed',
5, 'Emma', 'Davis', 'emma@email.com', '555-1005',
2, 'Mall Branch', '456 Shopping Mall, Mall City', '555-0102',
6, 'Lisa', 'Cashier', 'Cashier',
8, 'Vanilla Shake', 'Desserts', 4.99, 2, 9.98,
EXTRACT(YEAR FROM NOW()) * 100 + EXTRACT(MONTH FROM NOW()), CURRENT_DATE - INTERVAL '14 days', 12),

-- Order 6: Frank Miller - Chocolate shake, apple pie, and juice
(NOW() - INTERVAL '14 days' + INTERVAL '15 hours', 11.47, 'takeout', 'completed',
6, 'Frank', 'Miller', 'frank@email.com', '555-1006',
4, 'University Cafe', '321 College Ave, University City', '555-0104',
10, 'Anna', 'Cashier', 'Cashier',
9, 'Chocolate Shake', 'Desserts', 4.99, 1, 4.99,
EXTRACT(YEAR FROM NOW()) * 100 + EXTRACT(MONTH FROM NOW()), CURRENT_DATE - INTERVAL '14 days', 15),

-- Order 7: Grace Wilson - Two Classic Burgers and fries
(NOW() - INTERVAL '13 days' + INTERVAL '11 hours', 25.94, 'dine_in', 'completed',
7, 'Grace', 'Wilson', 'grace@email.com', '555-1007',
1, 'Downtown FastFood', '123 Main St, Downtown City', '555-0101',
2, 'Sarah', 'Cashier', 'Cashier',
1, 'Classic Burger', 'Burgers', 8.99, 2, 17.98,
EXTRACT(YEAR FROM NOW()) * 100 + EXTRACT(MONTH FROM NOW()), CURRENT_DATE - INTERVAL '13 days', 11),

-- Order 8: Henry Moore - Cheese Burger and onion rings
(NOW() - INTERVAL '13 days' + INTERVAL '14 hours', 14.97, 'takeout', 'completed',
8, 'Henry', 'Moore', 'henry@email.com', '555-1008',
3, 'Airport Express', '789 Airport Blvd, Airport City', '555-0103',
8, 'Jennifer', 'Server', 'Wait Staff',
2, 'Cheese Burger', 'Burgers', 9.99, 1, 9.99,
EXTRACT(YEAR FROM NOW()) * 100 + EXTRACT(MONTH FROM NOW()), CURRENT_DATE - INTERVAL '13 days', 14),

-- Order 9: Iris Taylor - Chicken Burger and cola
(NOW() - INTERVAL '12 days' + INTERVAL '10 hours', 9.98, 'dine_in', 'completed',
9, 'Iris', 'Taylor', 'iris@email.com', '555-1009',
2, 'Mall Branch', '456 Shopping Mall, Mall City', '555-0102',
5, 'Emily', 'Server', 'Wait Staff',
3, 'Chicken Burger', 'Burgers', 9.49, 1, 9.49,
EXTRACT(YEAR FROM NOW()) * 100 + EXTRACT(MONTH FROM NOW()), CURRENT_DATE - INTERVAL '12 days', 10),

-- Order 10: Jack Anderson - Vanilla shake, chocolate shake, and cola
(NOW() - INTERVAL '12 days' + INTERVAL '16 hours', 16.95, 'takeout', 'completed',
10, 'Jack', 'Anderson', 'jack@email.com', '555-1010',
4, 'University Cafe', '321 College Ave, University City', '555-0104',
10, 'Anna', 'Cashier', 'Cashier',
8, 'Vanilla Shake', 'Desserts', 4.99, 1, 4.99,
EXTRACT(YEAR FROM NOW()) * 100 + EXTRACT(MONTH FROM NOW()), CURRENT_DATE - INTERVAL '12 days', 16);

-- Insert sample analytics data (using recent dates)
INSERT INTO denormalized_analytics (analytics_date, store_id, store_name, category, total_orders, total_revenue, avg_order_value, total_customers) VALUES
(CURRENT_DATE - INTERVAL '15 days', 1, 'Downtown FastFood', 'Burgers', 2, 28.45, 14.23, 2),
(CURRENT_DATE - INTERVAL '15 days', 2, 'Mall Branch', 'Burgers', 1, 18.98, 18.98, 1),
(CURRENT_DATE - INTERVAL '14 days', 2, 'Mall Branch', 'Desserts', 1, 9.98, 9.98, 1),
(CURRENT_DATE - INTERVAL '14 days', 3, 'Airport Express', 'Burgers', 1, 8.99, 8.99, 1),
(CURRENT_DATE - INTERVAL '14 days', 4, 'University Cafe', 'Desserts', 1, 11.47, 11.47, 1),
(CURRENT_DATE - INTERVAL '13 days', 1, 'Downtown FastFood', 'Burgers', 1, 17.98, 17.98, 1),
(CURRENT_DATE - INTERVAL '13 days', 3, 'Airport Express', 'Burgers', 1, 9.99, 9.99, 1),
(CURRENT_DATE - INTERVAL '12 days', 2, 'Mall Branch', 'Burgers', 1, 9.49, 9.49, 1),
(CURRENT_DATE - INTERVAL '12 days', 4, 'University Cafe', 'Desserts', 1, 4.99, 4.99, 1);