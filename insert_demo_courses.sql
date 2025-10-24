-- Insert Demo Courses into SmartRoomAssigner Database
-- Computer Science curriculum for testing

-- Get the COMP department ID (should be 1 from seed data)
INSERT INTO courses (
    course_code, course_name, department_id, credits, course_level,
    course_format, prerequisites, corequisites, course_description,
    learning_objectives, assessment_methods, grading_scheme,
    typical_enrollment, workload_hours_per_week, is_active
) VALUES
('CS101', 'Introduction to Computer Science', 1, 3.0, 100,
 'Lecture', '[]'::jsonb, '[]'::jsonb, 'Fundamental programming concepts and problem solving.',
 'Understand basic programming and algorithms.',
 '["Exams", "Assignments", "Projects"]'::jsonb,
 'Letter grades: Exams 40%, Assignments 30%, Projects 30%', 150, 8, true),

('CS201', 'Data Structures and Algorithms', 1, 4.0, 200,
 'Lecture', '["CS101"]'::jsonb, '[]'::jsonb, 'Advanced data structures and algorithm design.',
 'Master advanced data structures and algorithms.',
 '["Programming Assignments", "Algorithm Analysis", "Final Exam"]'::jsonb,
 'Letter grades: Assignments 50%, Exams 40%, Participation 10%', 120, 12, true),

('CS300', 'Database Systems', 1, 3.0, 300,
 'Lecture', '["CS201", "CS101"]'::jsonb, '[]'::jsonb, 'Relational databases and SQL.',
 'Design and implement database systems.',
 '["Database Projects", "SQL Assignments", "Final Exam"]'::jsonb,
 'Letter grades: Projects 50%, Assignments 30%, Exam 20%', 80, 10, true),

('CS400', 'Machine Learning', 1, 4.0, 400,
 'Lecture', '["CS201"]'::jsonb, '[]'::jsonb, 'Introduction to machine learning algorithms.',
 'Implement and understand ML algorithms.',
 '["ML Projects", "Research Paper", "Final Exam"]'::jsonb,
 'Letter grades: Projects 40%, Paper 30%, Exam 30%', 60, 14, true),

('CS101L', 'Computer Science Lab', 1, 1.0, 100,
 'Lab', '[]'::jsonb, '[]'::jsonb, 'Hands-on programming lab.',
 'Gain practical programming experience.',
 '["Lab Exercises", "Programming Projects"]'::jsonb,
 'Pass/Fail based on completion', 25, 4, true)

ON CONFLICT (course_code) DO NOTHING;

-- Verify the insertions
SELECT
    course_code,
    course_name,
    credits,
    course_level,
    course_format,
    typical_enrollment
FROM courses
WHERE department_id = 1
ORDER BY course_level;
