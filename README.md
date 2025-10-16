# Database Normalization Simulator

An interactive web application that simulates and visualizes the performance differences between normalized and denormalized database designs under OLTP (Online Transaction Processing) and OLAP (Online Analytical Processing) workloads.

## 🎯 Objective

This application demonstrates the fundamental database design principles by comparing normalized (3NF) and denormalized schemas in a realistic fast food chain ordering scenario. It helps students and developers understand the performance trade-offs between data integrity and query performance.

## 🏗️ Architecture

### Tech Stack
- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Chart.js
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL 15
- **Containerization**: Docker & Docker Compose
- **Visualization**: Chart.js for performance comparisons

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

### Simulation Controls

The application provides four simulation modes:

#### 1. Transactional - Normalized (OLTP Write)
- **Workload**: Write-heavy operations
- **Schema**: Normalized (3NF)
- **Operation**: Simulates placing a new order with proper relationships
- **Characteristics**: Multiple INSERT statements with foreign key constraints

#### 2. Transactional - Denormalized (OLTP Write)
- **Workload**: Write-heavy operations
- **Schema**: Denormalized
- **Operation**: Simulates placing a new order in a flat structure
- **Characteristics**: Single INSERT with redundant data

#### 3. Analytical - Normalized (OLAP Read)
- **Workload**: Read-heavy operations
- **Schema**: Normalized (3NF)
- **Operation**: Complex queries with JOINs and aggregations
- **Example**: Sales analysis by store with customer and order data

#### 4. Analytical - Denormalized (OLAP Read)
- **Workload**: Read-heavy operations
- **Schema**: Denormalized
- **Operation**: Simple aggregation queries without JOINs
- **Example**: Sales analysis using pre-aggregated data

### Using the Interface

1. **Select a simulation mode** by clicking one of the four buttons
2. **Wait for execution** - the system will run both normalized and denormalized versions
3. **View results** including:
   - Execution time comparison
   - Performance difference analysis
   - Query structure explanation
   - Sample result data
   - Visual chart comparison

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

## 📈 Expected Performance Patterns

### OLTP Workloads (Transactional)
- **Normalized Schema**: Generally faster for writes due to simpler data validation
- **Denormalized Schema**: Slower writes due to redundant data insertion
- **Use Case**: Point-of-sale systems, order management

### OLAP Workloads (Analytical)
- **Normalized Schema**: Slower reads due to complex JOIN operations
- **Denormalized Schema**: Faster reads with simpler query structures
- **Use Case**: Reporting systems, business intelligence dashboards

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

#### OLTP Endpoints
- `POST /api/oltp/normalized/place-order` - Place order in normalized schema
- `POST /api/oltp/denormalized/place-order` - Place order in denormalized schema

#### OLAP Endpoints
- `GET /api/olap/normalized/sales-by-store` - Sales analysis with JOINs
- `GET /api/olap/denormalized/sales-by-store` - Sales analysis without JOINs
- `GET /api/olap/normalized/best-selling-items` - Item analysis with JOINs
- `GET /api/olap/denormalized/best-selling-items` - Item analysis without JOINs

#### Utility Endpoints
- `GET /api/sample-data` - Get dropdown data for forms

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