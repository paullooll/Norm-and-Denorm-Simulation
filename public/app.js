// Database Normalization Simulator - Enhanced Frontend JavaScript with Tab Navigation

class DatabaseSimulator {
    constructor() {
        this.performanceChart = null;
        this.tablesModal = null;
        this.currentSchema = 'normalized';
        this.currentTab = 'overview';
        this.initializeEventListeners();
        this.loadSampleData();
        this.loadTableSchemas();
    }

    initializeEventListeners() {
        // Modal functionality
        this.tablesModal = document.getElementById('tablesModal');

        // Close modal when clicking outside
        window.onclick = (event) => {
            if (event.target === this.tablesModal) {
                this.closeTablesModal();
            }
        };

        // Close modal with Escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.tablesModal.style.display !== 'none') {
                this.closeTablesModal();
            }
        });
    }

    // Tab Navigation
    showTab(tabName) {
        // Hide all tab panels
        const tabPanels = document.querySelectorAll('.tab-panel');
        tabPanels.forEach(panel => {
            panel.classList.remove('active');
        });

        // Remove active class from all tab buttons
        const tabButtons = document.querySelectorAll('.tab-nav-button');
        tabButtons.forEach(button => {
            button.classList.remove('active');
        });

        // Show selected tab panel
        const selectedPanel = document.getElementById(tabName);
        if (selectedPanel) {
            selectedPanel.classList.add('active');
        }

        // Add active class to clicked button
        const activeButton = document.querySelector(`[onclick="showTab('${tabName}')"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }

        this.currentTab = tabName;

        // Trigger specific actions for certain tabs
        if (tabName === 'analytics' && this.performanceChart) {
            // Refresh analytics if chart exists
            this.refreshAnalytics();
        }
    }

    refreshAnalytics() {
        // This could be used to refresh analytics data if needed
        console.log('Analytics tab activated');
    }

    async loadSampleData() {
        try {
            const response = await fetch('/api/sample-data');
            const data = await response.json();

            if (data.success) {
                this.sampleData = data;
            }
        } catch (error) {
            console.error('Error loading sample data:', error);
        }
    }

    async runSimulation(workloadType, schemaType) {
        this.showLoading(true);
        this.showResults(false);

        // Add timeout for simulation
        const simulationTimeout = setTimeout(() => {
            this.showLoading(false);
            this.displayError('Simulation timed out. Please try again.');
        }, 30000); // 30 second timeout

        try {
            let normalizedResult, denormalizedResult;

            if (workloadType === 'oltp') {
                // OLTP: Place Order Simulation with enhanced feedback
                this.showLoadingMessage('Generating order data...');
                const orderData = this.generateRandomOrder();

                this.showLoadingMessage('Executing normalized OLTP operation...');
                [normalizedResult, denormalizedResult] = await Promise.all([
                    this.simulateOLTPNormalized(orderData),
                    this.simulateOLTPDenormalized(orderData)
                ]);
            } else {
                // OLAP: Analytics Query Simulation with enhanced feedback
                this.showLoadingMessage('Executing analytical queries...');
                [normalizedResult, denormalizedResult] = await Promise.all([
                    this.simulateOLAPNormalized(),
                    this.simulateOLAPDenormalized()
                ]);
            }

            clearTimeout(simulationTimeout);
            this.displayResults(workloadType, schemaType, normalizedResult, denormalizedResult);
            this.createPerformanceChart(normalizedResult, denormalizedResult);

            // Show success feedback
            this.showSuccessMessage(`Simulation completed successfully! Processed ${workloadType.toUpperCase()} operations in ${schemaType} schema.`);

        } catch (error) {
            clearTimeout(simulationTimeout);
            console.error('Simulation error:', error);
            this.displayError(`Simulation failed: ${error.message || 'Unknown error occurred'}`);
        } finally {
            this.showLoading(false);
            this.showResults(true);
        }
    }

    generateRandomOrder() {
        if (!this.sampleData) {
            // Fallback data if API doesn't work
            return {
                customerId: 1,
                storeId: 1,
                employeeId: 2,
                items: [
                    { menuItemId: 1, name: 'Classic Burger', category: 'Burgers', unitPrice: 8.99, quantity: 1, subtotal: 8.99 }
                ]
            };
        }

        const customer = this.sampleData.customers[Math.floor(Math.random() * this.sampleData.customers.length)];
        const store = this.sampleData.stores[Math.floor(Math.random() * this.sampleData.stores.length)];
        const employee = this.sampleData.employees.filter(emp => emp.position !== 'Store Manager')[Math.floor(Math.random() * 8)];
        const menuItem = this.sampleData.menuItems[Math.floor(Math.random() * this.sampleData.menuItems.length)];

        return {
            customerId: customer.id,
            storeId: store.id,
            employeeId: employee.id,
            items: [{
                menuItemId: menuItem.id,
                name: menuItem.name,
                category: menuItem.category,
                unitPrice: parseFloat(menuItem.price),
                quantity: Math.floor(Math.random() * 3) + 1,
                subtotal: parseFloat(menuItem.price) * (Math.floor(Math.random() * 3) + 1)
            }]
        };
    }

    async simulateOLTPNormalized(orderData) {
        try {
            const response = await fetch('/api/oltp/normalized/place-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerId: orderData.customerId,
                    storeId: orderData.storeId,
                    employeeId: orderData.employeeId,
                    items: orderData.items
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            return {
                executionTime: result.executionTime,
                data: result,
                schemaInfo: {
                    structure: 'Normalized (3NF)',
                    tables: 'customers, stores, employees, menu_items, orders, order_items',
                    query: 'Multiple INSERT statements with JOINs and transactions',
                    recordCount: result.orderId ? 1 : 0
                }
            };
        } catch (error) {
            console.error('OLTP Normalized simulation error:', error);
            throw error;
        }
    }

    async simulateOLTPDenormalized(orderData) {
        if (!this.sampleData) {
            throw new Error('Sample data not available for denormalized simulation');
        }

        const customer = this.sampleData.customers.find(c => c.id === orderData.customerId);
        const store = this.sampleData.stores.find(s => s.id === orderData.storeId);
        const employee = this.sampleData.employees.find(e => e.id === orderData.employeeId);

        const response = await fetch('/api/oltp/denormalized/place-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customerData: {
                    id: customer.id,
                    firstName: customer.first_name,
                    lastName: customer.last_name,
                    email: customer.email,
                    phone: customer.phone
                },
                storeData: {
                    id: store.id,
                    name: store.name,
                    location: store.location,
                    phone: store.phone
                },
                employeeData: {
                    id: employee.id,
                    firstName: employee.first_name,
                    lastName: employee.last_name,
                    position: employee.position
                },
                items: orderData.items
            })
        });

        const result = await response.json();
        return {
            executionTime: result.executionTime,
            data: result,
            schemaInfo: {
                structure: 'Denormalized (Combined)',
                tables: 'denormalized_orders (single table)',
                query: 'Single INSERT with all redundant data'
            }
        };
    }

    async simulateOLAPNormalized() {
        const response = await fetch('/api/olap/normalized/sales-by-store');
        const result = await response.json();

        return {
            executionTime: result.executionTime,
            data: result.data,
            schemaInfo: {
                structure: 'Normalized (3NF)',
                tables: 'stores, orders (with JOINs)',
                query: 'Complex JOIN query with aggregations'
            }
        };
    }

    async simulateOLAPDenormalized() {
        const response = await fetch('/api/olap/denormalized/sales-by-store');
        const result = await response.json();

        return {
            executionTime: result.executionTime,
            data: result.data,
            schemaInfo: {
                structure: 'Denormalized (Combined)',
                tables: 'denormalized_orders (single table)',
                query: 'Simple aggregation query (no JOINs needed)'
            }
        };
    }

    displayResults(workloadType, schemaType, normalizedResult, denormalizedResult) {
        // Update performance metrics
        document.getElementById('normalizedTime').textContent = `${normalizedResult.executionTime}ms`;
        document.getElementById('denormalizedTime').textContent = `${denormalizedResult.executionTime}ms`;

        // Calculate and display performance difference
        const timeDiff = normalizedResult.executionTime - denormalizedResult.executionTime;
        const percentDiff = ((timeDiff / normalizedResult.executionTime) * 100).toFixed(1);

        const diffElement = document.getElementById('performanceDiff');
        if (timeDiff > 0) {
            diffElement.innerHTML = `
                <span class="faster">Denormalized is ${percentDiff}% faster</span>
                <span class="analysis">Better for ${workloadType.toUpperCase()} workloads</span>
            `;
        } else {
            diffElement.innerHTML = `
                <span class="slower">Normalized is ${Math.abs(percentDiff)}% faster</span>
                <span class="analysis">Better for data integrity</span>
            `;
        }

        // Update schema information
        document.getElementById('normalizedStructure').textContent = normalizedResult.schemaInfo.structure;
        document.getElementById('normalizedTables').textContent = normalizedResult.schemaInfo.tables;
        document.getElementById('normalizedQuery').textContent = normalizedResult.schemaInfo.query;

        document.getElementById('denormalizedStructure').textContent = denormalizedResult.schemaInfo.structure;
        document.getElementById('denormalizedTables').textContent = denormalizedResult.schemaInfo.tables;
        document.getElementById('denormalizedQuery').textContent = denormalizedResult.schemaInfo.query;

        // Display results data
        this.displayResultsTable('normalizedResults', normalizedResult.data);
        this.displayResultsTable('denormalizedResults', denormalizedResult.data);
    }

    displayResultsTable(elementId, data) {
        const container = document.getElementById(elementId);

        if (data.success === false) {
            container.innerHTML = `<div class="error">Error: ${data.error}</div>`;
            return;
        }

        if (data.data && Array.isArray(data.data)) {
            // OLAP results (array of data)
            if (data.data.length === 0) {
                container.innerHTML = '<div class="no-data">No data available</div>';
                return;
            }

            const table = this.createTableFromData(data.data);
            container.innerHTML = table;
        } else if (data.orderId) {
            // OLTP results (single order)
            container.innerHTML = `
                <div class="success">
                    <p><strong>Order Placed Successfully!</strong></p>
                    <p>Order ID: ${data.orderId}</p>
                    <p>Total Amount: $${data.totalAmount}</p>
                </div>
            `;
        } else {
            container.innerHTML = '<div class="no-data">No data to display</div>';
        }
    }

    createTableFromData(dataArray) {
        if (!dataArray || dataArray.length === 0) return '';

        const headers = Object.keys(dataArray[0]);

        let html = '<table class="data-table">';
        html += '<thead><tr>';
        headers.forEach(header => {
            html += `<th>${this.formatHeaderName(header)}</th>`;
        });
        html += '</tr></thead>';

        html += '<tbody>';
        dataArray.forEach(row => {
            html += '<tr>';
            headers.forEach(header => {
                html += `<td>${row[header] || 'N/A'}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';

        return html;
    }

    formatHeaderName(header) {
        return header.split('_')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
    }

    createPerformanceChart(normalizedResult, denormalizedResult) {
        const ctx = document.getElementById('performanceChart').getContext('2d');

        // Destroy existing chart if it exists
        if (this.performanceChart) {
            this.performanceChart.destroy();
        }

        this.performanceChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Normalized Schema', 'Denormalized Schema'],
                datasets: [{
                    label: 'Execution Time (ms)',
                    data: [normalizedResult.executionTime, denormalizedResult.executionTime],
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(255, 99, 132, 0.6)'
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 99, 132, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Query Performance Comparison'
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Execution Time (milliseconds)'
                        }
                    }
                }
            }
        });
    }

    showLoading(show) {
        const loadingElement = document.getElementById('loading');
        if (show) {
            loadingElement.style.display = 'flex';
        } else {
            loadingElement.style.display = 'none';
        }
    }

    showLoadingMessage(message) {
        const loadingText = document.querySelector('#loading p');
        if (loadingText) {
            loadingText.textContent = message;
        }
    }

    showSuccessMessage(message) {
        // Create temporary success notification
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">✅</span>
                <span class="notification-message">${message}</span>
            </div>
        `;

        // Add styles for notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, var(--success-green), var(--success-green-light));
            color: white;
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: var(--shadow-lg);
            z-index: 3000;
            animation: slideInRight 0.3s ease-out;
            max-width: 400px;
            font-weight: 500;
        `;

        document.body.appendChild(notification);

        // Remove notification after 4 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 4000);
    }

    showResults(show) {
        const resultsElement = document.getElementById('resultsSection');
        if (show) {
            resultsElement.style.display = 'block';
            // Smooth scroll to results
            resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            resultsElement.style.display = 'none';
        }
    }

    displayError(message) {
        // Create enhanced error display with retry option
        const resultsSection = document.getElementById('resultsSection');
        resultsSection.innerHTML = `
            <div class="error-container">
                <div class="error-header">
                    <span class="error-icon">⚠️</span>
                    <h2>Simulation Error</h2>
                </div>
                <div class="error-message">${message}</div>
                <div class="error-actions">
                    <button class="retry-button" onclick="window.location.reload()">
                        <span>🔄</span>
                        Retry Simulation
                    </button>
                    <button class="help-button" onclick="showTab('about')">
                        <span>📖</span>
                        Get Help
                    </button>
                </div>
                <div class="error-details">
                    <small>If the problem persists, please check your internet connection and try again.</small>
                </div>
            </div>
        `;
        resultsSection.style.display = 'block';

        // Scroll to error
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Modal functionality
    showTablesModal() {
        this.tablesModal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    closeTablesModal() {
        this.tablesModal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore scrolling
    }

    showSchema(schemaType) {
        this.currentSchema = schemaType;

        // Update tab buttons
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.classList.remove('active');
        });
        event.target.classList.add('active');

        // Show/hide schema content
        const normalizedContent = document.getElementById('normalizedSchema');
        const denormalizedContent = document.getElementById('denormalizedSchema');

        if (schemaType === 'normalized') {
            normalizedContent.style.display = 'block';
            denormalizedContent.style.display = 'none';
        } else {
            normalizedContent.style.display = 'none';
            denormalizedContent.style.display = 'block';
        }
    }

    async loadTableSchemas() {
        try {
            // Define schema information
            const normalizedSchema = {
                'customers': {
                    columns: ['customer_id', 'first_name', 'last_name', 'email', 'phone', 'created_at'],
                    description: 'Customer information and contact details'
                },
                'stores': {
                    columns: ['store_id', 'store_name', 'location', 'phone', 'manager_id', 'created_at'],
                    description: 'Store locations and management information'
                },
                'employees': {
                    columns: ['employee_id', 'first_name', 'last_name', 'position', 'store_id', 'hire_date', 'salary', 'created_at'],
                    description: 'Employee details and store assignments'
                },
                'menu_items': {
                    columns: ['menu_item_id', 'item_name', 'category', 'price', 'description', 'available', 'created_at'],
                    description: 'Available menu items and pricing'
                },
                'orders': {
                    columns: ['order_id', 'customer_id', 'store_id', 'employee_id', 'order_date', 'total_amount', 'order_type', 'status'],
                    description: 'Order headers with customer and store references'
                },
                'order_items': {
                    columns: ['order_item_id', 'order_id', 'menu_item_id', 'quantity', 'unit_price', 'subtotal', 'created_at'],
                    description: 'Individual items within each order'
                }
            };

            const denormalizedSchema = {
                'denormalized_orders': {
                    columns: ['order_id', 'order_date', 'total_amount', 'order_type', 'status', 'customer_id', 'customer_first_name', 'customer_last_name', 'customer_email', 'customer_phone', 'store_id', 'store_name', 'store_location', 'store_phone', 'employee_id', 'employee_first_name', 'employee_last_name', 'employee_position', 'menu_item_id', 'item_name', 'category', 'unit_price', 'quantity', 'subtotal', 'order_month', 'order_day', 'order_hour'],
                    description: 'Combined order data with redundant customer, store, and employee information'
                },
                'denormalized_analytics': {
                    columns: ['analytics_id', 'analytics_date', 'store_id', 'store_name', 'category', 'total_orders', 'total_revenue', 'avg_order_value', 'total_customers', 'created_at'],
                    description: 'Pre-aggregated analytics data for OLAP queries'
                }
            };

            // Display normalized schema
            this.displaySchemaTables('normalizedSchema', normalizedSchema);

            // Load sample data for each table
            await this.loadSampleTableData();

        } catch (error) {
            console.error('Error loading table schemas:', error);
        }
    }

    displaySchemaTables(containerId, schemaData) {
        const container = document.querySelector(`#${containerId} .tables-container`);

        let html = '';
        for (const [tableName, tableInfo] of Object.entries(schemaData)) {
            html += `
                <div class="table-card">
                    <h4>${tableName}</h4>
                    <div class="table-info">
                        <strong>Description:</strong> ${tableInfo.description}
                    </div>
                    <div class="table-info">
                        <strong>Columns:</strong>
                        <ul class="column-list">
                            ${tableInfo.columns.map(col => `<li>${col}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="sample-data">
                        <h5>Sample Data:</h5>
                        <div class="data-table-container" id="${tableName}Data">
                            <p>Loading sample data...</p>
                        </div>
                    </div>
                </div>
            `;
        }

        container.innerHTML = html;
    }

    async loadSampleTableData() {
        try {
            // Load sample data from API
            const response = await fetch('/api/sample-data');
            const data = await response.json();

            if (data.success) {
                // Display sample data for normalized tables
                this.displaySampleTableData('customers', data.customers.slice(0, 3));
                this.displaySampleTableData('stores', data.stores.slice(0, 3));
                this.displaySampleTableData('employees', data.employees.slice(0, 3));
                this.displaySampleTableData('menu_items', data.menuItems.slice(0, 3));

                // For orders and order_items, we'd need separate API endpoints
                // For now, show placeholder data
                this.displayPlaceholderData('orders');
                this.displayPlaceholderData('order_items');
                this.displayPlaceholderData('denormalized_orders');
                this.displayPlaceholderData('denormalized_analytics');
            }
        } catch (error) {
            console.error('Error loading sample data:', error);
        }
    }

    displaySampleTableData(tableName, data) {
        const container = document.getElementById(`${tableName}Data`);
        if (!container || !data || data.length === 0) return;

        const headers = Object.keys(data[0]);

        let html = '<table class="data-table">';
        html += '<thead><tr>';
        headers.forEach(header => {
            html += `<th>${this.formatHeaderName(header)}</th>`;
        });
        html += '</tr></thead>';

        html += '<tbody>';
        data.forEach(row => {
            html += '<tr>';
            headers.forEach(header => {
                html += `<td>${row[header] || 'N/A'}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';

        container.innerHTML = html;
    }

    displayPlaceholderData(tableName) {
        const container = document.getElementById(`${tableName}Data`);
        if (!container) return;

        container.innerHTML = `
            <div class="data-table-container">
                <p style="color: #6c757d; font-style: italic;">Sample data available in full application</p>
                <small style="color: #adb5bd;">Table contains ${tableName === 'orders' ? '80+' : '10+'} records</small>
            </div>
        `;
    }
}

// Initialize the simulator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.simulator = new DatabaseSimulator();

    // Show overview tab by default
    window.simulator.showTab('overview');
});

// Make functions globally available
function runSimulation(workloadType, schemaType) {
    window.simulator.runSimulation(workloadType, schemaType);
}

function showTab(tabName) {
    window.simulator.showTab(tabName);
}

// Modal functions for global access
function showTablesModal() {
    window.simulator.showTablesModal();
}

function closeTablesModal() {
    window.simulator.closeTablesModal();
}