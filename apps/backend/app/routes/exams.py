from flask import Blueprint, request, jsonify, current_app
from flask_login import login_required, current_user
from ..models.exam import Exam
from ..models.course import Course
from ..models.student import Student
from ..extensions import db
from datetime import datetime, date

bp = Blueprint('exams', __name__)

@bp.route('/exams', methods=['GET'])
@login_required
def get_exams():
    """Get exams with filtering options"""
    department_id = request.args.get('department_id', type=int)
    upcoming_only = request.args.get('upcoming_only', 'false').lower() == 'true'
    limit = request.args.get('limit', type=int)

    query = Exam.query.join(Course)

    # Filter by department if specified - check current user department
    user_dept_id = getattr(current_user, 'department_id', None)
    if department_id or user_dept_id:
        dept_id = department_id or user_dept_id
        query = query.filter(Course.department_id == dept_id)

    # Order by exam type and creation date (newest exams first)
    query = query.order_by(Exam.created_at.desc())

    # Apply limit if specified
    if limit:
        query = query.limit(limit)

    # Get all matching exams (no pagination for now)
    exams = query.all()

    # Add student count estimates from the database
    exams_with_counts = []
    for exam in exams:
        exam_dict = exam.to_dict()

        # Use the stored student_count_estimate from database, or provide a default
        student_count = exam.student_count_estimate or exam_dict.get('student_count_estimate', 0)

        # If no estimate, try to get enrolled students count
        if student_count == 0 and exam.course:
            try:
                student_count = Student.query.filter(
                    Student.courses.any(id=exam.course.id)
                ).count() or 30  # Default fallback
            except:
                student_count = 30

        exam_dict['student_count'] = student_count
        exams_with_counts.append(exam_dict)

    return jsonify({
        'exams': exams_with_counts,
        'total_items': len(exams_with_counts)
    }), 200

@bp.route('/exams/upcoming', methods=['GET'])
@login_required
def get_upcoming_exams():
    """Get upcoming exams for current user's department"""
    department_id = getattr(current_user, 'department_id', None)
    limit = request.args.get('limit', 10, type=int)

    if not department_id:
        return jsonify({'exams': []}), 200

    # Get upcoming exams for this department
    today = date.today()
    exams = Exam.query.filter(
        Exam.exam_date >= today
    ).order_by(Exam.exam_date, Exam.start_time).limit(limit).all()

    # Filter by department courses (if possible)
    department_exams = []
    for exam in exams:
        # Try to match exam course with department courses
        course = Course.query.filter(
            Course.name.ilike(f'%{exam.course_code}%'),
            Course.department_id == department_id
        ).first()

        if course:
            # Get student count
            student_count = Student.query.filter(
                Student.courses.any(id=course.id)
            ).count()

            exam_dict = exam.to_dict()
            exam_dict['student_count'] = student_count
            department_exams.append(exam_dict)

    return jsonify({'exams': department_exams}), 200

@bp.route('/exams', methods=['POST'])
@login_required
def create_exam():
    """Create a new exam"""
    data = request.get_json()

    required_fields = ['course_name', 'course_code', 'exam_date']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400

    exam = Exam(
        course_name=data['course_name'],
        course_code=data['course_code'],
        exam_date=datetime.fromisoformat(data['exam_date']).date() if data.get('exam_date') else None,
        start_time=datetime.strptime(data['start_time'], '%H:%M').time() if data.get('start_time') else None,
        end_time=datetime.strptime(data['end_time'], '%H:%M').time() if data.get('end_time') else None,
        created_by=current_user.id
    )

    db.session.add(exam)
    db.session.commit()

    return jsonify({'message': 'Exam created successfully', 'exam': exam.to_dict()}), 201

@bp.route('/exams/<int:exam_id>', methods=['PUT'])
@login_required
def update_exam(exam_id):
    """Update an exam"""
    exam = Exam.query.get_or_404(exam_id)
    data = request.get_json()

    if 'course_name' in data:
        exam.course_name = data['course_name']
    if 'course_code' in data:
        exam.course_code = data['course_code']
    if 'exam_date' in data:
        exam.exam_date = datetime.fromisoformat(data['exam_date']).date()
    if 'start_time' in data:
        exam.start_time = datetime.strptime(data['start_time'], '%H:%M').time()
    if 'end_time' in data:
        exam.end_time = datetime.strptime(data['end_time'], '%H:%M').time()

    db.session.commit()

    return jsonify({'message': 'Exam updated successfully', 'exam': exam.to_dict()}), 200

@bp.route('/exams/<int:exam_id>', methods=['DELETE'])
@login_required
def delete_exam(exam_id):
    """Delete an exam"""
    exam = Exam.query.get_or_404(exam_id)
    db.session.delete(exam)
    db.session.commit()

    return jsonify({'message': 'Exam deleted successfully'}), 200
