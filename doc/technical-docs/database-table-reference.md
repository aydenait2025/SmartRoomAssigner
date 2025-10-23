# 📊 **Complete Database Table Reference Guide**

## **SmartRoomAssigner Enterprise Database - 47 Tables**

### **Overview**
This comprehensive reference guide provides detailed introductions to all 47 tables in the SmartRoomAssigner enterprise database. Each table is described with its purpose, key fields, relationships, and business context.

---

## 🎯 **PHASE 1: FOUNDATION TABLES (22 Tables)**

### **1-3. Core Authentication & Security (3 Tables)**

#### **`roles`** - User Role Definitions
**Purpose**: Defines system roles with granular permissions
- `name` - Role identifier (admin, faculty, ta, student)
- `permissions` - JSON array of specific permissions
- `hierarchy_level` - Role precedence for access control

#### **`retention_policies`** - GDPR Data Retention Rules
**Purpose**: GDPR/FERPA compliance data retention policies
- `table_name` - Referenced table (users, students, etc.)
- `retention_period` - How long to keep data (7 years default)
- `applicable_laws` - GDPR, FERPA, PIPEDA compliance tracking

#### **`users`** - Master User Accounts
**Purpose**: Centralized user management with enhanced security
- `email` - Unique login identifier with format validation
- `role_id` - References roles table for permissions
- `department_id` - Faculty/department association
- Enhanced security: login attempts, account locking, password expiration

### **4-7. Academic Department Management (4 Tables)**

#### **`academic_departments`** - Faculty & Department Structure
**Purpose**: University departmental organization
- `department_code` - Unique identifier (COMP, MATH, PHYS)
- `faculty_name` - Parent faculty grouping
- `email_domain` - Department-specific email domains
- `headcount_limit` - Enrollment capacity constraints

#### **`academic_programs`** - Degree Programs & Majors
**Purpose**: Academic program definitions and requirements
- `program_code` - Unique program identifier (BSCS, BAHIST)
- `program_type` - Bachelor's, Master's, PhD, Diploma
- `department_id` - Owning department
- `required_credits` - Degree completion requirements
- `duration_years` - Expected completion timeline

#### **`curriculum_requirements`** - Program Requirements Structure
**Purpose**: Flexible curriculum requirements per program
- `program_id` - Associated academic program
- `requirement_type` - Core, Elective, Specialization, Capstone
- `required_credits` - Credit hour requirements
- `is_mandatory` - Requirement classification

#### **`program_course_requirements`** - Course-to-Program Mappings
**Purpose**: Defines which courses belong to which programs
- `program_id` & `course_id` - Program-course relationships
- `year_recommended` - When course should be taken
- `semester_recommended` - Fall, Winter, Summer scheduling
- `prerequisites` - JSON array of prerequisite course codes

### **8-10. Course Catalog Management (3 Tables)**

#### **`courses`** - Course Catalog
**Purpose**: Comprehensive course catalog with academic details
- `course_code` - Unique course identifier (CS101, MATH201)
- `course_name` - Full course title
- `course_level` - 100/200/300/400 undergraduate, GRAD graduate
- `prerequisites/corequisites` - JSON arrays of course codes
- `assessment_methods` - JSON array of grading components
- `typical_enrollment` - Historical enrollment data

#### **`academic_terms`** - Academic Calendar Scheduler
**Purpose**: University term definitions with comprehensive scheduling
- `academic_year` & `season` - 2025 Fall, 2026 Winter
- `term_code` - Unique term identifier (2025F)
- Multiple deadline fields: add/drop, withdrawal, grade submission
- `tuition_rates` - JSON field for complex pricing structures

#### **`time_slots`** - Scheduling Time Blocks
**Purpose**: Predefined time slots for exam scheduling
- `slot_code` - Display name (09:00-10:30)
- `start_time/end_time` - Time range boundaries
- `day_of_week_mask` - Bitmask for M-F scheduling
- `session_type` - Morning/Afternoon/Evening classification

---

## 👥 **PHASE 2: STUDENT MANAGEMENT (6 Tables)**

### **11-16. Student Lifecycle Tracking (6 Tables)**

#### **`students`** - Student Profile Master
**Purpose**: Complete student academic profiles and status
- `user_id` - Links to authentication system
- `student_number` - University-assigned ID (S001000 format)
- `program_id` - Academic program enrollment
- GPA tracking, credits completed/in progress
- Academic standing (Good/Probation/Withdrawn)

#### **`course_enrollments`** - Student Course Registrations
**Purpose**: Detailed enrollment tracking with grading
- `student_id/course_id/term_id` - Complete enrollment triad
- `enrollment_status` - enrolled, dropped, withdrawn, completed
- Grades system: letter grade, points, instructor attribution
- Special accommodations for disability services

#### **`student_accounts`** - Financial Account Management
**Purpose**: Student financial obligations and aid tracking
- `outstanding_tuition` & `account_balance` - Financial status
- `financial_aid_eligible` - Aid qualification status
- Payment plan and collection status tracking

#### **`consent_records`** - GDPR Consent Management
**Purpose**: Track user consent for data processing (GDPR/FERPA)
- `user_id` & `consent_type` - Privacy consent categories
- Consent dates and expiration tracking
- Withdrawal management for subject rights

#### **`data_subject_requests`** - GDPR Subject Access Requests
**Purpose**: Handle GDPR subject access requests (SARs)
- `request_type` - Access, Rectify, Erase, Restrict, Portability
- SLA tracking with `sla_deadline` for compliance
- Processing workflow with approval chains

---

## 🏫 **PHASE 3: FACULTY & STAFF MANAGEMENT (5 Tables)**

### **17-21. Faculty Lifecycle & Compensation (5 Tables)**

#### **`faculty`** - Faculty Profile Management
**Purpose**: Complete faculty profiles and academic roles
- `user_id` - Authentication integration
- `faculty_id` - Unique faculty identifier
- `title` & `tenure_status` - Academic rank tracking
- Research areas and office hours (JSON fields)
- Teaching load and compensation tracking

#### **`faculty_course_assignments`** - Teaching Assignment Tracking
**Purpose**: Faculty course scheduling and compensation
- `faculty_id/course_id/term_id` - Teaching assignment triad
- `assignment_type` - Primary/Secondary instructor status
- `compensation_amount` - Salary/compensation tracking
- `workload_units` - Teaching load calculations

#### **`teaching_assistants`** - TA Management System
**Purpose**: Teaching assistant hiring and scheduling
- Graduate student employment tracking
- `hourly_rate` & `max_hours_per_week` - Compensation structure
- `supervisor_faculty_id` - Faculty mentorship relationships

---

## 🏢 **PHASE 4: FACILITY MANAGEMENT (8 Tables)**

### **22-29. Campus Building Infrastructure (8 Tables)**

#### **`buildings`** - Building Catalog Master
**Purpose**: Campus building inventory with location data
- `building_code` & `building_name` - Building identification
- Geographic coordinates for mapping integration
- Accessibility ratings and emergency contact information
- `fire_systems_installation` dates for compliance

#### **`rooms`** - Room Inventory Management
**Purpose**: Detailed room specifications and capacity
- `building_id/room_number` - Unique room identification
- `capacity` & `exam_capacity` - Seating configurations
- `technology_equipment` - JSON array of room assets
- `accessibility_features` - ADA compliance tracking

#### **`equipment_inventory`** - Technology Equipment Tracking
**Purpose**: Campus technology asset management
- `equipment_type` & `equipment_name` - Asset cataloging
- Warranty and maintenance schedule tracking
- `current_condition` - Asset health assessment
- `cost/accounting` - Financial tracking

#### **`room_equipment_assignments`** - Equipment Deployment
**Purpose**: Track which equipment is in which rooms
- `room_id` & `equipment_id` - Asset-room relationships
- Assignment history with condition tracking
- `removed_date` for asset movement history

---

## 📝 **PHASE 5: SCHEDULING & EXAMS (6 Tables)**

### **30-35. Exam Management System (6 Tables)**

#### **`exams`** - Exam Definition Master
**Purpose**: Complete exam scheduling and logistics
- Course-term association for exam definition
- Duration, special instructions, supervision requirements
- Status tracking: scheduled, confirmed, in-progress, completed
- Rescheduling support with `original_exam_id`

#### **`exam_sessions`** - Multi-Room Exam Coordination
**Purpose**: Individual exam session logistics (multiple rooms per exam)
- `exam_id` & `session_number` - Multi-session exam support
- `room_id/time_slot_id` - Specific room scheduling
- Invigilator and assistant count requirements

#### **`room_assignments`** - Student Exam Seating
**Purpose**: Final student room assignments with seating
- `exam_session_id/student_id` - Student exam participation
- `seat_number` - Maximum 500 seats per session
- Check-in/checkout time tracking for attendance

---

## 🔐 **PHASE 6: SECURITY & ACCESS CONTROL (4 Tables)**

### **36-39. Building & User Security (4 Tables)**

#### **`access_permissions`** - Building Access Permissions
**Purpose**: Granular building access control matrix
- `user_id` & `building_id` (NULL = all buildings)
- `permission_level` - Guest, Standard, Faculty, Admin, Emergency
- Time-restricted access with `expires_at` validation
- `emergency_contact` flag for crisis response

#### **`guest_registrations`** - Visitor Management System
**Purpose**: Campus visitor tracking and access control
- Host-guest relationship management
- `purpose_of_visit` with building access arrays
- Escort requirements and emergency contacts
- Check-in/check-out workflow with approval process

---

## 🌐 **PHASE 7: INTEGRATION & COMPLEXITY (4 Tables)**

### **40-43. External System Integration (4 Tables)**

#### **`external_systems`** - Third-Party System Connections
**Purpose**: Integration hub for SIS/LMS/HR/Finance systems
- Authentication methods: OAuth2, API keys, certificates
- Sync frequency and error count monitoring
- `connection_status` and `last_successful_sync` tracking

#### **`integration_logs`** - API Integration Audit Trail
**Purpose**: Comprehensive logging of external system interactions
- `system_id` with operation status tracking
- Performance metrics with execution time tracking
- Error handling and retry logic support

---

## ⚙️ **PHASE 8: OPERATIONS & MAINTENANCE (6 Tables)**

### **44-49. Facility & System Operations (6 Tables)**

#### **`room_reservations`** - Non-Exam Room Bookings
**Purpose**: Meeting space and event scheduling system
- `room_id/date/time_slot_id` - Unique booking constraints
- Event details with setup/catering requirements
- Approval workflow with recurring meeting support

#### **`equipment_reservations`** - Technology Asset Checkout
**Purpose**: Equipment lending and reservation system
- `equipment_id` with date/time scheduling conflicts
- Condition checks and return verification
- Approval workflow for high-value assets

#### **`maintenance_records`** - Facility Maintenance Tracking
**Purpose**: Comprehensive maintenance record system
- Facility equipment and building maintenance logging
- Contractor information and cost tracking
- `maintenance_type` with priority categorization
- Satisfaction ratings and completion documentation

---

## 📊 **PHASE 9: COMPLIANCE & INCIDENT MANAGEMENT (3 Tables)**

### **50-52. Regulatory Compliance & Security (3 Tables)**

#### **`security_incidents`** - Incident Response System
**Purpose**: Security breach and incident tracking (GDPR/FERPA)
- Incident classification with severity assessment
- Affected data types and user count tracking
- Remediation planning and resolution workflow
- Post-incident lessons learned documentation

---

## 📈 **PHASE 10: ANALYTICS & MONITORING (4 Tables)**

### **53-56. Performance Analytics System (4 Tables)**

#### **`performance_metrics`** - System Performance Analytics
**Purpose**: Comprehensive system performance monitoring
- Partitioned by date for efficient historical queries
- Metric categories: API response times, database queries
- Entity-level tracking (users, rooms, systems)

#### **`predictive_models`** - AI/ML Model Management
**Purpose**: Machine learning model lifecycle management
- Model version control and accuracy tracking
- Training dataset metadata and feature importance
- Deployment and retraining cycle management

---

## 🛠️ **PHASE 11: SYSTEM MANAGEMENT & CONFIGURATION (6 Tables)**

### **57-62. Application Configuration (6 Tables)**

#### **`system_configuration`** - Dynamic System Settings
**Purpose**: Runtime configurable system parameters
- `config_type` validation: string, integer, boolean, json
- `requires_restart` flag for critical settings
- Change audit trail with modification timestamps

#### **`system_notifications`** - Multi-Channel Notification System
**Purpose**: Administration and user notification management
- Multi-recipient support (user, role, external email)
- Priority levels with expiration handling
- Delivery tracking (email sent, read receipts)

---

## 🏷️ **TABLE CATEGORIES SUMMARY**

### **47 Total Tables Organized by Business Function:**

1. **Foundation & Security (11)**: Core users, roles, permissions, MFA
2. **Academic Administration (8)**: Departments, programs, courses, terms
3. **Student Management (6)**: Profiles, enrollments, financial accounts, privacy
4. **Faculty Management (5)**: Staff profiles, assignments, compensation
5. **Facility Management (8)**: Buildings, rooms, equipment, maintenance
6. **Scheduling System (6)**: Exams, sessions, assignments, reservations
7. **Security & Access (4)**: Permissions, guest management, incidents
8. **System Operations (6)**: Reservations, maintenance, notifications
9. **Analytics & AI (4)**: Performance metrics, predictive modeling
10. **Integration & Compliance (4)**: External systems, audit logging

---

## 🔗 **KEY RELATIONSHIP PATTERNS**

### **Core Linking Fields:**
- `user_id` - Links students/faculty to authentication
- `building_id` - Connects rooms to campus locations
- `room_id` - Associates bookings and equipment
- `course_id/term_id` - Academic scheduling core
- `exam_session_id` - Student assignment coordination

### **Hierarchical Structures:**
- User → Student/Faculty → Department/Program
- Building → Rooms → Equipment/Reservations
- Program → Courses → Enrollments → Exams

---

## 🔥 **MISSION CRITICAL TABLES**

### **System Core (Always Required):**
- `users`, `roles` - Authentication foundation
- `buildings`, `rooms` - Physical space management
- `exams`, `exam_sessions`, `room_assignments` - Core business logic

### **Enterprise Features (Scalability):**
- `audit_logs` (partitioned) - Legal compliance
- `mfa_*` tables - Enterprise security
- `performance_metrics` (partitioned) - System monitoring
- `external_systems` - Integration capabilities

---

## 📈 **SCALING CONSIDERATIONS**

### **High-Volume Tables:**
- `audit_logs` - Partitioned monthly for compliance retention
- `performance_metrics` - Partitioned daily for analytics retention
- `course_enrollments` - High query volume, compound indexes required

### **Reference Tables (Cached):**
- `buildings`, `rooms` - Location data (relatively static)
- `courses`, `time_slots` - Scheduling data (periodic updates)
- `roles`, `permissions` - Authorization data (rarely changing)

---

**Ready for production deployment with your chosen PostgreSQL instance!** 🚀📊

*This reference guide ensures comprehensive understanding of your enterprise database architecture.*
