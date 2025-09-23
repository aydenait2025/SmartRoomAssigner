-- ===============================
-- ExamSpace Database Schema
-- Generated from SQLAlchemy models
-- ===============================

-- ===============================
-- Table: roles
-- ===============================
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- ===============================
-- Table: users
-- ===============================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role_id INTEGER REFERENCES roles(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================
-- Table: students
-- ===============================
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    student_number VARCHAR(20) UNIQUE NOT NULL,
    department VARCHAR(100),
    year INTEGER
);

-- ===============================
-- Table: buildings
-- ===============================
CREATE TABLE buildings (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    address TEXT
);

-- ===============================
-- Table: rooms
-- ===============================
CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    building_id INTEGER REFERENCES buildings(id) NOT NULL,
    room_number VARCHAR(20) NOT NULL,
    capacity INTEGER NOT NULL,
    floor INTEGER,
    type VARCHAR(50)
);

-- ===============================
-- Table: exams
-- ===============================
CREATE TABLE exams (
    id SERIAL PRIMARY KEY,
    course_name VARCHAR(100),
    course_code VARCHAR(20),
    exam_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_by INTEGER REFERENCES users(id) NOT NULL
);

-- ===============================
-- Table: enrollments
-- ===============================
CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) NOT NULL,
    exam_id INTEGER REFERENCES exams(id) NOT NULL
);

-- ===============================
-- Table: room_assignments
-- ===============================
CREATE TABLE room_assignments (
    id SERIAL PRIMARY KEY,
    exam_id INTEGER REFERENCES exams(id) NOT NULL,
    room_id INTEGER REFERENCES rooms(id) NOT NULL,
    student_id INTEGER REFERENCES students(id) NOT NULL,
    seat_number VARCHAR(10)
);

-- ===============================
-- Insert Sample Data
-- ===============================
-- Insert roles
INSERT INTO roles (name) VALUES
('admin'),
('professor'),
('ta'),
('student');

-- Insert sample users
INSERT INTO users (name, email, password_hash, role_id) VALUES
('Alice Admin', 'alice@examspace.com', 'scrypt:32768:8:1$3H4SxQk5R6T7U8V9$hashed_pwd1', 1),
('Dr. Bob', 'bob@university.edu', 'scrypt:32768:8:1$3H4SxQk5R6T7U8V9$hashed_pwd2', 2),
('Tom TA', 'tom@university.edu', 'scrypt:32768:8:1$3H4SxQk5R6T7U8V9$hashed_pwd3', 3),
('Student Sara', 'sara@student.edu', 'scrypt:32768:8:1$3H4SxQk5R6T7U8V9$hashed_pwd4', 4);

-- Insert sample student
INSERT INTO students (user_id, student_number, department, year) VALUES
(4, 'S2023001', 'Computer Science', 3);

-- Insert buildings
INSERT INTO buildings (name, code, address) VALUES
('Main Building', 'MB', '123 Campus Drive'),
('Science Hall', 'SH', '456 Science Lane');

-- Insert rooms
INSERT INTO rooms (building_id, room_number, capacity, floor, type) VALUES
(1, '101', 30, 1, 'Lecture'),
(1, '102', 25, 1, 'Lab'),
(2, '201', 40, 2, 'Lecture');

-- Insert sample exam
INSERT INTO exams (course_name, course_code, exam_date, start_time, end_time, created_by) VALUES
('Introduction to Databases', 'CS301', '2025-12-10', '09:00:00', '12:00:00', 2);

-- Insert enrollment
INSERT INTO enrollments (student_id, exam_id) VALUES
(1, 1);

-- Insert room assignment
INSERT INTO room_assignments (exam_id, room_id, student_id, seat_number) VALUES
(1, 1, 1, 'A1');

-- ===============================
-- Legacy Assignment Table (for backward compatibility)
-- ===============================
CREATE TABLE IF NOT EXISTS assignment (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) NOT NULL,
    room_id INTEGER REFERENCES rooms(id) NOT NULL,
    course VARCHAR(100),
    exam_date TIMESTAMP
);

-- ===============================
-- Indices for Performance
-- ===============================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_student_number ON students(student_number);
CREATE INDEX idx_buildings_code ON buildings(code);
CREATE INDEX idx_rooms_building_id ON rooms(building_id);
CREATE INDEX idx_exams_created_by ON exams(created_by);
CREATE INDEX idx_exams_exam_date ON exams(exam_date);
CREATE INDEX idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX idx_enrollments_exam_id ON enrollments(exam_id);
CREATE INDEX idx_room_assignments_exam_id ON room_assignments(exam_id);
CREATE INDEX idx_room_assignments_room_id ON room_assignments(room_id);
CREATE INDEX idx_room_assignments_student_id ON room_assignments(student_id);
