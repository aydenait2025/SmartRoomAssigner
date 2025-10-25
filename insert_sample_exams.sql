-- Insert sample exams for Computer Science courses
-- First, get the IDs we need
SELECT id, department_name FROM academic_departments;
SELECT id, course_code, course_name FROM courses WHERE course_code LIKE 'CSC%';
SELECT id, academic_year, season, term_code FROM academic_terms;

-- Insert exams (Update course_id and term_id based on the IDs from above queries)
INSERT INTO exams (exam_code, course_id, term_id, instructor_id, exam_type, duration_minutes, student_count_estimate, status, special_instructions, requires_supervision, created_by, created_at)
VALUES
-- CSCA08 - Introduction to Computer Science I
('CSCA08-MIDTERM-1', (SELECT id FROM courses WHERE course_code = 'CSCA08' LIMIT 1), (SELECT id FROM academic_terms WHERE academic_year = 2025 AND season = 'Fall' LIMIT 1), 1, 'midterm', 90, 150, 'scheduled', 'Bring calculator and ID. No laptops allowed.', true, 1, CURRENT_TIMESTAMP),

('CSCA08-FINAL', (SELECT id FROM courses WHERE course_code = 'CSCA08' LIMIT 1), (SELECT id FROM academic_terms WHERE academic_year = 2025 AND season = 'Fall' LIMIT 1), 1, 'final', 120, 150, 'scheduled', 'Cumulative final exam covering all material.', true, 1, CURRENT_TIMESTAMP),

-- CSCA48 - Introduction to Computer Science II
('CSCA48-MIDTERM-1', (SELECT id FROM courses WHERE course_code = 'CSCA48' LIMIT 1), (SELECT id FROM academic_terms WHERE academic_year = 2025 AND season = 'Fall' LIMIT 1), 1, 'midterm', 90, 150, 'scheduled', 'Focus on OOP concepts. Programming evidence required.', true, 1, CURRENT_TIMESTAMP),

('CSCA48-FINAL', (SELECT id FROM courses WHERE course_code = 'CSCA48' LIMIT 1), (SELECT id FROM academic_terms WHERE academic_year = 2025 AND season = 'Fall' LIMIT 1), 1, 'final', 120, 150, 'scheduled', 'Comprehensive final covering Java and algorithms.', true, 1, CURRENT_TIMESTAMP),

-- CSCB07 - Software Design
('CSCB07-MIDTERM', (SELECT id FROM courses WHERE course_code = 'CSCB07' LIMIT 1), (SELECT id FROM academic_terms WHERE academic_year = 2025 AND season = 'Fall' LIMIT 1), 1, 'midterm', 90, 180, 'scheduled', 'Design patterns and UML diagrams. Bring paper for diagramming.', true, 1, CURRENT_TIMESTAMP),

('CSCB07-FINAL', (SELECT id FROM courses WHERE course_code = 'CSCB07' LIMIT 1), (SELECT id FROM academic_terms WHERE academic_year = 2025 AND season = 'Fall' LIMIT 1), 1, 'final', 150, 180, 'scheduled', 'Project presentation and technical written exam.', true, 1, CURRENT_TIMESTAMP),

-- CSCB58 - Computer Organization
('CSCB58-MIDTERM', (SELECT id FROM courses WHERE course_code = 'CSCB58' LIMIT 1), (SELECT id FROM academic_terms WHERE academic_year = 2025 AND season = 'Fall' LIMIT 1), 1, 'midterm', 90, 130, 'scheduled', 'Assembly language and digital logic problems.', true, 1, CURRENT_TIMESTAMP),

('CSCB58-FINAL', (SELECT id FROM courses WHERE course_code = 'CSCB58' LIMIT 1), (SELECT id FROM academic_terms WHERE academic_year = 2025 AND season = 'Fall' LIMIT 1), 1, 'final', 120, 130, 'scheduled', 'Complete coverage of computer architecture.', true, 1, CURRENT_TIMESTAMP),

-- CSCC01 - Introduction to Software Engineering
('CSCC01-MIDTERM', (SELECT id FROM courses WHERE course_code = 'CSCC01' LIMIT 1), (SELECT id FROM academic_terms WHERE academic_year = 2025 AND season = 'Fall' LIMIT 1), 1, 'midterm', 100, 150, 'scheduled', 'Agile methodologies and requirements engineering.', true, 1, CURRENT_TIMESTAMP),

('CSCC01-PROJECT-PRESENTATION', (SELECT id FROM courses WHERE course_code = 'CSCC01' LIMIT 1), (SELECT id FROM academic_terms WHERE academic_year = 2025 AND season = 'Fall' LIMIT 1), 1, 'presentation', 30, 150, 'scheduled', 'Team project presentations. Individual evaluations.', true, 1, CURRENT_TIMESTAMP),

-- CSCC69 - Operating Systems
('CSCC69-MIDTERM', (SELECT id FROM courses WHERE course_code = 'CSCC69' LIMIT 1), (SELECT id FROM academic_terms WHERE academic_year = 2025 AND season = 'Fall' LIMIT 1), 1, 'midterm', 100, 120, 'scheduled', 'Process scheduling, memory management, file systems.', true, 1, CURRENT_TIMESTAMP),

('CSCC69-LAB-FINAL', (SELECT id FROM courses WHERE course_code = 'CSCC69' LIMIT 1), (SELECT id FROM academic_terms WHERE academic_year = 2025 AND season = 'Fall' LIMIT 1), 1, 'lab_practical', 90, 120, 'scheduled', 'Linux systems administration and kernel concepts.', true, 1, CURRENT_TIMESTAMP),

-- CSCD84 - Artificial Intelligence
('CSCD84-FINAL-PROJECT', (SELECT id FROM courses WHERE course_code = 'CSCD84' LIMIT 1), (SELECT id FROM academic_terms WHERE academic_year = 2025 AND season = 'Fall' LIMIT 1), 1, 'project', 45, 150, 'scheduled', 'AI project demonstrations. Judges from industry.', true, 1, CURRENT_TIMESTAMP),

-- CSCD58 - Computer Networks
('CSCD58-MIDTERM', (SELECT id FROM courses WHERE course_code = 'CSCD58' LIMIT 1), (SELECT id FROM academic_terms WHERE academic_year = 2025 AND season = 'Fall' LIMIT 1), 1, 'midterm', 100, 140, 'scheduled', 'TCP/IP protocol stack and network security.', true, 1, CURRENT_TIMESTAMP),

('CSCD58-FINAL', (SELECT id FROM courses WHERE course_code = 'CSCD58' LIMIT 1), (SELECT id FROM academic_terms WHERE academic_year = 2025 AND season = 'Fall' LIMIT 1), 1, 'final', 120, 140, 'scheduled', 'Network architecture and advanced protocols.', true, 1, CURRENT_TIMESTAMP),

-- Mathematics course exams (if any exist)
('CSCA67-MIDTERM', (SELECT id FROM courses WHERE course_code = 'CSCA67' LIMIT 1), (SELECT id FROM academic_terms WHERE academic_year = 2025 AND season = 'Fall' LIMIT 1), 1, 'midterm', 120, 120, 'scheduled', 'Discrete mathematics: graph theory and combinatorics.', true, 1, CURRENT_TIMESTAMP),

('CSCA67-FINAL', (SELECT id FROM courses WHERE course_code = 'CSCA67' LIMIT 1), (SELECT id FROM academic_terms WHERE academic_year = 2025 AND season = 'Fall' LIMIT 1), 1, 'final', 150, 120, 'scheduled', 'Comprehensive exam covering all discrete math topics.', true, 1, CURRENT_TIMESTAMP);

-- Display inserted exams
SELECT 'Inserted ' || COUNT(*) || ' sample exams' as result FROM exams WHERE exam_code LIKE '%CSC%';
