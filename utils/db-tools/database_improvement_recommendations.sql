-- ================================
-- OPTIONAL DATABASE ENHANCEMENTS
-- Production-tested improvements for specific use cases
-- ================================

-- 📧 Enhanced Notification System (3 tables)
-- For email templates, queues, and delivery tracking
CREATE TABLE email_templates (
    id SERIAL PRIMARY KEY,
    template_code VARCHAR(50) NOT NULL UNIQUE,
    subject_template TEXT NOT NULL,
    body_template TEXT NOT NULL,
    template_variables JSONB DEFAULT '{}',
    template_type VARCHAR(30) DEFAULT 'notification',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE email_queue (
    id SERIAL PRIMARY KEY,
    recipient_email VARCHAR(150) NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    priority INTEGER DEFAULT 1,
    template_used VARCHAR(50),
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    failed_attempts INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 📅 Calendar Integration (1 table)
-- Connect to external calendars (Google Calendar, Outlook)
CREATE TABLE calendar_integrations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    provider VARCHAR(30) NOT NULL, -- google, outlook, ical
    access_token TEXT,
    refresh_token TEXT,
    token_expires TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    last_sync TIMESTAMP,
    sync_frequency_minutes INTEGER DEFAULT 1440,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 🏥 Accessibility & Medical Accommodations (2 tables)
-- For students with disabilities and accessibility requirements
CREATE TABLE medical_accommodations (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id),
    accommodation_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    approved_by INTEGER REFERENCES users(id),
    approved_date DATE,
    expiration_date DATE,
    status VARCHAR(20) DEFAULT 'pending',
    documentation_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 🆘 Emergency Management (2 tables)
-- Evacuation plans, emergency contacts, facility lockdowns
CREATE TABLE emergency_alerts (
    id SERIAL PRIMARY KEY,
    alert_type VARCHAR(30) NOT NULL,
    severity_level VARCHAR(10) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    affected_buildings INTEGER[],
    evacuation_required BOOLEAN DEFAULT false,
    lockdown_required BOOLEAN DEFAULT false,
    initiated_by INTEGER NOT NULL REFERENCES users(id),
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 📚 Advanced Course/Catalog Features (3 tables)
-- Course prerequisites, waitlists, course ratings
CREATE TABLE course_waitlists (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id),
    course_id INTEGER NOT NULL REFERENCES courses(id),
    term_id INTEGER NOT NULL REFERENCES academic_terms(id),
    position INTEGER NOT NULL,
    enrollment_notification_sent BOOLEAN DEFAULT false,
    added_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_waitlist_student UNIQUE (student_id, course_id, term_id)
);

CREATE TABLE course_ratings (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id),
    student_id INTEGER NOT NULL REFERENCES students(id),
    faculty_id INTEGER NOT NULL REFERENCES faculty(id),
    rating DECIMAL(2,1) CHECK (rating >= 1.0 AND rating <= 5.0),
    difficulty DECIMAL(2,1) CHECK (difficulty >= 1.0 AND difficulty <= 5.0),
    workload DECIMAL(2,1) CHECK (workload >= 1.0 AND workload <= 5.0),
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 💰 Budget & Financial Tracking (2 tables)
-- Department budgets, purchasing, expense tracking
CREATE TABLE departmental_budgets (
    id SERIAL PRIMARY KEY,
    department_id INTEGER NOT NULL REFERENCES academic_departments(id),
    fiscal_year INTEGER NOT NULL,
    budget_category VARCHAR(50),
    approved_amount DECIMAL(12,2) NOT NULL,
    allocated_amount DECIMAL(12,2) DEFAULT 0,
    spent_amount DECIMAL(12,2) DEFAULT 0,
    created_by INTEGER NOT NULL REFERENCES users(id),
    approved_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 🔒 API Rate Limiting (1 table)
-- Protect your APIs from abuse (complements MFA)
CREATE TABLE api_rate_limits (
    id SERIAL PRIMARY KEY,
    identifier VARCHAR(200) NOT NULL, -- API key or IP address
    identifier_type VARCHAR(20) DEFAULT 'ip',
    requests_count INTEGER DEFAULT 0,
    window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    window_minutes INTEGER DEFAULT 1,
    max_requests INTEGER DEFAULT 1000,
    blocked_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_identifier_window UNIQUE (identifier, window_start)
);

-- 📊 Advanced Analytics Views (3 views)
-- For real-time business intelligence
CREATE OR REPLACE VIEW student_performance_trends AS
SELECT
    s.student_id,
    s.program_id,
    t.academic_year,
    t.season,
    COUNT(*) as courses_taken,
    AVG(e.grade_points) as avg_gpa,
    COUNT(CASE WHEN e.grade IN ('A', 'A+', 'A-') THEN 1 END) as a_grades,
    COUNT(CASE WHEN e.grade IN ('F') THEN 1 END) as failures
FROM students s
JOIN course_enrollments e ON s.id = e.student_id
JOIN academic_terms t ON e.term_id = t.id
GROUP BY s.student_id, s.program_id, t.academic_year, t.season;

CREATE OR REPLACE VIEW room_utilization_detailed AS
SELECT
    r.id as room_id,
    r.room_number,
    b.building_name,
    r.capacity as room_capacity,
    COUNT(ra.id) as students_assigned,
    (COUNT(ra.id)::float / r.capacity) * 100 as utilization_percent,
    e.exam_code,
    e.course_id,
    es.session_date,
    es.start_time,
    es.end_time
FROM rooms r
JOIN buildings b ON r.building_id = b.id
LEFT JOIN exam_sessions es ON r.id = es.room_id
LEFT JOIN exams e ON es.exam_id = e.id
LEFT JOIN room_assignments ra ON es.id = ra.exam_session_id
WHERE es.session_date IS NOT NULL
GROUP BY r.id, r.room_number, b.building_name, r.capacity, e.exam_code, e.course_id, es.session_date, es.start_time, es.end_time;

-- 📈 System Performance Dashboard View
CREATE OR REPLACE VIEW system_operations_health AS
WITH mfa_stats AS (
    SELECT
        COUNT(*) as total_mfa_enrollments,
        COUNT(CASE WHEN is_enrolled = true THEN 1 END) as active_mfa_users,
        ROUND(COUNT(CASE WHEN is_enrolled = true THEN 1 END)::decimal /
              COUNT(*)::decimal * 100, 2) as mfa_adoption_rate
    FROM user_mfa_enrollments
),
audit_stats AS (
    SELECT
        COUNT(*) as total_audit_events_24h,
        COUNT(DISTINCT(changed_by_user_id)) as active_users_24h
    FROM audit_logs
    WHERE created_at >= NOW() - INTERVAL '24 hours'
)
SELECT
    'System Health Overview' as metric,
    (SELECT count(*) FROM users WHERE is_active = true) as active_users,
    (SELECT count(*) FROM students WHERE enrollment_status = 'active') as enrolled_students,
    (EXTRACT(EPOCH FROM (SELECT avg(duration_minutes) FROM exams WHERE status = 'completed')) / 60)::decimal(10,2) as avg_exam_duration_hours,
    mfa_stats.active_mfa_users,
    mfa_stats.mfa_adoption_rate,
    audit_stats.total_audit_events_24h,
    audit_stats.active_users_24h
FROM mfa_stats, audit_stats;
