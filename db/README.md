# 📊 SmartRoomAssigner Database Schemas

This directory contains all database-related files for SmartRoomAssigner, including schemas, seed data, migrations, and documentation.

## 📁 Database Schema Files

### 🎯 `database_schema.sql` (Original - ~200 lines)
**Status: Legacy - Use for reference only**
- Basic room assignment functionality
- 9 core tables: roles, users, buildings, rooms, exams, students, enrollments, room_assignments
- Missing: Course management, academic terms, comprehensive constraints
- **Do not use** - Superseded by enhanced versions

### ⚡ `enhanced_database_schema.sql` (Enhanced - ~700 lines)
**Status: Production Ready - Recommended for MVP/Production**
- 22 tables with comprehensive improvements
- Core + Academic + Infrastructure + Scheduling tables
- Complete audit system, advanced indexes, triggers
- **Recommended for**: New deployments, production use
- Includes sample data and proper constraints

### 🚀 `ultimate_enterprise_schema.sql` (Enterprise - ~2,500+ lines)
**Status: Enterprise Grade - Future Proof**
- 45+ tables with university-level features
- Complete academic program management, faculty operations, facility intelligence
- GDPR/FERPA compliance, AI analytics, multi-system integration
- **Recommended for**: Large universities, extensive requirements
- Includes advanced security, predictive analytics, comprehensive compliance

## 🗂️ Schema Feature Comparison

| Feature | Original | Enhanced | Enterprise |
|---------|----------|----------|------------|
| **Core Tables** | 9 | 22 | 45+ |
| **Constraints** | Basic | ~50 | ~100+ |
| **Audit System** | None | Basic JSON | Enterprise Audit |
| **Compliance** | None | Basic | GDPR/FERPA |
| **Analytics** | None | Views | AI + Predictive |
| **Integration** | None | Basic | Multi-System API |
| **Scalability** | Limited | High | Enterprise |
| **Production Ready** | ❌ | ✅ | ✅ |

## 📋 File Naming Convention

- `*_schema.sql` - Database schema definitions
- `*_seed.sql` - Sample/test data for initial setup
- `*_migration.sql` - Database migration scripts
- `*_functions.sql` - Custom database functions/triggers
- `*_views.sql` - Database views and reports

## 🚀 Deployment Recommendations

### **For Small/Medium Academic Institutions:**
```bash
# Use Enhanced Schema - Production ready with all essential features
psql -d your_database < db/enhanced_database_schema.sql
```

### **For Large Universities/Multi-Campus:**
```bash
# Use Enterprise Schema - Full academic management system
psql -d your_database < db/ultimate_enterprise_schema.sql
```

### **For Legacy Systems/Upgrading:**
```bash
# Use Original Schema - Maintain backward compatibility
psql -d your_database < db/database_schema.sql
# Then migrate to Enhanced/Enterprise as needed
```

## 📊 Database Architecture Overview

### **Enhanced Schema (22 Tables):**
```
├── System (3): roles, users, system_settings, audit_logs
├── Academic (6): departments, courses, terms_semesters, time_slots, faculty, students, enrollments
├── Infrastructure (2): buildings, rooms
├── Scheduling (4): exams, exam_sessions, room_assignments, room_reservations
├── Operations (4): maintenance_records, notifications
└── Views (3): database_stats, student_exam_schedule, room_utilization
```

### **Enterprise Schema (45+ Tables):**
```
├── Academic Management (8): departments, programs, curriculum, plans, courses, terms, slots
├── Student Lifecycle (6): students, enrollments, accounts, consent, data_requests
├── Faculty Operations (5): faculty, assignments, teaching_assistants
├── Facility Management (4): buildings, rooms, equipment, assignments
├── Scheduling Core (3): exams, sessions, assignments
├── Security & Compliance (6): permissions, guests, incidents, retention, requests, audit_logs
├── Analytics & Intelligence (6): metrics, models, health, trends, utilization, reports
├── Integration (4): external_systems, logs, configuration, notifications
└── Operations (4): reservations, equipment_checkout, maintenance, system_health
```

## 🔧 Database Setup Commands

### **Environment Setup:**
```bash
# Create database
createdb smartroomassigner_production

# Install PostgreSQL extensions (if needed)
psql -d smartroomassigner_production -c "CREATE EXTENSION IF NOT EXISTS pg_trgm;"
psql -d smartroomassigner_production -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```

### **Schema Deployment:**
```bash
# For production (recommended: Enhanced Schema)
psql -d smartroomassigner_production -f db/enhanced_database_schema.sql

# Verify installation
psql -d smartroomassigner_production -c "\dt"
```

### **High Availability Considerations:**
```bash
# For large deployments with Enterprise Schema
psql -d smartroomassigner_production -c "ALTER SYSTEM SET max_connections = 200;"
psql -d smartroomassigner_production -c "ALTER SYSTEM SET shared_buffers = '2GB';"
psql -d smartroomassigner_production -c "ALTER SYSTEM SET work_mem = '64MB';"
```

## 📈 Future Database Evolution

### **Planned Enhancements:**
- **Partitioning strategies** for large tables (audit_logs, performance_metrics)
- **Materialized views** for complex analytical queries
- **Archive/purge procedures** for compliance retention
- **Multi-tenancy support** for multiple institutions

### **Schema Evolution Policy:**
1. **Additive changes only** - Never remove columns/tables without migration
2. **Backward compatibility** - Maintain API compatibility
3. **Versioned schemas** - Tag releases with version numbers
4. **Migration scripts** - Provide upgrade paths between versions

## 🔒 Security & Compliance

### **Audit Trail:**
- All schemas include comprehensive audit logging
- Enterprise schema includes GDPR/FERPA compliance features
- Automatic triggers for critical tables (INSERT/UPDATE/DELETE)

### **Data Protection:**
- Encryption for sensitive fields (passwords, PII)
- Row-level security policies
- Data retention policies with automated purging

### **Backup & Recovery:**
- Regular automated backups recommended
- Point-in-time recovery capability
- Encrypted backups for sensitive data

## 📞 Support & Issues

If you encounter issues with database setup or have questions about schema features:

1. **Check database logs** for specific error messages
2. **Verify PostgreSQL version** (recommended: 13+ for full feature support)
3. **Review README.md** in parent directory for overall system setup
4. **Contact development team** with specific error details

## 📝 Changelog

### **v3.0 - Enterprise Schema (Latest)**
- Added 45+ enterprise-grade tables
- GDPR/FERPA compliance features
- Multi-system integration capabilities
- Predictive analytics and AI features
- Advanced facility management

### **v2.0 - Enhanced Schema**
- 22-table production-ready schema
- Comprehensive constraints and indexing
- Audit system and triggers
- Sample data and views

### **v1.0 - Original Schema (Legacy)**
- Basic 9-table functionality
- Core room assignment features
- Minimal constraints and indexing
