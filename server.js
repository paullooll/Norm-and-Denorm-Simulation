const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // For local development without Docker
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'fastfood_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password'
});

// Test database connection
pool.connect((err) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Connected to PostgreSQL database');
    }
});

// Helper function to measure query execution time
function measureQueryTime(queryFunction) {
    return async (...args) => {
        const start = Date.now();
        const result = await queryFunction(...args);
        const end = Date.now();
        return {
            data: result,
            executionTime: end - start
        };
    };
}

// ==================== OLTP OPERATIONS ====================

// Place a new order (Normalized)
async function placeOrderNormalized(customerId, storeId, employeeId, items) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Calculate total amount
        let totalAmount = 0;
        for (const item of items) {
            const menuResult = await client.query(
                'SELECT price FROM menu_items WHERE menu_item_id = $1',
                [item.menuItemId]
            );
            totalAmount += menuResult.rows[0].price * item.quantity;
        }

        // Insert order
        const orderResult = await client.query(
            `INSERT INTO orders (customer_id, store_id, employee_id, total_amount, order_type, status)
             VALUES ($1, $2, $3, $4, 'dine_in', 'pending') RETURNING order_id`,
            [customerId, storeId, employeeId, totalAmount]
        );

        const orderId = orderResult.rows[0].order_id;

        // Insert order items
        for (const item of items) {
            const menuResult = await client.query(
                'SELECT price FROM menu_items WHERE menu_item_id = $1',
                [item.menuItemId]
            );
            const unitPrice = menuResult.rows[0].price;

            await client.query(
                `INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, subtotal)
                 VALUES ($1, $2, $3, $4, $5)`,
                [orderId, item.menuItemId, item.quantity, unitPrice, unitPrice * item.quantity]
            );
        }

        await client.query('COMMIT');
        return { orderId, totalAmount };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

// Place a new order (Denormalized)
async function placeOrderDenormalized(customerData, storeData, employeeData, items) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Calculate total amount
        let totalAmount = 0;
        for (const item of items) {
            totalAmount += item.unitPrice * item.quantity;
        }

        // Insert into denormalized_orders (simplified - only first item for demo)
        const firstItem = items[0];
        const orderDate = new Date();

        await client.query(
            `INSERT INTO denormalized_orders (
                order_date, total_amount, order_type, status,
                customer_id, customer_first_name, customer_last_name, customer_email, customer_phone,
                store_id, store_name, store_location, store_phone,
                employee_id, employee_first_name, employee_last_name, employee_position,
                menu_item_id, item_name, category, unit_price, quantity, subtotal,
                order_month, order_day, order_hour
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)`,
            [
                orderDate, totalAmount, 'dine_in', 'pending',
                customerData.id, customerData.firstName, customerData.lastName, customerData.email, customerData.phone,
                storeData.id, storeData.name, storeData.location, storeData.phone,
                employeeData.id, employeeData.firstName, employeeData.lastName, employeeData.position,
                firstItem.menuItemId, firstItem.name, firstItem.category, firstItem.unitPrice, firstItem.quantity, firstItem.subtotal,
                parseInt(orderDate.getFullYear() + String(orderDate.getMonth() + 1).padStart(2, '0')),
                orderDate.toISOString().split('T')[0],
                orderDate.getHours()
            ]
        );

        await client.query('COMMIT');
        return { totalAmount };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

// ==================== OLAP OPERATIONS ====================

// Get sales by store (Normalized)
async function getSalesByStoreNormalized() {
    const query = `
        SELECT
            s.store_name,
            s.location,
            COUNT(o.order_id) as total_orders,
            SUM(o.total_amount) as total_revenue,
            AVG(o.total_amount) as avg_order_value,
            COUNT(DISTINCT o.customer_id) as unique_customers
        FROM stores s
        LEFT JOIN orders o ON s.store_id = o.store_id
        WHERE o.order_date >= NOW() - INTERVAL '30 days'
        GROUP BY s.store_id, s.store_name, s.location
        ORDER BY total_revenue DESC
    `;

    const result = await pool.query(query);
    return result.rows;
}

// Get sales by store (Denormalized)
async function getSalesByStoreDenormalized() {
    const query = `
        SELECT
            store_name,
            store_location as location,
            COUNT(*) as total_orders,
            SUM(total_amount) as total_revenue,
            AVG(total_amount) as avg_order_value,
            COUNT(DISTINCT customer_id) as unique_customers
        FROM denormalized_orders
        WHERE order_date >= NOW() - INTERVAL '30 days'
        GROUP BY store_id, store_name, store_location
        ORDER BY total_revenue DESC
    `;

    const result = await pool.query(query);
    return result.rows;
}

// Get best selling items (Normalized)
async function getBestSellingItemsNormalized() {
    const query = `
        SELECT
            mi.item_name,
            mi.category,
            SUM(oi.quantity) as total_quantity,
            SUM(oi.subtotal) as total_revenue,
            COUNT(DISTINCT oi.order_id) as orders_count
        FROM menu_items mi
        JOIN order_items oi ON mi.menu_item_id = oi.menu_item_id
        JOIN orders o ON oi.order_id = o.order_id
        WHERE o.order_date >= NOW() - INTERVAL '30 days'
        GROUP BY mi.menu_item_id, mi.item_name, mi.category
        ORDER BY total_quantity DESC
        LIMIT 10
    `;

    const result = await pool.query(query);
    return result.rows;
}

// Get best selling items (Denormalized)
async function getBestSellingItemsDenormalized() {
    const query = `
        SELECT
            item_name,
            category,
            SUM(quantity) as total_quantity,
            SUM(subtotal) as total_revenue,
            COUNT(*) as orders_count
        FROM denormalized_orders
        WHERE order_date >= NOW() - INTERVAL '30 days'
        GROUP BY item_name, category
        ORDER BY total_quantity DESC
        LIMIT 10
    `;

    const result = await pool.query(query);
    return result.rows;
}

// ==================== API ENDPOINTS ====================

// OLTP Endpoints
app.post('/api/oltp/normalized/place-order', async (req, res) => {
    try {
        const { customerId, storeId, employeeId, items } = req.body;
        const result = await measureQueryTime(placeOrderNormalized)(customerId, storeId, employeeId, items);
        res.json({
            success: true,
            orderId: result.data.orderId,
            totalAmount: result.data.totalAmount,
            executionTime: result.executionTime
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/oltp/denormalized/place-order', async (req, res) => {
    try {
        const { customerData, storeData, employeeData, items } = req.body;
        const result = await measureQueryTime(placeOrderDenormalized)(customerData, storeData, employeeData, items);
        res.json({
            success: true,
            totalAmount: result.data.totalAmount,
            executionTime: result.executionTime
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// OLAP Endpoints
app.get('/api/olap/normalized/sales-by-store', async (req, res) => {
    try {
        const result = await measureQueryTime(getSalesByStoreNormalized)();
        res.json({
            success: true,
            data: result.data,
            executionTime: result.executionTime
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/olap/denormalized/sales-by-store', async (req, res) => {
    try {
        const result = await measureQueryTime(getSalesByStoreDenormalized)();
        res.json({
            success: true,
            data: result.data,
            executionTime: result.executionTime
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/olap/normalized/best-selling-items', async (req, res) => {
    try {
        const result = await measureQueryTime(getBestSellingItemsNormalized)();
        res.json({
            success: true,
            data: result.data,
            executionTime: result.executionTime
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/olap/denormalized/best-selling-items', async (req, res) => {
    try {
        const result = await measureQueryTime(getBestSellingItemsDenormalized)();
        res.json({
            success: true,
            data: result.data,
            executionTime: result.executionTime
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get sample data for dropdowns
app.get('/api/sample-data', async (req, res) => {
    try {
        const customers = await pool.query('SELECT customer_id as id, first_name, last_name, email, phone FROM customers LIMIT 10');
        const stores = await pool.query('SELECT store_id as id, store_name as name, location, phone FROM stores');
        const employees = await pool.query('SELECT employee_id as id, first_name, last_name, position FROM employees');
        const menuItems = await pool.query('SELECT menu_item_id as id, item_name as name, category, price FROM menu_items WHERE available = true');

        res.json({
            success: true,
            customers: customers.rows,
            stores: stores.rows,
            employees: employees.rows,
            menuItems: menuItems.rows
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;