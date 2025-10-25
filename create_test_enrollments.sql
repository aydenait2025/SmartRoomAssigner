-- Create test course enrollments for Students (users with role_id=2)
-- This creates sample enrollment data to test course filtering

-- Insert some test enrollments
INSERT INTO course_enrollments (student_id, course_id, enrollment_status)
SELECT
  s.id as student_id,
  c.id as course_id,
  'enrolled' as enrollment_status
FROM users s
CROSS JOIN courses c
WHERE s.role_id = 2
-- Randomly enroll each student in 1-2 courses (deterministically based on IDs)
AND CAST(RIGHT(CAST(s.id * c.id * 7 AS VARCHAR(20)), 1) AS INTEGER) < 8;

-- Show what we created
SELECT
  u.name,
  c.course_code,
  c.course_name,
  ce.enrollment_status
FROM users u
JOIN course_enrollments ce ON ce.student_id = u.id
JOIN courses c ON ce.course_id = c.id
WHERE u.role_id = 2
ORDER BY u.name, c.course_code;

-- Summary
SELECT
  COUNT(DISTINCT ce.student_id) as enrolled_students,
  COUNT(*) as total_enrollments
FROM course_enrollments ce
JOIN users u ON u.id = ce.student_id
WHERE u.role_id = 2;
