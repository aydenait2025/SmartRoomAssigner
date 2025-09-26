from flask import Blueprint, request, jsonify
from flask_login import login_required
from ..models.student import Student
from ..models.course import Course
from ..extensions import db

bp = Blueprint('students', __name__)

@bp.route('/students', methods=['GET'])
@login_required
def get_students():
    """Get all students"""
    students = Student.query.all()
    return jsonify({'students': [student.to_dict() for student in students]}), 200

@bp.route('/students/<int:student_id>', methods=['GET'])
@login_required
def get_student(student_id):
    """Get a specific student"""
    student = Student.query.get_or_404(student_id)
    return jsonify({'student': student.to_dict()}), 200

@bp.route('/students', methods=['POST'])
@login_required
def create_student():
    """Create a new student"""
    data = request.get_json()

    required_fields = ['student_id', 'first_name', 'last_name', 'email']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400

    # Check if student already exists
    existing_student = Student.query.filter_by(student_id=data['student_id']).first()
    if existing_student:
        return jsonify({'error': 'Student ID already exists'}), 400

    student = Student(
        student_id=data['student_id'],
        first_name=data['first_name'],
        last_name=data['last_name'],
        email=data['email'],
        phone=data.get('phone'),
        year=data.get('year'),
        major=data.get('major'),
        gpa=data.get('gpa')
    )

    db.session.add(student)
    db.session.commit()

    return jsonify({'message': 'Student created successfully', 'student': student.to_dict()}), 201

@bp.route('/students/<int:student_id>', methods=['PUT'])
@login_required
def update_student(student_id):
    """Update a student"""
    student = Student.query.get_or_404(student_id)
    data = request.get_json()

    if 'student_id' in data:
        existing_student = Student.query.filter_by(student_id=data['student_id']).first()
        if existing_student and existing_student.id != student_id:
            return jsonify({'error': 'Student ID already exists'}), 400
        student.student_id = data['student_id']

    if 'first_name' in data:
        student.first_name = data['first_name']

    if 'last_name' in data:
        student.last_name = data['last_name']

    if 'email' in data:
        student.email = data['email']

    if 'phone' in data:
        student.phone = data['phone']

    if 'year' in data:
        student.year = data['year']

    if 'major' in data:
        student.major = data['major']

    if 'gpa' in data:
        student.gpa = data['gpa']

    db.session.commit()

    return jsonify({'message': 'Student updated successfully', 'student': student.to_dict()}), 200

@bp.route('/students/<int:student_id>', methods=['DELETE'])
@login_required
def delete_student(student_id):
    """Delete a student"""
    student = Student.query.get_or_404(student_id)
    db.session.delete(student)
    db.session.commit()

    return jsonify({'message': 'Student deleted successfully'}), 200

@bp.route('/students/search', methods=['GET'])
@login_required
def search_students():
    """Search students by various criteria"""
    query = request.args.get('q', '')
    major = request.args.get('major', '')
    year = request.args.get('year', '')

    students_query = Student.query

    if query:
        students_query = students_query.filter(
            (Student.first_name.ilike(f'%{query}%')) |
            (Student.last_name.ilike(f'%{query}%')) |
            (Student.student_id.ilike(f'%{query}%')) |
            (Student.email.ilike(f'%{query}%'))
        )

    if major:
        students_query = students_query.filter(Student.major.ilike(f'%{major}%'))

    if year:
        students_query = students_query.filter_by(year=year)

    students = students_query.all()
    return jsonify({'students': [student.to_dict() for student in students]}), 200
