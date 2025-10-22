# 🚀 SmartRoomAssigner Enterprise Setup Guide

**Version 3.0 - Enterprise-Grade University Scheduling Platform**

This guide covers the complete setup and initialization of SmartRoomAssigner using the world's best project architecture with enterprise-grade features.

## 📁 Project Architecture Overview

```
SmartRoomAssigner/
├── 🗄️ db/                   # Database schemas & documentation
├── 💾 data/                 # CSV data with raw/processed lifecycle
├── 🔐 cookies/              # Secure session management
├── 🛠️ utils/                # Data processing & testing utilities
├── 🎨 backend/              # Flask API server
├── 💻 frontend/             # React user interface
└── 📊 Core Infrastructure   # Docker Compose, configs, docs
```

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- **Docker & Docker Compose** (Docker Desktop recommended)
- **Python 3.8+** (for local development)
- **Node.js 18+** (for frontend development)
- **Firefox / GeckoDriver** (for data scraping)
- **Git** (for version control)

### 1. Clone & Setup
```bash
# Clone repository
git clone https://github.com/aydenait2025/SmartRoomAssigner.git
cd SmartRoomAssigner

# Copy environment configuration
cp .env.example .env  # Configure your secrets here

# Make data directories executable
chmod -R 755 data/ cookies/

# Set proper credentials permissions
chmod 600 cookies/*.*
```

### 2. Launch Complete System
```bash
# Start all services (PostgreSQL, Backend, Frontend)
docker-compose up --build

# ✅ Browser opens automatically:
# 🌐 Frontend: http://localhost:3000
# 🔧 Backend API: http://localhost:5000
# 🗄️ Database: postgresql://user:password@localhost:5432/smartroomassign

# 🛑 Stop with: Ctrl+C
```

### 3. Initialize Database Schema
Choose your deployment level:

```bash
# 🎯 RECOMMENDED: Production Enterprise Schema (45+ tables)
docker-compose exec db psql -U user -d smartroomassign -f /docker-entrypoint-initdb.d/enterprise_schema.sql

# OR initialize via API endpoint:
curl http://localhost:5000/init-db

# ✅ Verifies: All tables created, sample data loaded
```

### 4. Load Initial Data
```bash
# Populate UofT campus building data
cd utils
python scrape_buildings.py    # → data/processed/buildings.csv
python scrape_rooms.py        # → data/processed/rooms.csv

# Verify: ls -la ../data/processed/
```

### 5. Verify Everything Works
```bash
# Test data scraping
cd utils && python simple_test.py

# Test full pipeline
python test_comprehensive.py

# ✅ Browser: http://localhost:3000 shows working SmartRoomAssigner
```

## 🏛️ Enterprise Features Activated

### 🗄️ Database Architecture (45+ Tables)
- **23 additional enterprise tables** beyond basic functionality
- **Advanced security** with audit trails and compliance
- **Multi-campus support** with geospatial features
- **Predictive analytics** with machine learning capabilities
- **Integration framework** for SIS/LMS systems

### 🔐 Security & Compliance
- **GDPR/FERPA compliant** with consent tracking
- **Enterprise audit logging** with partitioning
- **Row-level security** and access control
- **Session management** with automatic validation
- **Credential protection** via session encryption

### 📊 Data Engineering
- **Raw → Processed** data lifecycle management
- **Automated Quality Assurance** pipeline
- **Data Source Integration** with external systems
- **Analytics & Reporting** with predictive insights
- **Multi-format Support** (CSV, APIs, streaming)

### 🏢 Infrastructure Excellence
- **Docker orchestration** with health checks
- **Service mesh networking** for microservices
- **Volume management** for data persistence
- **Development/production** environment parity
- **Scalability ready** for load balancing

## 🔧 Advanced Configuration

### Environment Variables Setup
Create `.env` file in root:
```bash
# Database
DATABASE_URL=postgresql://user:password@db:5432/smartroomassign

# Security
SECRET_KEY=your-256-bit-secret-key
JWT_SECRET_KEY=another-jwt-secret-key

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# External Services
REACT_APP_GOOGLE_MAPS_API_KEY=your-maps-api-key
MAIL_SERVER=smtp.gmail.com
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# Feature Flags
ENABLE_ANALYTICS=true
ENABLE_OAUTH=true
SCHEMA_LEVEL=enterprise  # 'basic', 'enhanced', 'enterprise'
```

### Multi-Environment Setup
```bash
# Development
cp docker-compose.yml docker-compose.dev.yml
docker-compose -f docker-compose.dev.yml up

# Production
cp docker-compose.yml docker-compose.prod.yml
# Edit for production settings (volumes, secrets, etc.)
docker-compose -f docker-compose.prod.yml up -d

# Testing
docker-compose -f docker-compose.test.yml up
```

## 📊 Schema Selection Guide

| Schema | Tables | Use Case | Setup Command |
|--------|--------|----------|----------------|
| **Basic** | 9 | MVP/Prototype | `psql -f db/database_schema.sql` |
| **Enhanced** | 22 | Production Deployment | `psql -f db/enhanced_database_schema.sql` |
| **Enterprise** | 45+ | Full University Platform | `psql -f db/ultimate_enterprise_schema.sql` |

### Recommended Schema by Organization Size:
- **Small College (< 5,000 students)**: Enhanced Schema
- **Medium University (5K-20K students)**: Enhanced → Migrate to Enterprise
- **Large University (20K+ students)**: Enterprise Schema from day one
- **Multi-Campus Systems**: Enterprise Schema required

## 🔄 Data Pipeline Operations

### Daily Operations
```bash
# Update building data weekly
cd utils && python scrape_buildings.py

# Refresh room capacities monthly
cd utils && python scrape_rooms.py

# Validate data integrity
python test_comprehensive.py
```

### Backup & Recovery
```bash
# Database backup
docker-compose exec db pg_dump -U user smartroomassign > backup_$(date +%Y%m%d).sql

# Full system backup (includes data/)
tar -czf backup_$(date +%Y%m%d).tar.gz data/ cookies/ db/

# Recovery
docker-compose exec db psql -U user smartroomassign < backup_20241223.sql
```

## 🛠️ Development Workflow

### Adding New Features
1. **Data Layer**: Add schema changes to appropriate SQL file
2. **API Layer**: Update `backend/app.py` with new endpoints
3. **Frontend**: Implement UI in React components
4. **Testing**: Add tests to `utils/` directory
5. **Documentation**: Update guides and READMEs

### Utility Development
```bash
# Create new data processor
cd utils && cp template_processor.py new_feature.py

# Add unit tests
cd utils && python -m pytest test_new_feature.py

# Integration testing
python test_comprehensive.py
```

## 🎯 Supported Use Cases

### 🏛️ For Universities
- **Course Scheduling** with conflict detection
- **Room Assignment** with capacity optimization
- **Exam Management** with supervision tracking
- **Analytics Dashboard** with usage insights
- **Student Portal** with personal scheduling
- **Administrator Portal** with system management
- **Integration** with Banner, Blackboard, PeopleSoft

### 🏢 For Large Organizations
- **Facility Management** with maintenance tracking
- **Event Scheduling** with resource allocation
- **Attendance Tracking** with compliance reporting
- **Multi-Building Support** with location services
- **Security Integration** with access control systems
- **Reporting** with executive dashboards

## 🔧 Troubleshooting

### Database Connection Issues
```bash
# Check if database is running
docker-compose ps db

# Access database directly
docker-compose exec db psql -U user -d smartroomassign

# Reset database completely
docker-compose down -v && docker-compose up --build db
```

### Data Import Issues
```bash
# Verify data files exist
ls -la data/processed/
ls -la data/raw/

# Check file permissions
chmod 644 data/**/*.csv

# Debug scraping scripts
cd utils && python -c "import scrape_buildings; print('Import OK')"
```

### Session Management Issues
```bash
# Verify cookie files exist
ls -la cookies/

# Check file permissions (should be 600)
stat -c "%a %n" cookies/*.*

# Refresh session files
# 1. Login to UofT LMS website manually
# 2. Export session cookies to cookies/user.txt or cookies/admin.txt
# 3. Test with Python session validator
```

### Performance Issues
```bash
# Monitor system resources
docker-compose exec backend ps aux | grep python
docker-compose exec db psql -U user -d smartroomassign -c "SELECT * FROM pg_stat_activity;"

# Optimize database
docker-compose exec db psql -U user -d smartroomassign -c "VACUUM ANALYZE;"

# Scale services if needed
docker-compose up --scale frontend=3 --scale backend=2
```

## 📞 Getting Help

### Documentation Resources
- **`README.md`** - Project overview and getting started
- **`docs/`** - Comprehensive documentation (future)
- **`db/README.md`** - Database schema guide
- **`data/README.md`** - Data pipeline documentation
- **`utils/README.md`** - Utility scripts guide

### Support Channels
1. **GitHub Issues**: Bug reports and feature requests
2. **Wiki**: Step-by-step guides and tutorials
3. **Discussions**: Community questions and answers
4. **Email**: direct support for enterprise deployments

### Enterprise Support
For custom implementations, integrations, or scaling support:
- 📧 Contact: enterprise@smartroomassigner.com
- 📞 Support: Available for enterprise customers
- 🚀 Consulting: Architecture reviews and implementation guidance

## 🎉 Welcome to Enterprise-Grade Education

**SmartRoomAssigner Enterprise Edition** provides university-level scheduling capabilities with compliance, security, and scalability that rivals the best commercial education platforms.

**Ready to transform academic scheduling? Let's get started! 🚀**
