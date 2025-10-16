# Database Normalization Simulator

A modern, interactive web application that simulates and visualizes the performance differences between normalized and denormalized database designs under mixed workloads (OLTP and OLAP). Features advanced analytics, real-time performance monitoring, and comprehensive educational content for database design principles.

## 🎯 Objective

This application demonstrates the fundamental database design principles by comparing normalized (3NF) and denormalized schemas in a realistic fast food chain ordering scenario. It helps students and developers understand the performance trade-offs between data integrity and query performance.

## ✨ Features

### 🎯 Core Features
- **Interactive Tab Navigation** - Modern tab-based interface with Overview, Data & APIs, Analytics, Schema Explorer, and About sections
- **Advanced Workload Simulation** - OLTP (transactional) and OLAP (analytical) operations with 80+ sample orders
- **Real-time Performance Analytics** - Live execution time measurement and comparison
- **Schema Visualization** - Interactive modal for exploring database structure and sample data
- **Educational Content** - Comprehensive explanations of database design principles

### 🚀 Advanced Capabilities
- **Complex Query Analytics** - Customer behavior analysis, peak hours detection, store performance comparison
- **Enhanced Error Handling** - User-friendly error messages with retry options and detailed feedback
- **Professional UI/UX** - Modern blue/gray color palette with responsive design
- **Performance Monitoring** - System health checks and database connectivity monitoring
- **Mobile-First Design** - Optimized for all screen sizes with touch-friendly interactions

### 📊 Performance Features
- **Query Optimization** - High-resolution execution time measurement (milliseconds)
- **Statistical Analysis** - Standard deviation, min/max values, and performance ranking
- **Real-time Feedback** - Loading states, success notifications, and progress indicators
- **Advanced Aggregations** - Multi-dimensional analysis with window functions

## 🏗️ Architecture

### Tech Stack
- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Chart.js 4.4.0
- **Backend**: Node.js with Express.js, enhanced error handling and performance monitoring
- **Database**: PostgreSQL 15 with optimized queries and advanced analytics
- **Containerization**: Docker & Docker Compose with health checks
- **Visualization**: Chart.js for performance comparisons and analytics

### Project Structure
```
database-normalization-simulator/
├── public/                 # Frontend files
│   ├── index.html         # Main HTML interface
│   ├── app.js             # Frontend JavaScript logic
│   └── styles.css         # CSS styling
├── sql/                   # Database schema and data
│   ├── normalized-schema.sql
│   ├── denormalized-schema.sql
│   ├── sample-data-normalized.sql
│   └── sample-data-denormalized.sql
├── server.js              # Express.js backend server
├── package.json           # Node.js dependencies
├── docker-compose.yml     # Docker services configuration
├── Dockerfile             # Node.js application container
└── README.md              # This file
```

## 📊 Database Schemas

### Normalized Schema (3NF)
Follows normalization principles with minimal data redundancy:

- **`customers`** - Customer information
- **`stores`** - Store locations and details
- **`employees`** - Staff information with store relationships
- **`menu_items`** - Available food items with pricing
- **`orders`** - Order headers with customer, store, and employee references
- **`order_items`** - Individual order line items

**Advantages:**
- ✅ Data integrity and consistency
- ✅ Minimal data redundancy
- ✅ Flexible for updates and modifications
- ✅ Better ACID compliance

**Disadvantages:**
- ❌ Complex JOIN operations required
- ❌ Slower read performance for analytics
- ❌ More tables to manage

### Denormalized Schema
Combines multiple entities for optimized read performance:

- **`denormalized_orders`** - Combined order data with redundant customer, store, and employee information
- **`denormalized_analytics`** - Pre-aggregated analytics data for OLAP queries

**Advantages:**
- ✅ Faster read operations (no JOINs needed)
- ✅ Simpler query structures
- ✅ Better performance for analytical queries
- ✅ Reduced query complexity

**Disadvantages:**
- ❌ Data redundancy and potential inconsistencies
- ❌ Larger storage requirements
- ❌ Update anomalies (need to update multiple places)
- ❌ Slower write operations

## 🚀 Quick Start

### Prerequisites
- **Docker** and **Docker Compose**
- **Node.js** 16+ (for development without Docker)
- **Git**

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd database-normalization-simulator
   ```

2. **Start the application with Docker**
   ```bash
   # Start all services (PostgreSQL + Node.js app)
   docker-compose up -d

   # Check service status
   docker-compose ps
   ```

3. **Initialize the database**
   ```bash
   # The database will be automatically initialized with schemas and sample data
   # Wait for PostgreSQL to be ready (check logs with: docker-compose logs postgres)
   ```

4. **Access the application**
   - Open your browser and navigate to: `http://localhost:3000`
   - The application should be running and ready to use

### Alternative Setup (Without Docker)

1. **Install Node.js dependencies**
   ```bash
   npm install
   ```

2. **Set up PostgreSQL manually**
   ```bash
   # Create database
   createdb fastfood_db

   # Run SQL scripts in order
   psql -d fastfood_db -f sql/normalized-schema.sql
   psql -d fastfood_db -f sql/denormalized-schema.sql
   psql -d fastfood_db -f sql/sample-data-normalized.sql
   psql -d fastfood_db -f sql/sample-data-denormalized.sql
   ```

3. **Start the application**
   ```bash
   npm start
   ```

## 🎮 How to Use

### Tab-Based Navigation Interface

The application features a modern tab-based navigation system for intuitive workflow:

#### 1. 🏠 Overview Tab
- **Welcome Section**: Introduction to database normalization concepts
- **Quick Statistics**: Live metrics from current dataset (80+ orders, 4 stores)
- **Getting Started**: Feature overview and navigation guide
- **Best For**: First-time users and quick orientation

#### 2. 🗃️ Data & APIs Tab
- **Simulation Controls**: Organized by workload type (OLTP vs OLAP)
- **Transactional Section**: Order placement simulations
- **Analytical Section**: Query performance testing
- **Real-time Feedback**: Loading states and progress indicators

#### 3. 📊 Analytics Tab
- **Performance Dashboard**: Results from previous simulations
- **Visual Comparisons**: Charts and performance metrics
- **Historical Data**: Execution time trends and patterns
- **Best For**: Performance analysis and optimization

#### 4. 📋 Schema Explorer Tab
- **Database Structure**: Visual representation of both schemas
- **Table Relationships**: Normalized vs denormalized design comparison
- **Sample Data**: Live data preview from actual database
- **Best For**: Understanding database design principles

#### 5. ℹ️ About Tab
- **Educational Content**: Database normalization theory
- **Best Practices**: When to use each schema type
- **Performance Guidelines**: Optimization recommendations
- **Best For**: Learning and reference

### Simulation Workflows

#### Basic OLTP Simulation (Order Placement)
1. **Navigate** to "Data & APIs" tab
2. **Select** "Transactional" section
3. **Choose** Normalized or Denormalized schema
4. **Click** simulation button to execute
5. **View** results in real-time with performance metrics

#### Advanced OLAP Simulation (Analytics)
1. **Navigate** to "Data & APIs" tab
2. **Select** "Analytical" section
3. **Choose** desired schema type
4. **Execute** complex analytical queries
5. **Analyze** performance differences and results

#### Schema Exploration
1. **Navigate** to "Schema Explorer" tab
2. **Click** "Explore Schema Details" button
3. **Browse** Normalized and Denormalized schemas
4. **View** table structures and sample data
5. **Compare** design approaches side-by-side

### Using the Interface

1. **Navigate** between sections using the tab bar
2. **Run simulations** in the "Data & APIs" tab
3. **View results** with enhanced error handling and feedback
4. **Explore schemas** using the interactive modal
5. **Learn concepts** in the educational About section

### Advanced Features

#### Real-time Feedback
- **Loading States**: Progressive loading messages during simulation
- **Success Notifications**: Confirmation when operations complete
- **Error Handling**: User-friendly error messages with retry options
- **Performance Metrics**: High-precision execution time measurement

#### Enhanced Analytics
- **Customer Behavior**: Loyalty and spending pattern analysis
- **Peak Hours Detection**: Business optimization insights
- **Store Performance**: Multi-dimensional performance comparison
- **Statistical Analysis**: Standard deviation and performance ranking

## 🔍 Understanding the Results

### Performance Metrics

- **Execution Time**: Measured in milliseconds
- **Performance Difference**: Relative comparison between schemas
- **Workload Suitability**: Recommendations based on operation type

### Schema Comparison

Each simulation displays:
- **Schema Structure**: Normalized vs Denormalized design
- **Tables Involved**: Database objects used in the operation
- **Query Type**: SQL operation characteristics
- **Result Data**: Sample output from each schema

### Visual Analytics

The integrated Chart.js visualization shows:
- **Bar Chart**: Side-by-side execution time comparison
- **Performance Indicators**: Clear faster/slower indicators
- **Workload Analysis**: Best practice recommendations

## 📈 Performance Benchmarks

### Current Performance Results
Based on testing with 80+ orders across 4 store locations:

#### OLTP Performance (Order Placement)
- **Normalized Schema**: ~15-25ms average execution time
- **Denormalized Schema**: ~20-35ms average execution time
- **Difference**: Normalized typically 20-30% faster for writes

#### OLAP Performance (Analytics Queries)
- **Normalized Schema**: ~40-60ms average execution time
- **Denormalized Schema**: ~25-40ms average execution time
- **Difference**: Denormalized typically 30-40% faster for complex reads

#### Advanced Analytics Performance
- **Customer Behavior Analysis**: ~45-65ms (both schemas)
- **Peak Hours Detection**: ~35-50ms (both schemas)
- **Store Performance Comparison**: ~50-70ms (both schemas)

### Performance Optimizations Implemented

#### Backend Optimizations
- **High-Resolution Timing**: Nanosecond-precision execution time measurement
- **Query Optimization**: Efficient PostgreSQL query plans with proper indexing
- **Connection Pooling**: Optimized database connection management
- **Error Handling**: Enhanced error detection and user-friendly messages

#### Frontend Optimizations
- **Lazy Loading**: Progressive content loading for better UX
- **Caching Strategy**: API response caching for improved performance
- **Responsive Images**: Optimized loading for different screen sizes
- **Modern Animations**: Hardware-accelerated CSS transitions

### Expected Performance Patterns

#### OLTP Workloads (Transactional)
- **Normalized Schema**: Generally faster for writes due to simpler data validation
- **Denormalized Schema**: Slower writes due to redundant data insertion
- **Use Case**: Point-of-sale systems, order management, high-frequency transactions

#### OLAP Workloads (Analytical)
- **Normalized Schema**: Slower reads due to complex JOIN operations
- **Denormalized Schema**: Faster reads with simpler query structures
- **Use Case**: Reporting systems, business intelligence dashboards, data warehousing

#### Advanced Analytics Workloads
- **Customer Analytics**: Both schemas perform similarly with optimized queries
- **Real-time Analytics**: Denormalized schema advantage for time-series data
- **Complex Aggregations**: Performance varies based on query complexity and data volume

## 🛠️ Development

### Project Structure Details

```
public/
├── index.html          # Main application interface
├── app.js             # Frontend simulation logic
│   ├── DatabaseSimulator class
│   ├── OLTP/OLAP simulation methods
│   ├── Chart.js integration
│   └── Performance measurement
└── styles.css         # Responsive styling

sql/
├── normalized-schema.sql      # 3NF table definitions
├── denormalized-schema.sql    # Flat table structure
├── sample-data-normalized.sql # Test data for normalized
└── sample-data-denormalized.sql # Test data for denormalized

server.js              # Express.js API server
├── Database connection (PostgreSQL)
├── OLTP endpoints (/api/oltp/*)
├── OLAP endpoints (/api/olap/*)
├── Performance measurement middleware
└── Static file serving
```

### API Endpoints

#### OLTP Endpoints (Transactional)
- `POST /api/oltp/normalized/place-order` - Place order in normalized schema with validation
- `POST /api/oltp/denormalized/place-order` - Place order in denormalized schema with validation

#### Basic OLAP Endpoints (Analytical)
- `GET /api/olap/normalized/sales-by-store` - Enhanced sales analysis with statistical metrics
- `GET /api/olap/denormalized/sales-by-store` - Enhanced sales analysis with statistical metrics
- `GET /api/olap/normalized/best-selling-items` - Product performance with advanced analytics
- `GET /api/olap/denormalized/best-selling-items` - Product performance with advanced analytics

#### Advanced Analytics Endpoints
- `GET /api/olap/normalized/customer-behavior` - Customer loyalty and spending pattern analysis
- `GET /api/olap/denormalized/customer-behavior` - Customer loyalty and spending pattern analysis
- `GET /api/olap/normalized/peak-hours` - Business hours optimization data
- `GET /api/olap/denormalized/peak-hours` - Business hours optimization data
- `GET /api/olap/normalized/store-performance` - Multi-dimensional store performance metrics
- `GET /api/olap/denormalized/store-performance` - Multi-dimensional store performance metrics

#### System & Monitoring Endpoints
- `GET /api/system/health` - System health check and performance monitoring
- `GET /api/sample-data` - Get sample data for dropdowns and forms

#### Response Format
All endpoints return JSON with consistent structure:
```json
{
  "success": true,
  "data": [...],
  "executionTime": 45.67,
  "queryType": "Sales Analysis",
  "schema": "Normalized",
  "recordCount": 16,
  "analysis": "Statistical performance metrics"
}
```

## 🎓 Educational Value

### Learning Objectives

1. **Database Design Principles**
   - Understanding normalization rules (1NF, 2NF, 3NF)
   - Trade-offs between data integrity and performance
   - When to use normalized vs denormalized designs

2. **Performance Analysis**
   - Measuring query execution times
   - Understanding JOIN complexity
   - Analyzing read vs write performance patterns

3. **Real-World Application**
   - Fast food ordering scenario implementation
   - OLTP vs OLAP workload characteristics
   - Business requirement analysis

### Key Takeaways

- **Normalized schemas** excel in transactional environments where data integrity is crucial
- **Denormalized schemas** perform better for analytical queries and reporting
- **Performance differences** become more significant as data volume grows
- **Schema design** should align with primary use case requirements

## 🔧 Configuration

### Environment Variables

```bash
# Database Configuration
DB_HOST=localhost          # PostgreSQL host
DB_PORT=5432              # PostgreSQL port
DB_NAME=fastfood_db       # Database name
DB_USER=postgres          # Database user
DB_PASSWORD=password      # Database password

# Application Configuration
PORT=3000                 # Application port
NODE_ENV=development      # Environment mode
```

### Docker Configuration

The `docker-compose.yml` includes:
- **PostgreSQL 15** with persistent data storage
- **Node.js application** with hot-reload capability
- **Volume mounting** for SQL initialization scripts
- **Network configuration** for service communication

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check if PostgreSQL container is running
   docker-compose ps

   # View PostgreSQL logs
   docker-compose logs postgres

   # Restart services
   docker-compose down && docker-compose up -d
   ```

2. **Port Already in Use**
   ```bash
   # Change port in docker-compose.yml
   ports:
     - "3001:3000"  # Use different external port
   ```

3. **No Data Appearing**
   ```bash
   # Check database initialization
   docker-compose exec postgres psql -U postgres -d fastfood_db -c "\dt"

   # Verify sample data insertion
   docker-compose logs app
   ```

### Logs and Debugging

```bash
# View all service logs
docker-compose logs

# View specific service logs
docker-compose logs postgres
docker-compose logs app

# Follow logs in real-time
docker-compose logs -f app
```

## 📚 Further Reading

- [Database Normalization](https://en.wikipedia.org/wiki/Database_normalization)
- [OLTP vs OLAP](https://en.wikipedia.org/wiki/OLTP)
- [PostgreSQL Performance](https://www.postgresql.org/docs/current/performance-tips.html)
- [Express.js Documentation](https://expressjs.com/)
- [Chart.js Documentation](https://www.chartjs.org/docs/latest/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

Database Normalization Simulator - Educational tool for understanding database design principles.

---

**Note**: This simulator uses synthetic data and simulated workloads for educational purposes. Performance characteristics may vary in production environments with different data volumes and hardware configurations.