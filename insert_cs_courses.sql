-- Insert Computer Science and Mathematics departments if they don't exist
INSERT INTO academic_departments (department_name, created_at, updated_at)
SELECT 'Computer Science', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM academic_departments WHERE department_name = 'Computer Science');

INSERT INTO academic_departments (department_name, created_at, updated_at)
SELECT 'Mathematics', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM academic_departments WHERE department_name = 'Mathematics');

-- Insert Computer Science courses
INSERT INTO courses (course_code, course_name, department_id, typical_enrollment, created_at, updated_at)
SELECT 'csca08', 'Introduction to Computer Science I', d.id, 150, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM academic_departments d WHERE d.department_name = 'Computer Science'
AND NOT EXISTS (SELECT 1 FROM courses WHERE course_code = 'csca08');

INSERT INTO courses (course_code, course_name, department_id, typical_enrollment, created_at, updated_at)
SELECT 'csca48', 'Introduction to Computer Science II', d.id, 150, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM academic_departments d WHERE d.department_name = 'Computer Science'
AND NOT EXISTS (SELECT 1 FROM courses WHERE course_code = 'csca48');

INSERT INTO courses (course_code, course_name, department_id, typical_enrollment, created_at, updated_at)
SELECT 'csca20', 'Computer Science for the Sciences', d.id, 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM academic_departments d WHERE d.department_name = 'Computer Science'
AND NOT EXISTS (SELECT 1 FROM courses WHERE course_code = 'csca20');

INSERT INTO courses (course_code, course_name, department_id, typical_enrollment, created_at, updated_at)
SELECT 'csca67', 'Discrete Mathematics for Computer Scientists', d.id, 120, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM academic_departments d WHERE d.department_name = 'Mathematics'
AND NOT EXISTS (SELECT 1 FROM courses WHERE course_code = 'csca67');

INSERT INTO courses (course_code, course_name, department_id, typical_enrollment, created_at, updated_at)
SELECT 'cscb07', 'Software Design', d.id, 180, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM academic_departments d WHERE d.department_name = 'Computer Science'
AND NOT EXISTS (SELECT 1 FROM courses WHERE course_code = 'cscb07');

INSERT INTO courses (course_code, course_name, department_id, typical_enrollment, created_at, updated_at)
SELECT 'cscb09', 'Software Tools and Systems Programming', d.id, 160, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM academic_departments d WHERE d.department_name = 'Computer Science'
AND NOT EXISTS (SELECT 1 FROM courses WHERE course_code = 'cscb09');

INSERT INTO courses (course_code, course_name, department_id, typical_enrollment, created_at, updated_at)
SELECT 'cscb20', 'Introduction to Database and Web Applications', d.id, 140, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM academic_departments d WHERE d.department_name = 'Computer Science'
AND NOT EXISTS (SELECT 1 FROM courses WHERE course_code = 'cscb20');

INSERT INTO courses (course_code, course_name, department_id, typical_enrollment, created_at, updated_at)
SELECT 'cscb36', 'Introduction to the Theory of Computation', d.id, 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM academic_departments d WHERE d.department_name = 'Computer Science'
AND NOT EXISTS (SELECT 1 FROM courses WHERE course_code = 'cscb36');

INSERT INTO courses (course_code, course_name, department_id, typical_enrollment, created_at, updated_at)
SELECT 'cscb58', 'Computer Organization', d.id, 130, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM academic_departments d WHERE d.department_name = 'Computer Science'
AND NOT EXISTS (SELECT 1 FROM courses WHERE course_code = 'cscb58');

INSERT INTO courses (course_code, course_name, department_id, typical_enrollment, created_at, updated_at)
SELECT 'cscb63', 'Design and Analysis of Data Structures', d.id, 170, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM academic_departments d WHERE d.department_name = 'Computer Science'
AND NOT EXISTS (SELECT 1 FROM courses WHERE course_code = 'cscb63');

INSERT INTO courses (course_code, course_name, department_id, typical_enrollment, created_at, updated_at)
SELECT 'cscc01', 'Introduction to Software Engineering', d.id, 150, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM academic_departments d WHERE d.department_name = 'Computer Science'
AND NOT EXISTS (SELECT 1 FROM courses WHERE course_code = 'cscc01');

INSERT INTO courses (course_code, course_name, department_id, typical_enrollment, created_at, updated_at)
SELECT 'cscc09', 'Programming on the Web', d.id, 120, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM academic_departments d WHERE d.department_name = 'Computer Science'
AND NOT EXISTS (SELECT 1 FROM courses WHERE course_code = 'cscc09');

INSERT INTO courses (course_code, course_name, department_id, typical_enrollment, created_at, updated_at)
SELECT 'cscc10', 'Human-Computer Interaction', d.id, 110, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM academic_departments d WHERE d.department_name = 'Computer Science'
AND NOT EXISTS (SELECT 1 FROM courses WHERE course_code = 'cscc10');

INSERT INTO courses (course_code, course_name, department_id, typical_enrollment, created_at, updated_at)
SELECT 'cscc11', 'Introduction to Machine Learning and Data Mining', d.id, 130, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM academic_departments d WHERE d.department_name = 'Computer Science'
AND NOT EXISTS (SELECT 1 FROM courses WHERE course_code = 'cscc11');

INSERT INTO courses (course_code, course_name, department_id, typical_enrollment, created_at, updated_at)
SELECT 'cscc24', 'Principles of Programming Languages', d.id, 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM academic_departments d WHERE d.department_name = 'Computer Science'
AND NOT EXISTS (SELECT 1 FROM courses WHERE course_code = 'cscc24');

INSERT INTO courses (course_code, course_name, department_id, typical_enrollment, created_at, updated_at)
SELECT 'cscc37', 'Introduction to Numerical Algorithms for Computational Mathematics', d.id, 80, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM academic_departments d WHERE d.department_name = 'Mathematics'
AND NOT EXISTS (SELECT 1 FROM courses WHERE course_code = 'cscc37');

INSERT INTO courses (course_code, course_name, department_id, typical_enrollment, created_at, updated_at)
SELECT 'cscc43', 'Introduction to Databases', d.id, 140, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM academic_departments d WHERE d.department_name = 'Computer Science'
AND NOT EXISTS (SELECT 1 FROM courses WHERE course_code = 'cscc43');

INSERT INTO courses (course_code, course_name, department_id, typical_enrollment, created_at, updated_at)
SELECT 'cscc46', 'Social and Information Networks', d.id, 90, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM academic_departments d WHERE d.department_name = 'Computer Science'
AND NOT EXISTS (SELECT 1 FROM courses WHERE course_code = 'cscc46');

INSERT INTO courses (course_code, course_name, department_id, typical_enrollment, created_at, updated_at)
SELECT 'cscc63', 'Computability and Computational Complexity', d.id, 80, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM academic_departments d WHERE d.department_name = 'Computer Science'
AND NOT EXISTS (SELECT 1 FROM courses WHERE course_code = 'cscc63');

INSERT INTO courses (course_code, course_name, department_id, typical_enrollment, created_at, updated_at)
SELECT 'cscc69', 'Operating Systems', d.id, 120, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM academic_departments d WHERE d.department_name = 'Computer Science'
AND NOT EXISTS (SELECT 1 FROM courses WHERE course_code = 'cscc69');

INSERT INTO courses (course_code, course_name, department_id, typical_enrollment, created_at, updated_at)
SELECT 'cscc73', 'Algorithm Design and Analysis', d.id, 130, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM academic_departments d WHERE d.department_name = 'Computer Science'
AND NOT EXISTS (SELECT 1 FROM courses WHERE course_code = 'cscc73');

INSERT INTO courses (course_code, course_name, department_id, typical_enrollment, created_at, updated_at)
SELECT 'cscc85', 'Introduction to Embedded Systems', d.id, 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM academic_departments d WHERE d.department_name = 'Computer Science'
AND NOT EXISTS (SELECT 1 FROM courses WHERE course_code = 'cscc85');

INSERT INTO courses (course_code, course_name, department_id, typical_enrollment, created_at, updated_at)
SELECT 'cscd01', 'Engineering Large Software Systems', d.id, 110, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM academic_departments d WHERE d.department_name = 'Computer Science'
AND NOT EXISTS (SELECT 1 FROM courses WHERE course_code = 'cscd01');

INSERT INTO courses (course_code, course_name, department_id, typical_enrollment, created_at, updated_at)
SELECT 'cscd03', 'Social Impact of Information Technology', d.id, 120, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM academic_departments d WHERE d.department_name = 'Computer Science'
AND NOT EXISTS (SELECT 1 FROM courses WHERE course_code = 'cscd03');

INSERT INTO courses (course_code, course_name, department_id, typical_enrollment, created_at, updated_at)
SELECT 'cscd18', 'Computer Graphics', d.id, 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM academic_departments d WHERE d.department_name = 'Computer Science'
AND NOT EXISTS (SELECT 1 FROM courses WHERE course_code = 'cscd18');

INSERT INTO courses (course_code, course_name, department_id, typical_enrollment, created_at, updated_at)
SELECT 'cscd37', 'Analysis of Numerical Algorithmns for Computational Mathematics', d.id, 70, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM academic_departments d WHERE d.department_name = 'Mathematics'
AND NOT EXISTS (SELECT 1 FROM courses WHERE course_code = 'cscd37');

INSERT INTO courses (course_code, course_name, department_id, typical_enrollment, created_at, updated_at)
SELECT 'cscd43', 'Database System Technology', d.id, 90, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM academic_departments d WHERE d.department_name = 'Computer Science'
AND NOT EXISTS (SELECT 1 FROM courses WHERE course_code = 'cscd43');

INSERT INTO courses (course_code, course_name, department_id, typical_enrollment, created_at, updated_at)
SELECT 'cscd58', 'Computer Networks', d.id, 140, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM academic_departments d WHERE d.department_name = 'Computer Science'
AND NOT EXISTS (SELECT 1 FROM courses WHERE course_code = 'cscd58');

INSERT INTO courses (course_code, course_name, department_id, typical_enrollment, created_at, updated_at)
SELECT 'cscd70', 'Compiler Optimization', d.id, 80, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM academic_departments d WHERE d.department_name = 'Computer Science'
AND NOT EXISTS (SELECT 1 FROM courses WHERE course_code = 'cscd70');

INSERT INTO courses (course_code, course_name, department_id, typical_enrollment, created_at, updated_at)
SELECT 'cscd84', 'Artifical Intelligence', d.id, 150, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM academic_departments d WHERE d.department_name = 'Computer Science'
AND NOT EXISTS (SELECT 1 FROM courses WHERE course_code = 'cscd84');
