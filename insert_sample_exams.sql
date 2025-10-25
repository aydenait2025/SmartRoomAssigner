-- Insert sample exams for Computer Science courses using simpler approach
-- Get the required IDs first
SELECT id, department_name FROM academic_departments;
SELECT id, course_code, course_name FROM courses WHERE course_code LIKE 'CSC%' LIMIT 5;
SELECT id, academic_year, season, term_code FROM academic_terms;

-- Insert sample exams using direct IDs (adjust these based on the query results above)
-- Replace these IDs with the actual IDs from your database:
-- Course IDs: Look at the first CS course for course_id
-- Term ID: Should be the Fall 2025 term

-- For example, if course_id = 2 and term_id = 1, uncomment and use:
INSERT INTO exams (exam_code, course_id, term_id, instructor_id, exam_type, duration_minutes, student_count_estimate, status, special_instructions, requires_supervision, created_by, created_at) VALUES
('CSC-MIDTERM-1', (SELECT id FROM courses WHERE course_code LIKE 'CSC%' LIMIT 1), (SELECT id FROM academic_terms WHERE academic_year = 2025 AND season = 'Fall' LIMIT 1), 1, 'midterm', 90, 120, 'scheduled', 'Bring calculator and ID. No laptops allowed.', true, 1, CURRENT_TIMESTAMP);

INSERT INTO exams (exam_code, course_id, term_id, instructor_id, exam_type, duration_minutes, student_count_estimate, status, special_instructions, requires_supervision, created_by, created_at) VALUES
('CSC-FINAL-1', (SELECT id FROM courses WHERE course_code LIKE 'CSC%' LIMIT 1), (SELECT id FROM academic_terms WHERE academic_year = 2025 AND season = 'Fall' LIMIT 1), 1, 'final', 120, 120, 'scheduled', 'Cumulative final exam covering all material.', true, 1, CURRENT_TIMESTAMP);

INSERT INTO exams (exam_code, course_id, term_id, instructor_id, exam_type, duration_minutes, student_count_estimate, status, special_instructions, requires_supervision, created_by, created_at) VALUES
('CSC-MIDTERM-2', (SELECT id FROM courses WHERE course_code LIKE 'CSC%' LIMIT 1 OFFSET 1), (SELECT id FROM academic_terms WHERE academic_year = 2025 AND season = 'Fall' LIMIT 1), 1, 'midterm', 90, 100, 'scheduled', 'Focus on advanced concepts and problem solving.', true, 1, CURRENT_TIMESTAMP);

INSERT INTO exams (exam_code, course_id, term_id, instructor_id, exam_type, duration_minutes, student_count_estimate, status, special_instructions, requires_supervision, created_by, created_at) VALUES
('CSC-FINAL-2', (SELECT id FROM courses WHERE course_code LIKE 'CSC%' LIMIT 1 OFFSET 1), (SELECT id FROM academic_terms WHERE academic_year = 2025 AND season = 'Fall' LIMIT 1), 1, 'final', 120, 100, 'scheduled', 'Comprehensive final covering all advanced topics.', true, 1, CURRENT_TIMESTAMP);

INSERT INTO exams (exam_code, course_id, term_id, instructor_id, exam_type, duration_minutes, student_count_estimate, status, special_instructions, requires_supervision, created_by, created_at) VALUES
('CSC-PROJECT-PRESENTATION', (SELECT id FROM courses WHERE course_code LIKE 'CSC%' LIMIT 1), (SELECT id FROM academic_terms WHERE academic_year = 2025 AND season = 'Fall' LIMIT 1), 1, 'presentation', 30, 80, 'scheduled', 'Team project presentations. Individual evaluations.', true, 1, CURRENT_TIMESTAMP);

-- Display inserted exams
SELECT 'Inserted ' || COUNT(*) || ' sample exams' as result FROM exams WHERE exam_code LIKE '%CSC%';

-- Show exam details
SELECT e.exam_code, c.course_code, e.exam_type, e.duration_minutes, e.student_count_estimate, e.status
FROM exams e
JOIN courses c ON e.course_id = c.id
WHERE e.exam_code LIKE '%CSC%';
