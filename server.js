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
        const start = process.hrtime.bigint();
        try {
            const result = await queryFunction(...args);
            const end = process.hrtime.bigint();
            const executionTime = Number(end - start) / 1000000; // Convert to milliseconds
            return {
                data: result,
                executionTime: Math.round(executionTime * 100) / 100, // Round to 2 decimal places
                success: true
            };
        } catch (error) {
            const end = process.hrtime.bigint();
            const executionTime = Number(end - start) / 1000000;
            return {
                data: null,
                executionTime: Math.round(executionTime * 100) / 100,
                success: false,
                error: error.message
            };
        }
    };
}

// Enhanced error handling middleware
function handleDatabaseError(error, operation) {
    console.error(`Database error during ${operation}:`, error);

    let userFriendlyMessage = 'An unexpected error occurred';
    let statusCode = 500;

    if (error.code === '23505') {
        userFriendlyMessage = 'Duplicate data detected. Please check your input.';
        statusCode = 409;
    } else if (error.code === '23503') {
        userFriendlyMessage = 'Referenced data not found. Please verify all related records exist.';
        statusCode = 400;
    } else if (error.code === '42P01') {
        userFriendlyMessage = 'Database table not found. Please contact support.';
        statusCode = 500;
    } else if (error.code === '23502') {
        userFriendlyMessage = 'Required data is missing. Please provide all necessary information.';
        statusCode = 400;
    }

    return {
        error: userFriendlyMessage,
        code: error.code,
        operation: operation,
        statusCode: statusCode
    };
}

// Query optimization helper
async function executeOptimizedQuery(query, params = []) {
    const client = await pool.connect();
    try {
        const startTime = process.hrtime.bigint();
        const result = await client.query(query, params);
        const endTime = process.hrtime.bigint();
        const executionTime = Number(endTime - startTime) / 1000000;

        return {
            data: result.rows,
            executionTime: Math.round(executionTime * 100) / 100,
            rowCount: result.rowCount,
            success: true
        };
    } catch (error) {
        throw error;
    } finally {
        client.release();
    }
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
        // Generate a mock orderId for consistency with normalized response
        const mockOrderId = 'DENORM_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        return { orderId: mockOrderId, totalAmount };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

// ==================== ADVANCED OLAP OPERATIONS ====================

// Get sales by store (Normalized) - Enhanced with performance metrics
async function getSalesByStoreNormalized() {
    const query = `
        SELECT
            s.store_name,
            s.location,
            COUNT(o.order_id) as total_orders,
            SUM(o.total_amount) as total_revenue,
            AVG(o.total_amount) as avg_order_value,
            COUNT(DISTINCT o.customer_id) as unique_customers,
            MIN(o.total_amount) as min_order_value,
            MAX(o.total_amount) as max_order_value,
            STDDEV(o.total_amount) as order_value_stddev
        FROM stores s
        LEFT JOIN orders o ON s.store_id = o.store_id
        WHERE o.order_date >= NOW() - INTERVAL '30 days'
        GROUP BY s.store_id, s.store_name, s.location
        ORDER BY total_revenue DESC
    `;

    return await executeOptimizedQuery(query);
}

// Get sales by store (Denormalized) - Enhanced with performance metrics
async function getSalesByStoreDenormalized() {
    const query = `
        SELECT
            store_name,
            store_location as location,
            COUNT(*) as total_orders,
            SUM(total_amount) as total_revenue,
            AVG(total_amount) as avg_order_value,
            COUNT(DISTINCT customer_id) as unique_customers,
            MIN(total_amount) as min_order_value,
            MAX(total_amount) as max_order_value,
            STDDEV(total_amount) as order_value_stddev
        FROM denormalized_orders
        WHERE order_date >= NOW() - INTERVAL '30 days'
        GROUP BY store_id, store_name, store_location
        ORDER BY total_revenue DESC
    `;

    return await executeOptimizedQuery(query);
}

// Get best selling items (Normalized) - Enhanced analytics
async function getBestSellingItemsNormalized() {
    const query = `
        SELECT
            mi.item_name,
            mi.category,
            SUM(oi.quantity) as total_quantity,
            SUM(oi.subtotal) as total_revenue,
            COUNT(DISTINCT oi.order_id) as orders_count,
            AVG(oi.quantity) as avg_quantity_per_order,
            SUM(oi.subtotal) / SUM(oi.quantity) as avg_price_per_unit
        FROM menu_items mi
        JOIN order_items oi ON mi.menu_item_id = oi.menu_item_id
        JOIN orders o ON oi.order_id = o.order_id
        WHERE o.order_date >= NOW() - INTERVAL '30 days'
        GROUP BY mi.menu_item_id, mi.item_name, mi.category
        ORDER BY total_revenue DESC
        LIMIT 10
    `;

    return await executeOptimizedQuery(query);
}

// Get best selling items (Denormalized) - Enhanced analytics
async function getBestSellingItemsDenormalized() {
    const query = `
        SELECT
            item_name,
            category,
            SUM(quantity) as total_quantity,
            SUM(subtotal) as total_revenue,
            COUNT(*) as orders_count,
            AVG(quantity) as avg_quantity_per_order,
            AVG(unit_price) as avg_price_per_unit
        FROM denormalized_orders
        WHERE order_date >= NOW() - INTERVAL '30 days'
        GROUP BY item_name, category
        ORDER BY total_revenue DESC
        LIMIT 10
    `;

    return await executeOptimizedQuery(query);
}

// Advanced Analytics: Customer behavior analysis (Normalized)
async function getCustomerBehaviorNormalized() {
    const query = `
        SELECT
            c.first_name || ' ' || c.last_name as customer_name,
            COUNT(o.order_id) as total_orders,
            SUM(o.total_amount) as total_spent,
            AVG(o.total_amount) as avg_order_value,
            MAX(o.order_date) as last_order_date,
            EXTRACT(DAYS FROM (NOW() - MAX(o.order_date))) as days_since_last_order
        FROM customers c
        JOIN orders o ON c.customer_id = o.customer_id
        WHERE o.order_date >= NOW() - INTERVAL '90 days'
        GROUP BY c.customer_id, c.first_name, c.last_name
        HAVING COUNT(o.order_id) >= 2
        ORDER BY total_spent DESC
        LIMIT 15
    `;

    return await executeOptimizedQuery(query);
}

// Advanced Analytics: Customer behavior analysis (Denormalized)
async function getCustomerBehaviorDenormalized() {
    const query = `
        SELECT
            customer_first_name || ' ' || customer_last_name as customer_name,
            COUNT(*) as total_orders,
            SUM(total_amount) as total_spent,
            AVG(total_amount) as avg_order_value,
            MAX(order_date) as last_order_date,
            EXTRACT(DAYS FROM (NOW() - MAX(order_date))) as days_since_last_order
        FROM denormalized_orders
        WHERE order_date >= NOW() - INTERVAL '90 days'
        GROUP BY customer_id, customer_first_name, customer_last_name
        HAVING COUNT(*) >= 2
        ORDER BY total_spent DESC
        LIMIT 15
    `;

    return await executeOptimizedQuery(query);
}

// Real-time analytics: Peak hours analysis (Normalized)
async function getPeakHoursNormalized() {
    const query = `
        SELECT
            EXTRACT(HOUR FROM o.order_date) as hour_of_day,
            COUNT(o.order_id) as orders_count,
            SUM(o.total_amount) as total_revenue,
            AVG(o.total_amount) as avg_order_value,
            TO_CHAR(o.order_date, 'Day') as day_of_week
        FROM orders o
        WHERE o.order_date >= NOW() - INTERVAL '7 days'
        GROUP BY EXTRACT(HOUR FROM o.order_date), TO_CHAR(o.order_date, 'Day'), EXTRACT(DOW FROM o.order_date)
        ORDER BY orders_count DESC, hour_of_day
        LIMIT 20
    `;

    return await executeOptimizedQuery(query);
}

// Real-time analytics: Peak hours analysis (Denormalized)
async function getPeakHoursDenormalized() {
    const query = `
        SELECT
            order_hour as hour_of_day,
            COUNT(*) as orders_count,
            SUM(total_amount) as total_revenue,
            AVG(total_amount) as avg_order_value,
            CASE
                WHEN order_day >= NOW() - INTERVAL '7 days' THEN TO_CHAR(order_day, 'Day')
                ELSE 'Older Data'
            END as day_of_week
        FROM denormalized_orders
        WHERE order_date >= NOW() - INTERVAL '7 days'
        GROUP BY order_hour, order_day
        ORDER BY orders_count DESC, order_hour
        LIMIT 20
    `;

    return await executeOptimizedQuery(query);
}

// Complex aggregation: Store performance comparison (Normalized)
async function getStorePerformanceComparisonNormalized() {
    const query = `
        SELECT
            s.store_name,
            s.location,
            COUNT(o.order_id) as total_orders,
            SUM(o.total_amount) as total_revenue,
            AVG(o.total_amount) as avg_order_value,
            COUNT(DISTINCT o.customer_id) as unique_customers,
            COUNT(DISTINCT DATE(o.order_date)) as active_days,
            SUM(o.total_amount) / COUNT(DISTINCT DATE(o.order_date)) as revenue_per_day,
            RANK() OVER (ORDER BY SUM(o.total_amount) DESC) as revenue_rank
        FROM stores s
        LEFT JOIN orders o ON s.store_id = o.store_id
        WHERE o.order_date >= NOW() - INTERVAL '30 days'
        GROUP BY s.store_id, s.store_name, s.location
        ORDER BY total_revenue DESC
    `;

    return await executeOptimizedQuery(query);
}

// Complex aggregation: Store performance comparison (Denormalized)
async function getStorePerformanceComparisonDenormalized() {
    const query = `
        SELECT
            store_name,
            store_location as location,
            COUNT(*) as total_orders,
            SUM(total_amount) as total_revenue,
            AVG(total_amount) as avg_order_value,
            COUNT(DISTINCT customer_id) as unique_customers,
            COUNT(DISTINCT order_day) as active_days,
            SUM(total_amount) / COUNT(DISTINCT order_day) as revenue_per_day,
            RANK() OVER (ORDER BY SUM(total_amount) DESC) as revenue_rank
        FROM denormalized_orders
        WHERE order_date >= NOW() - INTERVAL '30 days'
        GROUP BY store_id, store_name, store_location
        ORDER BY total_revenue DESC
    `;

    return await executeOptimizedQuery(query);
}

// ==================== API ENDPOINTS ====================

// Enhanced OLTP Endpoints with better error handling
app.post('/api/oltp/normalized/place-order', async (req, res) => {
    try {
        const { customerId, storeId, employeeId, items } = req.body;

        // Validate input
        if (!customerId || !storeId || !employeeId || !items || items.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: customerId, storeId, employeeId, items',
                code: 'INVALID_INPUT'
            });
        }

        const result = await measureQueryTime(placeOrderNormalized)(customerId, storeId, employeeId, items);

        if (result.success) {
            res.json({
                success: true,
                orderId: result.data.orderId,
                totalAmount: result.data.totalAmount,
                executionTime: result.executionTime,
                message: 'Order placed successfully'
            });
        } else {
            const errorInfo = handleDatabaseError(new Error(result.error), 'placeOrderNormalized');
            res.status(errorInfo.statusCode).json({
                success: false,
                error: errorInfo.error,
                executionTime: result.executionTime
            });
        }
    } catch (error) {
        const errorInfo = handleDatabaseError(error, 'placeOrderNormalized');
        res.status(errorInfo.statusCode).json({
            success: false,
            error: errorInfo.error,
            code: error.code
        });
    }
});

app.post('/api/oltp/denormalized/place-order', async (req, res) => {
    try {
        const { customerData, storeData, employeeData, items } = req.body;

        // Validate input
        if (!customerData || !storeData || !employeeData || !items || items.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: customerData, storeData, employeeData, items',
                code: 'INVALID_INPUT'
            });
        }

        const result = await measureQueryTime(placeOrderDenormalized)(customerData, storeData, employeeData, items);

        if (result.success) {
            res.json({
                success: true,
                orderId: result.data.orderId,
                totalAmount: result.data.totalAmount,
                executionTime: result.executionTime,
                message: 'Order placed successfully'
            });
        } else {
            const errorInfo = handleDatabaseError(new Error(result.error), 'placeOrderDenormalized');
            res.status(errorInfo.statusCode).json({
                success: false,
                error: errorInfo.error,
                executionTime: result.executionTime
            });
        }
    } catch (error) {
        const errorInfo = handleDatabaseError(error, 'placeOrderDenormalized');
        res.status(errorInfo.statusCode).json({
            success: false,
            error: errorInfo.error,
            code: error.code
        });
    }
});

// Enhanced OLAP Endpoints with advanced analytics
app.get('/api/olap/normalized/sales-by-store', async (req, res) => {
    try {
        const result = await measureQueryTime(getSalesByStoreNormalized)();

        if (result.success) {
            res.json({
                success: true,
                data: result.data,
                executionTime: result.executionTime,
                queryType: 'Sales Analysis with Statistical Metrics',
                schema: 'Normalized',
                recordCount: result.data.length
            });
        } else {
            const errorInfo = handleDatabaseError(new Error(result.error), 'getSalesByStoreNormalized');
            res.status(errorInfo.statusCode).json({
                success: false,
                error: errorInfo.error,
                executionTime: result.executionTime
            });
        }
    } catch (error) {
        const errorInfo = handleDatabaseError(error, 'getSalesByStoreNormalized');
        res.status(errorInfo.statusCode).json({
            success: false,
            error: errorInfo.error,
            code: error.code
        });
    }
});

app.get('/api/olap/denormalized/sales-by-store', async (req, res) => {
    try {
        const result = await measureQueryTime(getSalesByStoreDenormalized)();

        if (result.success) {
            res.json({
                success: true,
                data: result.data,
                executionTime: result.executionTime,
                queryType: 'Sales Analysis with Statistical Metrics',
                schema: 'Denormalized',
                recordCount: result.data.length
            });
        } else {
            const errorInfo = handleDatabaseError(new Error(result.error), 'getSalesByStoreDenormalized');
            res.status(errorInfo.statusCode).json({
                success: false,
                error: errorInfo.error,
                executionTime: result.executionTime
            });
        }
    } catch (error) {
        const errorInfo = handleDatabaseError(error, 'getSalesByStoreDenormalized');
        res.status(errorInfo.statusCode).json({
            success: false,
            error: errorInfo.error,
            code: error.code
        });
    }
});

app.get('/api/olap/normalized/best-selling-items', async (req, res) => {
    try {
        const result = await measureQueryTime(getBestSellingItemsNormalized)();

        if (result.success) {
            res.json({
                success: true,
                data: result.data,
                executionTime: result.executionTime,
                queryType: 'Product Performance Analysis',
                schema: 'Normalized',
                recordCount: result.data.length
            });
        } else {
            const errorInfo = handleDatabaseError(new Error(result.error), 'getBestSellingItemsNormalized');
            res.status(errorInfo.statusCode).json({
                success: false,
                error: errorInfo.error,
                executionTime: result.executionTime
            });
        }
    } catch (error) {
        const errorInfo = handleDatabaseError(error, 'getBestSellingItemsNormalized');
        res.status(errorInfo.statusCode).json({
            success: false,
            error: errorInfo.error,
            code: error.code
        });
    }
});

app.get('/api/olap/denormalized/best-selling-items', async (req, res) => {
    try {
        const result = await measureQueryTime(getBestSellingItemsDenormalized)();

        if (result.success) {
            res.json({
                success: true,
                data: result.data,
                executionTime: result.executionTime,
                queryType: 'Product Performance Analysis',
                schema: 'Denormalized',
                recordCount: result.data.length
            });
        } else {
            const errorInfo = handleDatabaseError(new Error(result.error), 'getBestSellingItemsDenormalized');
            res.status(errorInfo.statusCode).json({
                success: false,
                error: errorInfo.error,
                executionTime: result.executionTime
            });
        }
    } catch (error) {
        const errorInfo = handleDatabaseError(error, 'getBestSellingItemsDenormalized');
        res.status(errorInfo.statusCode).json({
            success: false,
            error: errorInfo.error,
            code: error.code
        });
    }
});

// New Advanced Analytics Endpoints
app.get('/api/olap/normalized/customer-behavior', async (req, res) => {
    try {
        const result = await measureQueryTime(getCustomerBehaviorNormalized)();

        if (result.success) {
            res.json({
                success: true,
                data: result.data,
                executionTime: result.executionTime,
                queryType: 'Customer Behavior Analysis',
                schema: 'Normalized',
                recordCount: result.data.length,
                analysis: 'Customer loyalty and spending patterns'
            });
        } else {
            const errorInfo = handleDatabaseError(new Error(result.error), 'getCustomerBehaviorNormalized');
            res.status(errorInfo.statusCode).json({
                success: false,
                error: errorInfo.error,
                executionTime: result.executionTime
            });
        }
    } catch (error) {
        const errorInfo = handleDatabaseError(error, 'getCustomerBehaviorNormalized');
        res.status(errorInfo.statusCode).json({
            success: false,
            error: errorInfo.error,
            code: error.code
        });
    }
});

app.get('/api/olap/denormalized/customer-behavior', async (req, res) => {
    try {
        const result = await measureQueryTime(getCustomerBehaviorDenormalized)();

        if (result.success) {
            res.json({
                success: true,
                data: result.data,
                executionTime: result.executionTime,
                queryType: 'Customer Behavior Analysis',
                schema: 'Denormalized',
                recordCount: result.data.length,
                analysis: 'Customer loyalty and spending patterns'
            });
        } else {
            const errorInfo = handleDatabaseError(new Error(result.error), 'getCustomerBehaviorDenormalized');
            res.status(errorInfo.statusCode).json({
                success: false,
                error: errorInfo.error,
                executionTime: result.executionTime
            });
        }
    } catch (error) {
        const errorInfo = handleDatabaseError(error, 'getCustomerBehaviorDenormalized');
        res.status(errorInfo.statusCode).json({
            success: false,
            error: errorInfo.error,
            code: error.code
        });
    }
});

app.get('/api/olap/normalized/peak-hours', async (req, res) => {
    try {
        const result = await measureQueryTime(getPeakHoursNormalized)();

        if (result.success) {
            res.json({
                success: true,
                data: result.data,
                executionTime: result.executionTime,
                queryType: 'Peak Hours Analysis',
                schema: 'Normalized',
                recordCount: result.data.length,
                analysis: 'Business hours optimization data'
            });
        } else {
            const errorInfo = handleDatabaseError(new Error(result.error), 'getPeakHoursNormalized');
            res.status(errorInfo.statusCode).json({
                success: false,
                error: errorInfo.error,
                executionTime: result.executionTime
            });
        }
    } catch (error) {
        const errorInfo = handleDatabaseError(error, 'getPeakHoursNormalized');
        res.status(errorInfo.statusCode).json({
            success: false,
            error: errorInfo.error,
            code: error.code
        });
    }
});

app.get('/api/olap/denormalized/peak-hours', async (req, res) => {
    try {
        const result = await measureQueryTime(getPeakHoursDenormalized)();

        if (result.success) {
            res.json({
                success: true,
                data: result.data,
                executionTime: result.executionTime,
                queryType: 'Peak Hours Analysis',
                schema: 'Denormalized',
                recordCount: result.data.length,
                analysis: 'Business hours optimization data'
            });
        } else {
            const errorInfo = handleDatabaseError(new Error(result.error), 'getPeakHoursDenormalized');
            res.status(errorInfo.statusCode).json({
                success: false,
                error: errorInfo.error,
                executionTime: result.executionTime
            });
        }
    } catch (error) {
        const errorInfo = handleDatabaseError(error, 'getPeakHoursDenormalized');
        res.status(errorInfo.statusCode).json({
            success: false,
            error: errorInfo.error,
            code: error.code
        });
    }
});

app.get('/api/olap/normalized/store-performance', async (req, res) => {
    try {
        const result = await measureQueryTime(getStorePerformanceComparisonNormalized)();

        if (result.success) {
            res.json({
                success: true,
                data: result.data,
                executionTime: result.executionTime,
                queryType: 'Store Performance Comparison',
                schema: 'Normalized',
                recordCount: result.data.length,
                analysis: 'Multi-dimensional store performance metrics'
            });
        } else {
            const errorInfo = handleDatabaseError(new Error(result.error), 'getStorePerformanceComparisonNormalized');
            res.status(errorInfo.statusCode).json({
                success: false,
                error: errorInfo.error,
                executionTime: result.executionTime
            });
        }
    } catch (error) {
        const errorInfo = handleDatabaseError(error, 'getStorePerformanceComparisonNormalized');
        res.status(errorInfo.statusCode).json({
            success: false,
            error: errorInfo.error,
            code: error.code
        });
    }
});

app.get('/api/olap/denormalized/store-performance', async (req, res) => {
    try {
        const result = await measureQueryTime(getStorePerformanceComparisonDenormalized)();

        if (result.success) {
            res.json({
                success: true,
                data: result.data,
                executionTime: result.executionTime,
                queryType: 'Store Performance Comparison',
                schema: 'Denormalized',
                recordCount: result.data.length,
                analysis: 'Multi-dimensional store performance metrics'
            });
        } else {
            const errorInfo = handleDatabaseError(new Error(result.error), 'getStorePerformanceComparisonDenormalized');
            res.status(errorInfo.statusCode).json({
                success: false,
                error: errorInfo.error,
                executionTime: result.executionTime
            });
        }
    } catch (error) {
        const errorInfo = handleDatabaseError(error, 'getStorePerformanceComparisonDenormalized');
        res.status(errorInfo.statusCode).json({
            success: false,
            error: errorInfo.error,
            code: error.code
        });
    }
});

// System health and performance monitoring endpoint
app.get('/api/system/health', async (req, res) => {
    try {
        const dbStart = process.hrtime.bigint();

        // Test database connectivity
        await pool.query('SELECT 1');

        const dbEnd = process.hrtime.bigint();
        const dbResponseTime = Number(dbEnd - dbStart) / 1000000;

        res.json({
            success: true,
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: {
                database: {
                    status: 'connected',
                    responseTime: Math.round(dbResponseTime * 100) / 100
                },
                application: {
                    status: 'running',
                    uptime: process.uptime(),
                    memory: process.memoryUsage(),
                    version: process.version
                }
            },
            environment: {
                nodeEnv: process.env.NODE_ENV || 'development',
                databaseUrl: process.env.DATABASE_URL ? 'configured' : 'not configured'
            }
        });
    } catch (error) {
        res.status(503).json({
            success: false,
            status: 'unhealthy',
            error: 'Database connection failed',
            timestamp: new Date().toISOString()
        });
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