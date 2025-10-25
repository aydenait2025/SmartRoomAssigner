#!/usr/bin/env python3
"""
Create mock exam data for existing courses with dates
"""
from backend.app import create_app
from backend.app.models.exam import Exam
from backend.app.models.course import Course
from datetime import datetime, timedelta, time

def create_exam_data():
    app = create_app()
    with app.app_context():
        # Get all courses
        courses = Course.query.filter_by(is_active=True).all()
        print(f'Found {len(courses)} courses')

        if not courses:
            print('No courses found')
            return

        # Start exams from 30 days from now
        base_date = datetime.now().date() + timedelta(days=30)
        created_exams = 0

        for i, course in enumerate(courses):
            # Space exams weekly and vary the times
            exam_date = base_date + timedelta(days=i * 7)

            morning_times = [(time(9, 0), time(11, 0)), (time(10, 30), time(12, 30)),
                           (time(14, 0), time(16, 0)), (time(15, 30), time(17, 30))]

            start_time, end_time = morning_times[i % len(morning_times)]

            exam = Exam(
                course_name=course.course_name,
                course_code=course.course_code,
                exam_date=exam_date,
                start_time=start_time,
                end_time=end_time,
                created_by=1  # Admin user
            )

            app.db.session.add(exam)
            created_exams += 1
            print(f'Created exam for {course.course_code} - {course.course_name} on {exam_date.strftime("%Y-%m-%d")} at {start_time} - {end_time}')

        app.db.session.commit()
        print(f'\nSuccessfully created {created_exams} exams for {len(courses)} courses')

if __name__ == '__main__':
    create_exam_data()
