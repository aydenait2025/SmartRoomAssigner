-- ===============================
-- Enhanced SmartRoomAssigner Database Schema
-- Production-Ready with Comprehensive Improvements
-- ===============================

-- ===============================
-- PHASE 1: Core Data Structure Improvements
-- ===============================
-- Table: roles (ENHANCED)
-- ===============================
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(200),
    permissions TEXT[], -- Array of permission strings
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================
-- Table: departments (NEW)
-- ===============================
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    department_code VARCHAR(10) NOT NULL UNIQUE,
    department_name VARCHAR(100) NOT NULL,
    faculty_name VARCHAR(100), -- e.g., "Faculty of Arts and Science"
    email_domain VARCHAR(50), -- e.g., "artsci.utoronto.ca"
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================
-- Table: courses (NEW)
-- ===============================
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    course_code VARCHAR(20) NOT NULL UNIQUE,
    course_name VARCHAR(200) NOT NULL,
    department_id INTEGER NOT NULL REFERENCES departments(id),
    credits INTEGER DEFAULT 3 CHECK (credits > 0 AND credits <= 12),
    course_level VARCHAR(10), -- e.g., '100', '200', '300', '400', 'GRAD'
    prerequisites TEXT[], -- Array of prerequisite course codes
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Ensure course codes follow UofT format (e.g., CSC108H1F)
    CONSTRAINT valid_course_code CHECK (course_code ~ '^[A-Z]{3}[0-9]{3}[H|Y][1|5][F|S|Y]$'),
    -- Course levels
    CONSTRAINT valid_course_level CHECK (course_level IN ('100', '200', '300', '400', 'GRAD'))
);

-- ===============================
-- Table: terms_semesters (NEW)
-- ===============================
CREATE TABLE terms_semesters (
    id SERIAL PRIMARY KEY,
    academic_year INTEGER NOT NULL, -- e.g., 2025
    season VARCHAR(20) NOT NULL, -- Fall, Winter, Summer, Year
    term_code VARCHAR(10) NOT NULL UNIQUE, -- e.g., '2025F', '2025W'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    exam_start_date DATE,
    exam_end_date DATE,
    is_current BOOLEAN DEFAULT false,
    is_registration_open BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_dates CHECK (start_date < end_date),
    CONSTRAINT exam_dates_check CHECK (
        (exam_start_date IS NULL AND exam_end_date IS NULL) OR
        (exam_start_date >= end_date AND exam_end_date > exam_start_date)
    ),
    CONSTRAINT valid_season CHECK (season IN ('Fall', 'Winter', 'Summer', 'Year')),
    CONSTRAINT single_current_term EXCLUDE (is_current WITH =) WHERE (is_current = true)
);

-- ===============================
-- Table: time_slots (NEW)
-- ===============================
CREATE TABLE time_slots (
    id SERIAL PRIMARY KEY,
    time_slot_code VARCHAR(10) NOT NULL UNIQUE, -- e.g., '08:00-09:30'
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL,
    session_type VARCHAR(20), -- Morning, Afternoon, Evening
    is_available BOOLEAN DEFAULT true,
    monday BOOLEAN DEFAULT false,
    tuesday BOOLEAN DEFAULT false,
    wednesday BOOLEAN DEFAULT false,
    thursday BOOLEAN DEFAULT false,
    friday BOOLEAN DEFAULT false,
    saturday BOOLEAN DEFAULT false,
    sunday BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_time_range CHECK (start_time < end_time),
    CONSTRAINT valid_duration CHECK (duration_minutes > 0 AND duration_minutes <= 480), -- Max 8 hours
    CONSTRAINT valid_session CHECK (session_type IN ('Morning', 'Afternoon', 'Evening', 'Weekend'))

);

-- ===============================
-- Table: users (ENHANCED)
-- ===============================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role_id INTEGER NOT NULL REFERENCES roles(id),
    department_id INTEGER REFERENCES departments(id), -- For faculty/dept association
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    email_verified BOOLEAN DEFAULT false,
    phone VARCHAR(20),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_email CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    -- Account lockout after 5 failed attempts
    CONSTRAINT account_lockout CHECK (failed_login_attempts < 5 OR locked_until > CURRENT_TIMESTAMP)
);

-- ===============================
-- Table: faculty (NEW) - Separate from students
-- ===============================
CREATE TABLE faculty (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    faculty_id VARCHAR(10) UNIQUE NOT NULL, -- e.g., "FAC001"
    title VARCHAR(50), -- Professor, Associate Professor, Lecturer, etc.
    research_areas TEXT[],
    office_location VARCHAR(100),
    office_hours TEXT,
    phone VARCHAR(20),
    website_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_title CHECK (title IN ('Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Senior Lecturer', 'Teaching Assistant'))
);

-- ===============================
-- Table: students (ENHANCED)
-- ===============================
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    student_number VARCHAR(20) UNIQUE NOT NULL,
    department_id INTEGER REFERENCES departments(id),
    program VARCHAR(100), -- e.g., "Computer Science Specialist"
    year_of_study INTEGER CHECK (year_of_study >= 1 AND year_of_study <= 8),
    enrollment_status VARCHAR(20) DEFAULT 'active',
    gpa DECIMAL(3,2) CHECK (gpa >= 0 AND gpa <= 4.0),
    credits_completed INTEGER DEFAULT 0,
    expected_graduation_year INTEGER,
    is_international BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_status CHECK (enrollment_status IN ('active', 'inactive', 'graduated', 'withdrawn')),
    CONSTRAINT unique_user_student UNIQUE (user_id)
);

-- ===============================
-- Table: buildings (ENHANCED)
-- ===============================
CREATE TABLE buildings (
    id SERIAL PRIMARY KEY,
    building_code VARCHAR(10) NOT NULL UNIQUE,
    building_name VARCHAR(200) NOT NULL,
    full_address TEXT NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    campus VARCHAR(50), -- St. George, Scarborough, Mississauga
    building_type VARCHAR(50), -- Academic, Residence, Administrative, etc.
    year_built INTEGER,
    total_floors INTEGER,
    accessibility_features TEXT[],
    contact_person VARCHAR(100),
    contact_phone VARCHAR(20),
    emergency_contact VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_building_code CHECK (building_code ~ '^[A-Z0-9]{2,4}$'),
    CONSTRAINT valid_campus CHECK (campus IN ('St. George', 'Scarborough', 'Mississauga')),
    CONSTRAINT valid_building_type CHECK (building_type IN ('Academic', 'Residence', 'Administrative', 'Library', 'Gym', 'Other')),
    CONSTRAINT valid_year_built CHECK (year_built IS NULL OR (year_built >= 1800 AND year_built <= EXTRACT(YEAR FROM CURRENT_DATE) + 10))
);

-- ===============================
-- Table: rooms (ENHANCED)
-- ===============================
CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    building_id INTEGER NOT NULL REFERENCES buildings(id),
    room_number VARCHAR(20) NOT NULL,
    room_name VARCHAR(100), -- e.g., "Lecture Hall A", "Lab 205"
    floor INTEGER CHECK (floor >= -2 AND floor <= 50), -- Basement floors negative
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    exam_capacity INTEGER CHECK (exam_capacity >= capacity), -- Often 2x regular capacity for exams
    room_type VARCHAR(30), -- Lecture, Lab, Seminar, Office, etc.
    department_assignment VARCHAR(100), -- Owning department
    equipment TEXT[], -- Projector, Whiteboard, Computers, etc.
    accessibility_features TEXT[], -- Wheelchair accessible, etc.
    square_footage INTEGER,
    is_available BOOLEAN DEFAULT true,
    maintenance_notes TEXT,
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_room_number CHECK (room_number ~ '^[0-9]{3,4}[A-Z]?$'),
    CONSTRAINT valid_room_type CHECK (room_type IN ('Lecture Hall', 'Classroom', 'Seminar Room', 'Computer Lab', 'Science Lab', 'Office', 'Study Room', 'Auditorium')),
    CONSTRAINT maintenance_dates_check CHECK (
        (last_maintenance_date IS NULL AND next_maintenance_date IS NULL) OR
        (next_maintenance_date > last_maintenance_date)
    ),
    UNIQUE(building_id, room_number) -- Same room number can't exist twice in same building
);

-- ===============================
-- Table: exams (ENHANCED)
-- ===============================
CREATE TABLE exams (
    id SERIAL PRIMARY KEY,
    exam_code VARCHAR(20) NOT NULL UNIQUE, -- e.g., "CSC108H1F-DEC10"
    course_id INTEGER NOT NULL REFERENCES courses(id),
    term_id INTEGER NOT NULL REFERENCES terms_semesters(id),
    instructor_id INTEGER REFERENCES faculty(id),
    exam_type VARCHAR(20) DEFAULT 'final',
    duration_minutes INTEGER DEFAULT 120,
    class_section VARCHAR(10), -- e.g., "LEC0101"
    expected_students INTEGER DEFAULT 0,
    special_instructions TEXT,
    requires_supervision BOOLEAN DEFAULT true,
    status VARCHAR(20) DEFAULT 'scheduled',
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_exam_code CHECK (exam_code ~ '^[A-Z]{3}[0-9]{3}[H|Y][1|5][F|S|Y]-[A-Z]{3}[0-9]{2}$'),
    CONSTRAINT valid_duration CHECK (duration_minutes >= 60 AND duration_minutes <= 480),
    CONSTRAINT valid_exam_type CHECK (exam_type IN ('midterm', 'final', 'quiz', 'project', 'presentation')),
    CONSTRAINT valid_status CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'postponed'))
);

-- ===============================
-- Table: exam_sessions (NEW - For multi-part exams)
-- ===============================
CREATE TABLE exam_sessions (
    id SERIAL PRIMARY KEY,
    exam_id INTEGER NOT NULL REFERENCES exams(id),
    session_number INTEGER NOT NULL,
    date DATE NOT NULL,
    time_slot_id INTEGER NOT NULL REFERENCES time_slots(id),
    room_id INTEGER NOT NULL REFERENCES rooms(id),
    invigilator_id INTEGER REFERENCES faculty(id),
    assistant_needed BOOLEAN DEFAULT false,
    special_requirements TEXT,
    actual_students INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'scheduled',
    notes TEXT,

    UNIQUE(exam_id, date, time_slot_id), -- Same time slot can't be used twice on same day
    UNIQUE(room_id, date, time_slot_id), -- Room can't be double-booked
    CONSTRAINT valid_session_status CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    CONSTRAINT valid_session_number CHECK (session_number > 0)
);

-- ===============================
-- Table: enrollments (ENHANCED)
-- ===============================
CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id),
    course_id INTEGER NOT NULL REFERENCES courses(id),
    term_id INTEGER NOT NULL REFERENCES terms_semesters(id),
    grade VARCHAR(5), -- Percentage or letter grade
    enrollment_status VARCHAR(20) DEFAULT 'enrolled',
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dropped_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Ensure no duplicate enrollments
    UNIQUE(student_id, course_id, term_id),
    CONSTRAINT valid_enrollment_status CHECK (enrollment_status IN ('enrolled', 'dropped', 'completed', 'withdrawn')),
    CONSTRAINT valid_grade CHECK (grade IS NULL OR grade ~ '^([A-F]|[0-9]{1,3}(\.[0-9])?)$'),
    CONSTRAINT enrollment_dates_check CHECK (
        (dropped_date IS NULL) OR (dropped_date > enrollment_date)
    )
);

-- ===============================
-- Table: room_assignments (ENHANCED)
-- ===============================
CREATE TABLE room_assignments (
    id SERIAL PRIMARY KEY,
    exam_session_id INTEGER NOT NULL REFERENCES exam_sessions(id),
    student_id INTEGER NOT NULL REFERENCES students(id),
    seat_number VARCHAR(5), -- e.g., "A01", "B12"
    attendance BOOLEAN,
    notes TEXT,
    assigned_by INTEGER REFERENCES users(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Prevent double assignments
    UNIQUE(exam_session_id, seat_number),
    UNIQUE(exam_session_id, student_id),
    CONSTRAINT valid_seat_number CHECK (seat_number ~ '^[A-Z][0-9]{2}$')
);

-- ===============================
-- PHASE 2: Audit & Logging System
-- ===============================
-- Table: audit_logs (NEW)
-- ===============================
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY, -- Use BIGSERIAL for high-volume logging
    table_name VARCHAR(50) NOT NULL,
    record_id INTEGER NOT NULL,
    action VARCHAR(10) NOT NULL, -- INSERT, UPDATE, DELETE
    old_values JSONB,
    new_values JSONB,
    changed_columns TEXT[],
    changed_by INTEGER REFERENCES users(id),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(100),

    CONSTRAINT valid_action CHECK (action IN ('INSERT', 'UPDATE', 'DELETE'))
);

-- ===============================
-- Table: system_settings (NEW)
-- ===============================
CREATE TABLE system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_type VARCHAR(20) DEFAULT 'string', -- string, integer, boolean, json
    description TEXT,
    is_editable BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_setting_type CHECK (setting_type IN ('string', 'integer', 'boolean', 'json', 'float'))
);

-- ===============================
-- Table: notifications (NEW)
-- ===============================
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(30),
    priority VARCHAR(10) DEFAULT 'normal',
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    action_url TEXT,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_notification_type CHECK (notification_type IN ('exam_schedule', 'room_assignment', 'system_alert', 'grade_posted', 'registration')),
    CONSTRAINT valid_priority CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    CONSTRAINT read_timestamps_check CHECK (
        (NOT is_read AND read_at IS NULL) OR (is_read AND read_at IS NOT NULL)
    )
);

-- ===============================
-- PHASE 3: Advanced Features
-- ===============================
-- Table: room_reservations (NEW - For non-exam bookings)
-- ===============================
CREATE TABLE room_reservations (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL REFERENCES rooms(id),
    reserved_by INTEGER NOT NULL REFERENCES users(id),
    date DATE NOT NULL,
    time_slot_id INTEGER NOT NULL REFERENCES time_slots(id),
    purpose VARCHAR(200) NOT NULL,
    expected_attendees INTEGER DEFAULT 1,
    special_requirements TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(room_id, date, time_slot_id), -- No double bookings
    CONSTRAINT valid_reservation_status CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    CONSTRAINT future_reservation CHECK (date >= CURRENT_DATE)
);

-- ===============================
-- Table: maintenance_records (NEW)
-- ===============================
CREATE TABLE maintenance_records (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL REFERENCES rooms(id),
    maintenance_type VARCHAR(50),
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'open',
    priority VARCHAR(10) DEFAULT 'normal',
    reported_by INTEGER REFERENCES users(id),
    assigned_to INTEGER REFERENCES users(id),
    scheduled_date DATE,
    completed_date TIMESTAMP,
    cost DECIMAL(10,2),
    contractor_info TEXT,
    photos_attachments TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_maintenance_status CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
    CONSTRAINT valid_maintenance_priority CHECK (priority IN ('low', 'normal', 'high', 'urgent', 'emergency')),
    CONSTRAINT valid_maintenance_type CHECK (maintenance_type IN ('electrical', 'plumbing', 'HVAC', 'carpentry', 'cleaning', 'technology', 'safety', 'other')),
    CONSTRAINT completion_dates_check CHECK (
        (status = 'completed' AND completed_date IS NOT NULL) OR
        (status != 'completed')
    )
);

-- ===============================
-- PHASE 4: Advanced Indexing & Performance
-- ===============================
-- Performance indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_department_id ON users(department_id);

CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_student_number ON students(student_number);
CREATE INDEX idx_students_department_year ON students(department_id, year_of_study);

CREATE INDEX idx_courses_department_id ON courses(department_id);
CREATE INDEX idx_courses_course_code ON courses(course_code, course_level);

CREATE INDEX idx_exams_course_term ON exams(course_id, term_id);
CREATE INDEX idx_exams_instructor_id ON exams(instructor_id);
CREATE INDEX idx_exams_date_range ON exams(exam_date);

CREATE INDEX idx_exam_sessions_date_time ON exam_sessions(date, time_slot_id);
CREATE INDEX idx_exam_sessions_room_id ON exam_sessions(room_id);

CREATE INDEX idx_enrollments_student_term ON enrollments(student_id, term_id);
CREATE INDEX idx_enrollments_course_term ON enrollments(course_id, term_id);

CREATE INDEX idx_room_assignments_exam_student ON room_assignments(exam_session_id, student_id);
CREATE INDEX idx_room_assignments_seat ON room_assignments(exam_session_id, seat_number);

CREATE INDEX idx_rooms_building_id ON rooms(building_id);
CREATE INDEX idx_rooms_capacity_type ON rooms(capacity, room_type) WHERE is_available = true;

CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(changed_by, changed_at DESC);

CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_type_priority ON notifications(notification_type, priority);

-- Partial indexes for better performance
CREATE INDEX idx_buildings_active ON buildings(is_active) WHERE is_active = true;
CREATE INDEX idx_rooms_available ON rooms(is_available) WHERE is_available = true;
CREATE INDEX idx_courses_active ON courses(is_active) WHERE is_active = true;
CREATE INDEX idx_exams_current_status ON exams(status) WHERE status IN ('scheduled', 'confirmed');

-- ===============================
-- PHASE 5: Triggers for Audit Logging
-- ===============================
-- Function to create audit log entries
CREATE OR REPLACE FUNCTION audit_trigger_function() RETURNS TRIGGER AS $$
DECLARE
    old_row jsonb := NULL;
    new_row jsonb := NULL;
    changed_cols text[] := ARRAY[]::text[];
BEGIN
    -- Get old and new row data as JSONB
    IF TG_OP != 'INSERT' THEN
        old_row := row_to_json(OLD)::jsonb;
    END IF;

    IF TG_OP != 'DELETE' THEN
        new_row := row_to_json(NEW)::jsonb;
    END IF;

    -- For UPDATE, find changed columns
    IF TG_OP = 'UPDATE' THEN
        SELECT array_agg(column_name)
        INTO changed_cols
        FROM (
            SELECT column_name
            FROM information_schema.columns
            WHERE table_schema = TG_TABLE_SCHEMA
              AND table_name = TG_TABLE_NAME
            ORDER BY ordinal_position
        ) columns
        WHERE old_row->>column_name IS DISTINCT FROM new_row->>column_name;
    END IF;

    -- Insert audit log entry
    INSERT INTO audit_logs (
        table_name,
        record_id,
        action,
        old_values,
        new_values,
        changed_columns,
        changed_by,
        ip_address,
        user_agent
    ) VALUES (
        TG_TABLE_NAME,
        CASE
            WHEN TG_OP = 'DELETE' THEN OLD.id
            ELSE NEW.id
        END,
        TG_OP,
        old_row,
        new_row,
        changed_cols,
        current_setting('request.jwt.claim.sub', true)::integer, -- Get from JWT if available
        inet_client_addr(),
        current_setting('request.user_agent', true)
    );

    RETURN CASE
        WHEN TG_OP = 'DELETE' THEN OLD
        ELSE NEW
    END;
END;
$$ LANGUAGE plpgsql;

-- Create audit triggers for critical tables
CREATE TRIGGER audit_users_trigger
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_students_trigger
    AFTER INSERT OR UPDATE OR DELETE ON students
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_exams_trigger
    AFTER INSERT OR UPDATE OR DELETE ON exams
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_room_assignments_trigger
    AFTER INSERT OR UPDATE OR DELETE ON room_assignments
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- ===============================
-- PHASE 6: Sample Data & Constraints
-- ===============================
-- Insert roles with permissions
INSERT INTO roles (name, description, permissions) VALUES
('super_admin', 'Full system access', ARRAY['all']),
('admin', 'Administrative access', ARRAY['manage_users', 'manage_schedule', 'view_reports']),
('professor', 'Faculty member', ARRAY['create_exams', 'view_grades', 'manage_courses']),
('teaching_assistant', 'TA access', ARRAY['assist_exams', 'view_assignments']),
('student', 'Student access', ARRAY['view_grades', 'view_schedule']);

-- Insert departments
INSERT INTO departments (department_code, department_name, faculty_name, email_domain) VALUES
('CS', 'Computer Science', 'Faculty of Arts & Science', 'cs.toronto.edu'),
('MAT', 'Mathematics', 'Faculty of Arts & Science', 'math.toronto.edu'),
('PHY', 'Physics', 'Faculty of Arts & Science', 'physics.toronto.edu'),
('CHEM', 'Chemistry', 'Faculty of Arts & Science', 'chemistry.toronto.edu');

-- Insert terms
INSERT INTO terms_semesters (academic_year, season, term_code, start_date, end_date, exam_start_date, exam_end_date) VALUES
(2025, 'Fall', '2025F', '2025-09-01', '2025-12-15', '2025-12-09', '2025-12-20'),
(2026, 'Winter', '2026W', '2026-01-05', '2026-04-15', '2026-04-13', '2026-04-24');

-- Insert time slots
INSERT INTO time_slots (time_slot_code, start_time, end_time, duration_minutes, session_type, monday, tuesday, wednesday, thursday, friday) VALUES
('09:00-10:30', '09:00', '10:30', 90, 'Morning', true, true, true, true, true),
('10:30-12:00', '10:30', '12:00', 90, 'Morning', true, true, true, true, true),
('13:00-14:30', '13:00', '14:30', 90, 'Afternoon', true, true, true, true, true),
('14:30-16:00', '14:30', '16:00', 90, 'Afternoon', true, true, true, true, true),
('16:00-17:30', '16:00', '17:30', 90, 'Evening', true, true, true, true, true),
('18:00-19:30', '18:00', '19:30', 90, 'Evening', true, false, true, false, false);

-- Insert system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_editable) VALUES
('max_exam_duration', '180', 'integer', 'Maximum exam duration in minutes', true),
('default_room_capacity_buffer', '0.5', 'float', 'Buffer factor for room capacity (e.g., 0.5 = 50% buffer)', true),
('auto_schedule_notifications', 'true', 'boolean', 'Automatically send notifications for new schedules', true),
('system_timezone', 'America/Toronto', 'string', 'Default system timezone', false),
('maintenance_reminder_days', '30', 'integer', 'Days before maintenance to send reminders', true);

-- ===============================
-- comments
-- ===============================
COMMENT ON TABLE roles IS 'User roles with associated permissions';
COMMENT ON TABLE departments IS 'Academic departments and faculties';
COMMENT ON TABLE courses IS 'Course catalog with department associations';
COMMENT ON TABLE terms_semesters IS 'Academic terms/semesters with dates';
COMMENT ON TABLE time_slots IS 'Predefined time blocks for scheduling';
COMMENT ON TABLE users IS 'System users with role-based access';
COMMENT ON TABLE faculty IS 'Faculty/staff profiles separate from students';
COMMENT ON TABLE students IS 'Student profiles with academic information';
COMMENT ON TABLE buildings IS 'Campus buildings with location data';
COMMENT ON TABLE rooms IS 'Individual rooms with capacity and features';
COMMENT ON TABLE exams IS 'Exam definitions with course and term associations';
COMMENT ON TABLE exam_sessions IS 'Specific exam sessions with room/time assignments';
COMMENT ON TABLE enrollments IS 'Student course enrollments with grades';
COMMENT ON TABLE room_assignments IS 'Final student exam room assignments with seats';
COMMENT ON TABLE audit_logs IS 'Complete audit trail for all data changes';
COMMENT ON TABLE system_settings IS 'Configurable system parameters';
COMMENT ON TABLE notifications IS 'User notifications and alerts';
COMMENT ON TABLE room_reservations IS 'Non-exam room booking system';
COMMENT ON TABLE maintenance_records IS 'Room maintenance tracking';

-- ===============================
-- Database Statistics Views (for performance monitoring)
-- ===============================
CREATE OR REPLACE VIEW database_stats AS
SELECT
    'users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'students', COUNT(*) FROM students
UNION ALL
SELECT 'courses', COUNT(*) FROM courses
UNION ALL
SELECT 'exams', COUNT(*) FROM exams
UNION ALL
SELECT 'room_assignments', COUNT(*) FROM room_assignments
UNION ALL
SELECT 'audit_logs', COUNT(*) FROM audit_logs;

-- ===============================
-- Useful Query Views
-- ===============================
-- View: student_exam_schedule
CREATE OR REPLACE VIEW student_exam_schedule AS
SELECT
    s.student_number,
    u.name as student_name,
    c.course_code,
    c.course_name,
    e.exam_type,
    es.date as exam_date,
    ts.start_time,
    ts.end_time,
    b.building_name,
    r.room_number,
    ra.seat_number,
    es.status
FROM students s
JOIN users u ON s.user_id = u.id
JOIN enrollments en ON s.id = en.student_id
JOIN courses c ON en.course_id = c.id
JOIN exams e ON c.id = e.course_id
JOIN exam_sessions es ON e.id = es.exam_id
JOIN time_slots ts ON es.time_slot_id = ts.id
JOIN rooms r ON es.room_id = r.id
JOIN buildings b ON r.building_id = b.id
LEFT JOIN room_assignments ra ON es.id = ra.exam_session_id AND s.id = ra.student_id
WHERE en.term_id = (SELECT id FROM terms_semesters WHERE is_current = true LIMIT 1);

-- View: room_utilization
CREATE OR REPLACE VIEW room_utilization AS
SELECT
    b.building_name,
    r.room_number,
    r.capacity,
    COUNT(DISTINCT es.id) as total_exams,
    COUNT(DISTINCT CASE WHEN es.status = 'completed' THEN es.id END) as completed_exams,
    AVG(CASE WHEN ra.student_id IS NOT NULL THEN 1.0 ELSE 0.0 END) * 100 as avg_utilization
FROM rooms r
JOIN buildings b ON r.building_id = b.id
LEFT JOIN exam_sessions es ON r.id = es.room_id
LEFT JOIN room_assignments ra ON es.id = ra.exam_session_id
WHERE r.is_available = true
GROUP BY b.building_name, r.room_number, r.capacity;
