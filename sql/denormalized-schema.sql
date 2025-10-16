-- Denormalized Schema for Fast Food Chain
-- This schema combines entities for faster read performance (OLAP optimized)

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS denormalized_orders;
DROP TABLE IF EXISTS denormalized_analytics;

-- Denormalized orders table (combines orders, customers, stores, employees, and order_items)
CREATE TABLE denormalized_orders (
    -- Order information
    order_id SERIAL PRIMARY KEY,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10,2) NOT NULL,
    order_type VARCHAR(20) DEFAULT 'dine_in',
    status VARCHAR(20) DEFAULT 'pending',

    -- Customer information (redundant data)
    customer_id INTEGER,
    customer_first_name VARCHAR(50) NOT NULL,
    customer_last_name VARCHAR(50) NOT NULL,
    customer_email VARCHAR(100),
    customer_phone VARCHAR(20),

    -- Store information (redundant data)
    store_id INTEGER,
    store_name VARCHAR(100) NOT NULL,
    store_location VARCHAR(200) NOT NULL,
    store_phone VARCHAR(20),

    -- Employee information (redundant data)
    employee_id INTEGER,
    employee_first_name VARCHAR(50),
    employee_last_name VARCHAR(50),
    employee_position VARCHAR(50),

    -- Menu item details (for the first item in the order - simplified for demo)
    -- In a real denormalized schema, you might have multiple rows per order or JSON columns
    menu_item_id INTEGER,
    item_name VARCHAR(100),
    category VARCHAR(50),
    unit_price DECIMAL(8,2),
    quantity INTEGER DEFAULT 1,
    subtotal DECIMAL(10,2),

    -- Additional redundant fields for analytics
    order_month INTEGER, -- YYYYMM format for easy aggregation
    order_day DATE,
    order_hour INTEGER,
    store_state VARCHAR(50), -- Extracted from location for grouping
    item_category VARCHAR(50), -- Redundant category for filtering

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analytics summary table for OLAP queries
CREATE TABLE denormalized_analytics (
    analytics_id SERIAL PRIMARY KEY,
    analytics_date DATE NOT NULL,
    store_id INTEGER,
    store_name VARCHAR(100),
    category VARCHAR(50),
    total_orders INTEGER DEFAULT 0,
    total_revenue DECIMAL(15,2) DEFAULT 0,
    avg_order_value DECIMAL(10,2) DEFAULT 0,
    total_customers INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(analytics_date, store_id, category)
);

-- Create indexes for the denormalized schema
CREATE INDEX idx_denormalized_orders_date ON denormalized_orders(order_date);
CREATE INDEX idx_denormalized_orders_store ON denormalized_orders(store_id);
CREATE INDEX idx_denormalized_orders_customer ON denormalized_orders(customer_id);
CREATE INDEX idx_denormalized_orders_category ON denormalized_orders(category);
CREATE INDEX idx_denormalized_orders_month ON denormalized_orders(order_month);
CREATE INDEX idx_denormalized_analytics_date ON denormalized_analytics(analytics_date);
CREATE INDEX idx_denormalized_analytics_store ON denormalized_analytics(store_id);