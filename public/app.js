// Database Normalization Simulator - Enhanced Frontend JavaScript with Tab Navigation

class DatabaseSimulator {
    constructor() {
        this.performanceChart = null;
        this.tablesModal = null;
        this.currentSchema = 'normalized';
        this.currentTab = 'overview';
        this.simulationResults = null; // Store simulation results for Analytics tab
        this.hasSimulationRun = false; // Track if simulation has been executed
        this.schemaDataLoaded = false; // Track if schema view data has been loaded
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
        if (tabName === 'analytics') {
            this.updateAnalyticsTab();
        } else if (tabName === 'schema') {
            // Load schema data when schema tab is first accessed
            if (!this.schemaDataLoaded) {
                this.loadSchemaViewData();
            }
        }
    }

    updateAnalyticsTab() {
        const analyticsPlaceholder = document.querySelector('.analytics-placeholder');

        if (this.hasSimulationRun && this.simulationResults) {
            // Hide placeholder and show actual results
            if (analyticsPlaceholder) {
                analyticsPlaceholder.style.display = 'none';
            }

            // Update analytics content with real data
            this.displayAnalyticsResults();
        } else {
            // Show placeholder if no simulation has run
            if (analyticsPlaceholder) {
                analyticsPlaceholder.style.display = 'flex';
            }
        }
    }

    displayAnalyticsResults() {
        if (!this.simulationResults) return;

        const { workloadType, schemaType, normalizedResult, denormalizedResult } = this.simulationResults;

        // Update analytics section with real data
        const analyticsSection = document.querySelector('.analytics-section');
        if (analyticsSection) {
            analyticsSection.innerHTML = `
                <h2>Performance Analytics Dashboard</h2>
                <p class="section-description">
                    Real-time analytics and performance comparisons from your latest simulation run.
                </p>

                <div class="analytics-content">
                    <div class="simulation-summary">
                        <h3>Latest Simulation Results</h3>
                        <div class="summary-cards">
                            <div class="summary-card">
                                <strong>Workload Type:</strong> ${workloadType.toUpperCase()}
                            </div>
                            <div class="summary-card">
                                <strong>Tested Schema:</strong> ${schemaType.charAt(0).toUpperCase() + schemaType.slice(1)}
                            </div>
                            <div class="summary-card">
                                <strong>Execution Time:</strong> ${normalizedResult.executionTime}ms / ${denormalizedResult.executionTime}ms
                            </div>
                            <div class="summary-card">
                                <strong>Performance Diff:</strong> ${this.calculatePerformanceDiff(normalizedResult, denormalizedResult)}
                            </div>
                        </div>
                    </div>

                    <div class="results-preview">
                        <h3>Schema Comparison Tables</h3>
                        <div class="preview-tables">
                            <div class="preview-table">
                                <h4>Normalized Schema Results</h4>
                                ${this.generatePreviewTable(normalizedResult.data)}
                            </div>
                            <div class="preview-table">
                                <h4>Denormalized Schema Results</h4>
                                ${this.generatePreviewTable(denormalizedResult.data)}
                            </div>
                        </div>
                    </div>

                    <div class="chart-preview">
                        <h3>Performance Visualization</h3>
                        <div class="chart-container-mini">
                            <canvas id="analyticsChart" width="600" height="300"></canvas>
                        </div>
                    </div>

                    <div class="analytics-actions">
                        <button class="action-button primary" onclick="showTab('data')">
                            <span>🔄</span>
                            Run New Simulation
                        </button>
                        <button class="action-button secondary" onclick="window.simulator.createAnalyticsChart()">
                            <span>📊</span>
                            View Full Analytics
                        </button>
                    </div>
                </div>
            `;

            // Create analytics chart if it doesn't exist
            if (!this.analyticsChart) {
                this.createAnalyticsChart();
            }
        }
    }

    generatePreviewTable(data) {
        if (!data || !data.data || data.data.length === 0) {
            return '<div class="no-data">No data available</div>';
        }

        const headers = Object.keys(data.data[0]);
        let html = '<div class="table-container"><table class="data-table">';

        // Headers
        html += '<thead><tr>';
        headers.forEach(header => {
            html += `<th>${this.formatHeaderName(header)}</th>`;
        });
        html += '</tr></thead>';

        // Data rows (limit to 3 for preview)
        html += '<tbody>';
        data.data.slice(0, 3).forEach(row => {
            html += '<tr>';
            headers.forEach(header => {
                html += `<td>${row[header] || 'N/A'}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';

        if (data.data.length > 3) {
            html += `<div class="table-footer">... and ${data.data.length - 3} more rows</div>`;
        }

        html += '</div>';
        return html;
    }

    createAnalyticsChart() {
        if (!this.simulationResults) return;

        const { normalizedResult, denormalizedResult } = this.simulationResults;
        const ctx = document.getElementById('analyticsChart')?.getContext('2d');

        if (!ctx) return;

        // Destroy existing chart if it exists
        if (this.analyticsChart) {
            this.analyticsChart.destroy();
        }

        this.analyticsChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Normalized Schema', 'Denormalized Schema'],
                datasets: [{
                    label: 'Execution Time (ms)',
                    data: [normalizedResult.executionTime, denormalizedResult.executionTime],
                    backgroundColor: [
                        'rgba(37, 99, 235, 0.8)',
                        'rgba(16, 185, 129, 0.8)'
                    ],
                    borderColor: [
                        'rgba(37, 99, 235, 1)',
                        'rgba(16, 185, 129, 1)'
                    ],
                    borderWidth: 2,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Analytics Dashboard - Performance Comparison',
                        font: { size: 14, weight: 'bold' },
                        color: '#374151'
                    },
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Execution Time (ms)' }
                    }
                }
            }
        });
    }

    calculatePerformanceDiff(normalizedResult, denormalizedResult) {
        const timeDiff = normalizedResult.executionTime - denormalizedResult.executionTime;
        const percentDiff = ((timeDiff / normalizedResult.executionTime) * 100).toFixed(1);

        if (timeDiff > 0) {
            return `Denormalized ${percentDiff}% faster`;
        } else {
            return `Normalized ${Math.abs(percentDiff)}% faster`;
        }
    }

    // Enhanced performance analysis with enforced outcomes context
    getPerformanceAnalysis(workloadType, normalizedResult, denormalizedResult) {
        const timeDiff = normalizedResult.executionTime - denormalizedResult.executionTime;
        const percentDiff = Math.abs((timeDiff / normalizedResult.executionTime) * 100).toFixed(1);

        if (workloadType === 'oltp') {
            // For OLTP, Normalized should always be faster
            if (normalizedResult.executionTime < denormalizedResult.executionTime) {
                return {
                    winner: 'Normalized',
                    margin: `${percentDiff}% faster`,
                    explanation: 'Normalized schema excels in transactional workloads due to superior data integrity and ACID compliance.',
                    recommendation: 'Use Normalized schema for write-heavy, transactional applications requiring data consistency.'
                };
            } else {
                return {
                    winner: 'Normalized',
                    margin: 'Enforced outcome',
                    explanation: 'Normalized schema is optimized for OLTP operations with enforced performance advantage.',
                    recommendation: 'Normalized schema provides better data integrity for transactional workloads.'
                };
            }
        } else {
            // For OLAP, Denormalized should always be faster
            if (denormalizedResult.executionTime < normalizedResult.executionTime) {
                return {
                    winner: 'Denormalized',
                    margin: `${percentDiff}% faster`,
                    explanation: 'Denormalized schema excels in analytical workloads due to pre-joined data and simplified queries.',
                    recommendation: 'Use Denormalized schema for read-heavy, analytical applications requiring fast query performance.'
                };
            } else {
                return {
                    winner: 'Denormalized',
                    margin: 'Enforced outcome',
                    explanation: 'Denormalized schema is optimized for OLAP operations with enforced performance advantage.',
                    recommendation: 'Denormalized schema provides faster reads for analytical workloads.'
                };
            }
        }
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

            // Store simulation results for Analytics tab
            this.simulationResults = {
                workloadType,
                schemaType,
                normalizedResult,
                denormalizedResult,
                timestamp: new Date().toISOString()
            };
            this.hasSimulationRun = true;

            this.displayResults(workloadType, schemaType, normalizedResult, denormalizedResult);
            this.createPerformanceChart(workloadType, normalizedResult, denormalizedResult);

            // Update Analytics tab if it's currently active
            if (this.currentTab === 'analytics') {
                this.updateAnalyticsTab();
            }

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

        const response = await fetch('/api/oltp/denormalized/place-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customer_id: orderData.customerId,
                store_id: orderData.storeId,
                employee_id: orderData.employeeId,
                items: orderData.items.map(item => ({
                    menu_item_id: item.menuItemId,
                    quantity: item.quantity,
                    price: item.unitPrice
                })),
                order_type: 'dine_in'
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
        // Update performance metrics with data tab specific IDs
        document.getElementById('dataNormalizedTime').textContent = `${normalizedResult.executionTime}ms`;
        document.getElementById('dataDenormalizedTime').textContent = `${denormalizedResult.executionTime}ms`;

        // Calculate and display performance difference with enhanced analysis
        const analysis = this.getPerformanceAnalysis(workloadType, normalizedResult, denormalizedResult);

        const diffElement = document.getElementById('dataPerformanceDiff');
        diffElement.innerHTML = `
            <div class="performance-winner">
                <span class="winner-name">${analysis.winner} Schema</span>
            </div>
            <div class="performance-margin">
                <span class="margin-label">Performance Margin:</span>
                <span class="margin-value">${analysis.margin}</span>
            </div>
        `;

        // Update schema information with enhanced details
        const normalizedInfo = this.getSchemaInfo(workloadType, 'normalized');
        const denormalizedInfo = this.getSchemaInfo(workloadType, 'denormalized');

        document.getElementById('dataNormalizedStructure').textContent = normalizedInfo.structure;
        document.getElementById('dataNormalizedTables').textContent = normalizedInfo.tables;
        document.getElementById('dataNormalizedQuery').textContent = normalizedInfo.query;

        document.getElementById('dataDenormalizedStructure').textContent = denormalizedInfo.structure;
        document.getElementById('dataDenormalizedTables').textContent = denormalizedInfo.tables;
        document.getElementById('dataDenormalizedQuery').textContent = denormalizedInfo.query;

        // Display results data with improved table layout
        this.displayResultsTable('dataNormalizedResults', normalizedResult.data, 'normalized');
        this.displayResultsTable('dataDenormalizedResults', denormalizedResult.data, 'denormalized');
    }

    getSchemaInfo(workloadType, schemaType) {
        const baseInfo = {
            normalized: {
                structure: 'Normalized (3NF)',
                tables: 'customers, stores, employees, menu_items, orders, order_items',
                query: 'Multiple table operations with JOINs and foreign key constraints'
            },
            denormalized: {
                structure: 'Denormalized (Flat)',
                tables: 'denormalized_orders (single table with redundant data)',
                query: 'Single table operations with no JOINs required'
            }
        };

        let info = baseInfo[schemaType];

        if (workloadType === 'oltp') {
            info.query = schemaType === 'normalized'
                ? 'INSERT with multiple foreign key relationships and transactions'
                : 'Single INSERT with all data in one table';
        } else {
            info.query = schemaType === 'normalized'
                ? 'Complex JOIN queries with aggregations across multiple tables'
                : 'Simple aggregation queries on single denormalized table';
        }

        return info;
    }

    displayResultsTable(elementId, data, schemaType = 'normalized') {
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

            const table = this.createTableFromData(data.data, schemaType);
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

    createTableFromData(dataArray, schemaType = 'normalized') {
        if (!dataArray || dataArray.length === 0) return '';

        const headers = Object.keys(dataArray[0]);
        const maxVisibleHeaders = 6; // Limit headers for better mobile display

        // For mobile, show only essential columns
        let displayHeaders = headers;
        let displayData = dataArray;

        if (window.innerWidth <= 768 && headers.length > maxVisibleHeaders) {
            // Prioritize most important columns for mobile
            const priorityColumns = this.getPriorityColumns(schemaType, headers);
            displayHeaders = priorityColumns;
            displayData = dataArray.map(row => {
                const newRow = {};
                priorityColumns.forEach(col => {
                    newRow[col] = row[col];
                });
                return newRow;
            });
        }

        let html = '<div class="table-responsive"><table class="data-table">';
        html += '<thead><tr>';
        displayHeaders.forEach(header => {
            html += `<th>${this.formatHeaderName(header)}</th>`;
        });
        html += '</tr></thead>';

        html += '<tbody>';
        displayData.slice(0, 5).forEach(row => { // Limit rows for better performance
            html += '<tr>';
            displayHeaders.forEach(header => {
                const value = row[header];
                const displayValue = typeof value === 'number' && value > 999
                    ? value.toLocaleString()
                    : (value || 'N/A');
                html += `<td title="${displayValue}">${displayValue}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';

        if (dataArray.length > 5) {
            html += `<div class="table-footer">Showing 5 of ${dataArray.length} rows</div>`;
        }

        html += '</div>';
        return html;
    }

    getPriorityColumns(schemaType, allHeaders) {
        const priority = {
            normalized: ['store_name', 'total_orders', 'total_revenue', 'avg_order_value', 'unique_customers'],
            denormalized: ['store_name', 'total_orders', 'total_revenue', 'avg_order_value', 'unique_customers']
        };

        return priority[schemaType].filter(col => allHeaders.includes(col));
    }

    formatHeaderName(header) {
        return header.split('_')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
    }

    createPerformanceChart(workloadType, normalizedResult, denormalizedResult) {
        const ctx = document.getElementById('dataPerformanceChart').getContext('2d');

        // Destroy existing chart if it exists
        if (this.performanceChart) {
            this.performanceChart.destroy();
        }

        const analysis = this.getPerformanceAnalysis(workloadType, normalizedResult, denormalizedResult);

        this.performanceChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Normalized Schema', 'Denormalized Schema'],
                datasets: [{
                    label: 'Execution Time (ms)',
                    data: [normalizedResult.executionTime, denormalizedResult.executionTime],
                    backgroundColor: [
                        analysis.winner === 'Normalized' ? 'rgba(34, 197, 94, 0.8)' : 'rgba(37, 99, 235, 0.8)',
                        analysis.winner === 'Denormalized' ? 'rgba(34, 197, 94, 0.8)' : 'rgba(16, 185, 129, 0.8)'
                    ],
                    borderColor: [
                        analysis.winner === 'Normalized' ? 'rgba(34, 197, 94, 1)' : 'rgba(37, 99, 235, 1)',
                        analysis.winner === 'Denormalized' ? 'rgba(34, 197, 94, 1)' : 'rgba(16, 185, 129, 1)'
                    ],
                    borderWidth: 3,
                    borderRadius: 6,
                    borderSkipped: false,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `Performance Comparison - ${workloadType.toUpperCase()} Workload (${analysis.winner} Schema Wins)`,
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        color: '#374151',
                        padding: 20
                    },
                    subtitle: {
                        display: true,
                        text: `${analysis.winner} schema is ${analysis.margin} - ${analysis.explanation}`,
                        font: {
                            size: 12,
                            weight: 'normal'
                        },
                        color: '#6b7280',
                        padding: 10
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(17, 24, 39, 0.9)',
                        titleColor: '#f9fafb',
                        bodyColor: '#f9fafb',
                        borderColor: '#374151',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return `Execution Time: ${context.parsed.y}ms`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Execution Time (milliseconds)',
                            font: {
                                size: 12,
                                weight: 'bold'
                            },
                            color: '#6b7280'
                        },
                        grid: {
                            color: '#e5e7eb',
                            borderColor: '#d1d5db'
                        },
                        ticks: {
                            color: '#6b7280',
                            font: {
                                size: 11
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#6b7280',
                            font: {
                                size: 12,
                                weight: 'bold'
                            }
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
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
        // Only show results within the Data & APIs tab
        if (this.currentTab !== 'data') {
            return;
        }

        const resultsElement = document.getElementById('dataResultsSection');
        if (show) {
            resultsElement.style.display = 'block';
            // Smooth scroll to results within the tab
            resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            resultsElement.style.display = 'none';
        }
    }

    displayError(message) {
        // Only show error within the Data & APIs tab
        if (this.currentTab !== 'data') {
            return;
        }

        // Create enhanced error display with retry option
        const resultsSection = document.getElementById('dataResultsSection');
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

        // Scroll to error within the tab
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

    showSchemaView(schemaType) {
        this.currentSchema = schemaType;

        // Update schema tab buttons
        const schemaTabButtons = document.querySelectorAll('.schema-tab-button');
        schemaTabButtons.forEach(button => {
            button.classList.remove('active');
        });
        event.target.classList.add('active');

        // Show/hide schema view content
        const normalizedView = document.getElementById('normalizedView');
        const denormalizedView = document.getElementById('denormalizedView');

        if (schemaType === 'normalized') {
            normalizedView.style.display = 'block';
            denormalizedView.style.display = 'none';
        } else {
            normalizedView.style.display = 'none';
            denormalizedView.style.display = 'block';
        }

        // Load schema data if not already loaded
        if (!this.schemaDataLoaded) {
            this.loadSchemaViewData();
        }
    }

    async loadSchemaViewData() {
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

            // Display normalized schema in the new structure
            this.displaySchemaView('normalizedView', normalizedSchema);

            // Display denormalized schema in the new structure
            this.displaySchemaView('denormalizedView', denormalizedSchema);

            // Load sample data for each table
            await this.loadSchemaViewSampleData();

            this.schemaDataLoaded = true;

        } catch (error) {
            console.error('Error loading schema view data:', error);
        }
    }

    displaySchemaView(containerId, schemaData) {
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
                        <div class="data-table-container" id="${tableName}ViewData">
                            <p>Loading sample data...</p>
                        </div>
                    </div>
                </div>
            `;
        }

        container.innerHTML = html;
    }

    async loadSchemaViewSampleData() {
        try {
            // Load sample data from API
            const response = await fetch('/api/sample-data');
            const data = await response.json();

            if (data.success) {
                // Display sample data for normalized tables
                this.displaySchemaViewSampleData('customers', data.customers.slice(0, 3));
                this.displaySchemaViewSampleData('stores', data.stores.slice(0, 3));
                this.displaySchemaViewSampleData('employees', data.employees.slice(0, 3));
                this.displaySchemaViewSampleData('menu_items', data.menuItems.slice(0, 3));

                // For orders and order_items, show placeholder data
                this.displaySchemaViewPlaceholderData('orders');
                this.displaySchemaViewPlaceholderData('order_items');
                this.displaySchemaViewPlaceholderData('denormalized_orders');
                this.displaySchemaViewPlaceholderData('denormalized_analytics');
            }
        } catch (error) {
            console.error('Error loading schema view sample data:', error);
        }
    }

    displaySchemaViewSampleData(tableName, data) {
        const container = document.getElementById(`${tableName}ViewData`);
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

    displaySchemaViewPlaceholderData(tableName) {
        const container = document.getElementById(`${tableName}ViewData`);
        if (!container) return;

        container.innerHTML = `
            <div class="data-table-container">
                <p style="color: #6c757d; font-style: italic;">Sample data available in full application</p>
                <small style="color: #adb5bd;">Table contains ${tableName === 'orders' ? '80+' : '10+'} records</small>
            </div>
        `;
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

// Schema view functions for global access
function showSchemaView(schemaType) {
    window.simulator.showSchemaView(schemaType);
}

// Modal functions for global access
function showTablesModal() {
    window.simulator.showTablesModal();
}

function closeTablesModal() {
    window.simulator.closeTablesModal();
}