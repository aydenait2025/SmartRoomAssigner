# 🏗️ **System Architecture Deep Dive**

## **SmartRoomAssigner Technical Architecture Overview**

This document provides a comprehensive technical overview of SmartRoomAssigner's architecture, components, data flow, and design decisions for developers who need to understand, maintain, or extend the system.

---

## 🎯 **Architecture Overview**

### **High-Level System Architecture**
```mermaid
graph TB
    subgraph "Client Layer"
        A1[Student Portal]
        A2[Admin Dashboard]
        A3[TA Interface]
    end

    subgraph "Presentation Layer"
        B1[React Application]
        B2[Redux Store]
        B3[React Router]
        B4[Axios Client]
    end

    subgraph "Application Layer"
        C1[Flask API Server]
        C2[CORS Middleware]
        C3[JWT Authentication]
        C4[Input Validation]
    end

    subgraph "Business Logic Layer"
        D1[Assignment Engine]
        D2[Notification Service]
        D3[Conflict Resolution]
        D4[Validation Rules]
    end

    subgraph "Data Layer"
        E1[PostgreSQL Database]
        E2[Redis Cache]
        E3[File Storage]
        E4[Session Store]
    end

    subgraph "Infrastructure Layer"
        F1[Docker Containers]
        F2[Load Balancer]
        F3[Monitoring Stack]
        F4[CI/CD Pipeline]
    end

    A1 --> B1
    A2 --> B1
    A3 --> B1

    B1 --> B2
    B1 --> B3
    B1 --> B4

    B4 --> C1
    C1 --> C2
    C1 --> C3
    C1 --> C4

    C1 --> D1
    C1 --> D2
    C1 --> D3
    C1 --> D4

    D1 --> E1
    D2 --> E1
    D3 --> E1
    D4 --> E1
    D1 --> E2
    D2 --> E3
    D3 --> E4

    E1 --> F1
    E2 --> F1
    F1 --> F2
    F2 --> F3
    F3 --> F4
```

---

## 🌐 **Component Deep Dive**

### **Frontend Architecture (React Application)**

#### **Technology Stack**
```
Frontend Stack:
├── React 18.2.0 - Core framework
├── TypeScript - Type safety
├── Redux Toolkit - State management
├── React Router 6.4 - Routing
├── Axios - HTTP client
├── Tailwind CSS - Styling
├── React Hook Form - Form handling
├── React Testing Library - Testing
└── Leaflet - Maps integration
```

#### **Application Structure**
```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── admin/           # Admin-specific components
│   │   ├── student/         # Student-specific components
│   │   ├── common/          # Shared components
│   │   └── layout/          # Layout components
│   ├── hooks/               # Custom React hooks
│   ├── services/            # API service layer
│   ├── store/               # Redux store configuration
│   ├── utils/               # Utility functions
│   ├── types/               # TypeScript type definitions
│   └── styles/              # Global styles and themes
├── public/                  # Static assets
└── tests/                   # Test files
```

#### **State Management Architecture**
```mermaid
graph TD
    subgraph "Redux Store Structure"
        A[Root Store] --> B[User Slice]
        A --> C[Assignment Slice]
        A --> D[Building Slice]
        A --> E[Notification Slice]
        A --> F[Admin Slice]

        B --> B1[Auth State]
        B --> B2[Profile]
        C --> C1[Assignments List]
        C --> C2[Assignment Details]
        D --> D1[Buildings Data]
        D --> D2[Room Status]
        E --> E1[Notifications Queue]
        F --> F1[Admin Settings]
    end

    subgraph "Async Operations"
        G[Redux Thunk] --> H[API Calls]
        H --> I[Loading States]
        I --> J[Success/Error Handling]
    end

    subgraph "Persistence"
        K[Redux Persist] --> L[Local Storage]
        L --> M[Session Recovery]
    end
```

### **Backend Architecture (Flask API Server)**

#### **Technology Stack**
```
Backend Stack:
├── Flask 2.3.0 - Web framework
├── Flask-SQLAlchemy - ORM
├── Flask-JWT-Extended - JWT authentication
├── Flask-CORS - Cross-origin support
├── PostgreSQL 13 - Primary database
├── Redis 6.2 - Caching and sessions
├── Celery 5.3 - Task queuing
└── Gunicorn - WSGI server
```

#### **API Structure**
```
backend/
├── app/
│   ├── models/              # SQLAlchemy models
│   │   ├── user.py          # User model
│   │   ├── student.py       # Student model
│   │   ├── room.py          # Room model
│   │   ├── assignment.py    # Assignment model
│   │   └── exam.py          # Exam model
│   ├── routes/              # API route handlers
│   │   ├── auth.py          # Authentication routes
│   │   ├── students.py      # Student CRUD
│   │   ├── rooms.py         # Room management
│   │   ├── assignments.py   # Assignment operations
│   │   └── system.py        # System utilities
│   ├── services/            # Business logic services
│   │   ├── assignment_service.py
│   │   ├── notification_service.py
│   │   └── validation_service.py
│   ├── extensions/          # Flask extensions
│   ├── utils/               # Helper utilities
│   └── config/              # Configuration management
├── migrations/              # Database migrations
├── tests/                   # Unit and integration tests
└── requirements.txt         # Python dependencies
```

---

## 💾 **Database Architecture**

### **Database Schema Overview**
```sql
-- Core Tables and Relationships
SmartRoomAssigner Database Schema

users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
)

students (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    student_number VARCHAR(50) UNIQUE,
    student_id VARCHAR(50) UNIQUE,
    department VARCHAR(100),
    user_id INTEGER REFERENCES users(id)
)

buildings (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    address TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8)
)

rooms (
    id SERIAL PRIMARY KEY,
    building_id INTEGER REFERENCES buildings(id),
    room_number VARCHAR(50) NOT NULL,
    capacity INTEGER NOT NULL,
    floor INTEGER,
    room_type VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE
)

courses (
    id SERIAL PRIMARY KEY,
    course_code VARCHAR(20) UNIQUE NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    instructor VARCHAR(255)
)

exams (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id),
    exam_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration INTEGER, -- minutes
    created_by INTEGER REFERENCES users(id)
)

assignments (
    id SERIAL PRIMARY KEY,
    exam_id INTEGER REFERENCES exams(id),
    student_id INTEGER REFERENCES students(id),
    room_id INTEGER REFERENCES rooms(id),
    seat_number VARCHAR(10),
    assigned_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active'
)

notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    message TEXT,
    notification_type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
)
```

### **Database Relationships**
```mermaid
graph TD
    A[Users] --> B[Students]
    A --> C[Exams.created_by]

    B --> D[Assignments.student_id]

    E[Buildings] --> F[Rooms.building_id]

    F --> G[Assignments.room_id]

    H[Courses] --> I[Exams.course_id]

    I --> J[Assignments.exam_id]

    A --> K[Notifications.user_id]

    classDef pk fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef fk fill:#fff3e0,stroke:#e65100,stroke-width:2px

    class A,E,H pk
    class B,C,D,F,G,I,J,K fk
```

### **Indexing Strategy**
```sql
-- Performance Indexes
CREATE INDEX idx_students_student_number ON students(student_number);
CREATE INDEX idx_students_student_id ON students(student_id);
CREATE INDEX idx_rooms_building_room ON rooms(building_id, room_number);
CREATE INDEX idx_assignments_exam_room ON assignments(exam_id, room_id);
CREATE INDEX idx_exams_date_time ON exams(exam_date, start_time);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_assignments_status ON assignments(status);

-- Partial Indexes for Active Records
CREATE INDEX idx_rooms_active ON rooms(building_id, room_number) WHERE is_active = TRUE;
CREATE INDEX idx_assignments_active ON assignments(exam_id) WHERE status = 'active';

-- Composite Indexes for Common Queries
CREATE INDEX idx_students_name ON students(last_name, first_name);
CREATE INDEX idx_exams_course_date ON exams(course_id, exam_date);
```

---

## 🔄 **Data Flow Architecture**

### **Complete Request Flow Example**
```mermaid
sequenceDiagram
    participant User
    participant React as React App
    participant Axios as HTTP Client
    participant Flask as Flask API
    participant Auth as JWT Auth
    participant Service as Business Service
    participant Model as SQLAlchemy Model
    participant DB as PostgreSQL
    participant Cache as Redis Cache

    User->>React: Click "Assign Rooms"
    React->>Axios: POST /api/assign-students
    Axios->>Flask: HTTP POST with JWT token

    Flask->>Auth: Validate JWT token
    Auth-->>Flask: User authenticated ✅

    Flask->>Service: Call assignment algorithm
    Service->>DB: Query available students
    DB-->>Service: Return student list

    Service->>DB: Query available rooms
    DB-->>Service: Return room inventory

    Service->>Cache: Check cached results
    Cache-->>Service: No cache hit

    Service->>Service: Run assignment algorithm
    Note over Service: • Conflict Detection<br>• Capacity Validation<br>• Proximity Optimization<br>• Load Balancing

    Service->>Model: Create Assignment objects
    Model->>DB: Bulk insert assignments
    DB-->>Model: Assignments created ✅

    Service->>Cache: Cache results (TTL 5min)
    Cache-->>Service: Cached successfully

    Service->>Service: Generate notifications
    Service-->>Flask: Return assignment results

    Flask-->>Axios: JSON response with assignments
    Axios-->>React: Update UI state

    React-->>User: Display assignment results 🎉
```

### **Caching Architecture**
```mermaid
graph TD
    subgraph "Cache Layers"
        A[Browser LocalStorage] --> B[Redux Store]
        B --> C[React Query Cache]
        C --> D[Redis Application Cache]
        D --> E[Database Query Cache]
    end

    subgraph "Cache Strategies"
        F[Assignment Results] --> G[TTL: 5 min]
        H[Room Availability] --> I[TTL: 1 min]
        J[User Sessions] --> K[TTL: 24 hours]
        L[Building Data] --> M[TTL: 1 hour]
    end

    subgraph "Cache Invalidation"
        N[New Assignment] --> O[Invalidate User Cache]
        P[Room Status Change] --> Q[Invalidate Room Cache]
        R[Exam Scheduled] --> S[Invalidate Assignment Cache]
    end

    style A fill:#e3f2fd
    style D fill:#fff8e1
    style E fill:#e8f5e8
```

---

## 🚀 **Assignment Engine Architecture**

### **Smart Assignment Algorithm Flow**
```mermaid
flowchart TD
    A[Start Assignment Process] --> B{Input Validation}

    B -->|Valid| C[Load Student Data]
    B -->|Invalid| D[Return Error]

    C --> E[Load Room Inventory]
    E --> F[Load Exam Schedule]
    F --> G[Apply Constraints]

    G --> H{Exam Conflicts?}
    H -->|Yes| I[Resolve Conflicts]
    H -->|No| J[Continue Assignment]

    I --> K{Resolution Possible?}
    K -->|Yes| J
    K -->|No| L[Manual Intervention Required]

    J --> M[Group by Time Slots]
    M --> N[Prioritize High-Enrollment]
    N --> O[Calculate Room Capacity]
    O --> P{Optimal Assignment?}

    P -->|Yes| Q[Apply Assignment]
    P -->|No| R[Alternative Room Selection]

    R --> S{Backup Available?}
    S -->|Yes| Q
    S -->|No| T[Split into Batches]

    Q --> U[Update Database]
    U --> V[Generate Notifications]
    V --> W[Send Confirmations]
    W --> X[Return Results ✅]

    L --> Y[Flag for Manual Review]
    T --> Z[Schedule Secondary Assignment]

    style A fill:#e3f2fd
    style X fill:#e8f5e8
    style L fill:#ffebee
```

### **Algorithm Optimization Techniques**
```mermaid
graph TD
    subgraph "Algorithm Strategies"
        A[Greedy Algorithm] --> B[Sort by Priority]
        A --> C[First-Fit Assignment]
        A --> D[Constraint Satisfaction]

        E[Genetic Algorithm] --> F[Crossover Operations]
        E --> G[Mutation Strategies]
        E --> H[Fitness Functions]

        I[Constraint Programming] --> J[Variable Domains]
        I --> K[Constraint Propagation]
        I --> L[Backtracking Search]
    end

    subgraph "Performance Optimizations"
        M[Priority Queues] --> N[O(log n) insertions]
        O[Bloom Filters] --> P[Fast set membership]
        Q[Spatial Indexing] --> R[Geographic optimization]
        S[Parallel Processing] --> T[Multi-core utilization]
    end

    subgraph "Caching Optimizations"
        U[Result Memoization] --> V[Identical request caching]
        W[Partial Result Cache] --> X[Incremental computation]
        Y[Distributed Cache] --> Z[Horizontal scaling]
    end
```

---

## 🔐 **Security Architecture**

### **Authentication & Authorization Flow**
```mermaid
graph TD
    A[User Login] --> B[Validate Credentials]
    B --> C{Valid Credentials?}

    C -->|Yes| D[Generate JWT Token]
    C -->|No| E[Return 401 Unauthorized]

    D --> F{User Role?}
    F -->|Admin| G[Full API Access + Admin Routes]
    F -->|TA| H[Student + Assignment Routes]
    F -->|Student| I[Limited Read-Only Access]

    G --> J[Role-Based Permissions]
    H --> J
    I --> J

    J --> K[RBAC Middleware]
    K --> L{Request Authorized?}

    L -->|Yes| M[Execute API Call]
    L -->|No| N[Return 403 Forbidden]

    M --> O[Log API Activity]
    O --> P[Return Response]

    style D fill:#e8f5e8
    style N fill:#ffebee
```

### **Security Layers**
```
Security Implementation Layers:

1. 🔐 Network Security
├── HTTPS/TLS encryption
├── Rate limiting (100 req/min)
├── IP whitelisting for admin access
└── DDoS protection

2. 🔑 Application Security
├── JWT token authentication
├── Password hashing (Argon2)
├── Input validation & sanitization
├── CSRF protection
└── XSS prevention

3. 💾 Database Security
├── SQL injection prevention (ORM)
├── Row-level security
├── Encrypted sensitive data
├── Audit logging
└── Backup encryption

4. 📊 Monitoring & Response
├── Security threat detection
├── Automated alerts
├── Incident response plans
└── Security audit trails
```

---

## 📊 **Performance & Scalability Architecture**

### **System Performance Characteristics**
```
Performance Benchmarks & SLAs:

Response Times:
├── API Health Check: <50ms (99.9% uptime)
├── Student Lookup: <100ms (99.5% uptime)
├── Room Assignment: <500ms (95% uptime)
├── Bulk Import: <30s for 1000 records
└── Report Generation: <10s for 10K records

Throughput:
├── Concurrent Users: 500 simultaneous connections
├── API Requests/sec: 1000 sustained load
├── Database Queries/sec: 5000 read operations
├── File Uploads: 100 concurrent uploads
└── Notification Processing: 1000 emails/min

Scalability Limits:
├── Vertical Scaling: 16-core CPU, 64GB RAM
├── Horizontal Scaling: 10+ container instances
├── Database Connections: 200 maximum pool
├── File Storage: 10TB capacity
└── CDN Edge Locations: Global distribution
```

### **Load Balancing & High Availability**
```mermaid
graph TB
    subgraph "Load Balancer"
        LB[NGINX Load Balancer]
    end

    subgraph "Application Tier"
        A1[Flask API Server 1]
        A2[Flask API Server 2]
        A3[Flask API Server 3]
        A4[Flask API Server N]
    end

    subgraph "Cache Tier"
        C1[Redis Primary]
        C2[Redis Replica 1]
        C3[Redis Replica 2]
    end

    subgraph "Database Tier"
        D1[PostgreSQL Primary]
        D2[PostgreSQL Replica 1]
        D3[PostgreSQL Replica 2]
    end

    subgraph "File Storage"
        F1[S3 Bucket Primary]
        F2[S3 Bucket Replica]
    end

    LB --> A1
    LB --> A2
    LB --> A3
    LB --> A4

    A1 --> C1
    A2 --> C1
    A3 --> C2
    A4 --> C3

    C1 --> D1
    C2 --> D1
    C3 --> D2

    A1 --> D1
    A2 --> D2
    A3 --> D3

    A1 --> F1
    A2 --> F2

    style LB fill:#fff3e0
    style A1,A2,A3,A4 fill:#e3f2fd
    style C1,C2,C3 fill:#fff8e1
    style D1,D2,D3 fill:#e8f5e8
    style F1,F2 fill:#fce4ec
```

---

## 🚀 **Deployment & DevOps Architecture**

### **CI/CD Pipeline Architecture**
```mermaid
graph TD
    subgraph "Developer Workstation"
        A[Local Development]
        A1[Git Commit]
    end

    subgraph "Version Control"
        B[GitHub Repository]
        B1[Pull Request]
        B2[Code Review]
        B3[Merge to Main]
    end

    subgraph "CI Pipeline"
        C[GitHub Actions]
        C1[Lint & Test]
        C2[Build Docker Images]
        C3[Security Scan]
        C4[Vulnerability Check]
    end

    subgraph "Artifact Storage"
        D[Docker Registry]
        D1[Container Images]
    end

    subgraph "CD Pipeline"
        E[Kubernetes Deployment]
        E1[Staging Deployment]
        E2[Automated Testing]
        E3[Production Deployment]
        E4[Blue-Green Strategy]
    end

    subgraph "Monitoring"
        F[Observability Stack]
        F1[Prometheus Metrics]
        F2[Grafana Dashboards]
        F3[Alert Manager]
    end

    A --> A1
    A1 --> B
    B --> B1
    B1 --> B2
    B2 --> B3

    B3 --> C
    C --> C1
    C1 --> C2
    C2 --> C3
    C3 --> C4

    C4 --> D
    D --> D1

    D1 --> E
    E --> E1
    E1 --> E2
    E2 --> E3
    E3 --> E4

    E4 --> F
    F --> F1
    F --> F2
    F2 --> F3

    style A fill:#e3f2fd
    style C fill:#fff3e0
    style E fill:#e8f5e8
    style F fill:#fce4ec
```

### **Infrastructure as Code Structure**
```
infrastructure/
├── docker/
│   ├── Dockerfile.frontend    # React build
│   ├── Dockerfile.backend     # Flask application
│   ├── docker-compose.yml     # Local development
│   └── docker-compose.prod.yml # Production setup
├── kubernetes/
│   ├── deployment.yaml        # Application deployment
│   ├── service.yaml          # Load balancing
│   ├── ingress.yaml          # External access
│   ├── configmap.yaml        # Configuration
│   └── secrets.yaml          # Sensitive data
├── terraform/
│   ├── main.tf               # Infrastructure provision
│   ├── variables.tf          # Configuration variables
│   ├── outputs.tf            # Resource outputs
│   └── modules/              # Reusable components
├── monitoring/
│   ├── prometheus.yml        # Metrics collection
│   ├── grafana/              # Dashboard definitions
│   │   ├── dashboards/       # Custom dashboards
│   │   └── datasources/      # Data source configs
│   └── alerts.yml            # Alert rules
└── scripts/
    ├── deploy.sh            # Deployment automation
    ├── backup.sh            # Database backup
    └── health-check.sh      # System monitoring
```

---

## 🎯 **Architecture Decision Records**

### **Key Technical Decisions**

#### **ADR 001: Database Choice - PostgreSQL**
**Context**: Need for robust relational database supporting complex queries, transactions, and JSON operations.

**Decision**: PostgreSQL 13+ as primary database
**Rationale**:
- Full ACID compliance for assignment transactions
- Advanced indexing and query optimization
- Native JSON support for flexible data models
- Excellent concurrency handling for multi-user scenarios
- Mature tooling and extensive community support

#### **ADR 002: API Framework - Flask REST**
**Context**: Need lightweight, flexible API framework for rapid development and maintenance.

**Decision**: Flask with Flask-RESTful extension
**Rationale**:
- Minimal overhead and fast startup times
- Extensive middleware ecosystem
- Python-native for seamless data model integration
- RESTful design patterns aligned with HTTP standards
- Easy testing and debugging capabilities

#### **ADR 003: Frontend Framework - React with TypeScript**
**Context**: Need maintainable, scalable frontend with strong type safety and developer experience.

**Decision**: React 18 with TypeScript and Redux Toolkit
**Rationale**:
- Component-based architecture for maintainability
- TypeScript prevents runtime type errors
- Redux for predictable state management at scale
- Rich ecosystem for UI components and testing
- Modern development tooling and hot reloading

#### **ADR 004: Caching Strategy - Redis Multi-Layer**
**Context**: Need to optimize database performance and reduce response times for frequently accessed data.

**Decision**: Redis-based caching with application-level and database-level layers
**Rationale**:
- Sub-millisecond data retrieval for hot data
- Configurable TTL for different data types
- Pub/Sub capabilities for real-time features
- Persistence options for data durability
- Horizontal scaling capabilities

This comprehensive architecture guide provides developers with deep technical understanding necessary for maintaining, debugging, and extending the SmartRoomAssigner system effectively! 🏗️🚀
