from flask import Blueprint, request, jsonify, send_file
from flask_login import login_required
from ..models.user import User
from ..models.assignment import Enrollment as CourseEnrollment  # Import here to avoid circular imports
from ..extensions import db
import math
from datetime import datetime
import csv
import io

bp = Blueprint('students', __name__)

@bp.route('/students', methods=['GET'])
@login_required
def get_students():
    """Get all students (users with role_id=2) with stats"""
    # Pagination parameters
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))

    # Filter parameters
    search = request.args.get('search', '')
    status_filter = request.args.get('status', 'all')  # 'all', 'active', 'inactive'
    course_filter = request.args.get('course', 'all')  # 'all' or specific course code

    # Query users with role_id=2 (students)
    query = User.query.filter_by(role_id=2)

    # Apply search filter
    if search:
        query = query.filter(
            (User.name.ilike(f'%{search}%')) |
            (User.email.ilike(f'%{search}%'))
        )

    # Calculate overall stats (always based on all students, not filtered)
    all_students_query = User.query.filter_by(role_id=2)
    total_students = all_students_query.count()
    active_students = all_students_query.filter_by(is_active=True, is_locked=False).count()
    inactive_students = all_students_query.filter_by(is_active=False).count()
    locked_students = all_students_query.filter_by(is_locked=True).count()

    # Apply status filter to results query
    if status_filter == 'active':
        query = query.filter_by(is_active=True, is_locked=False)
    elif status_filter == 'inactive':
        query = query.filter_by(is_active=False)
    elif status_filter == 'locked':
        query = query.filter_by(is_locked=True)

    # Apply course filter (students enrolled in specific course)
    if course_filter != 'all':
        try:
            # Find the course ID by matching the course code
            from ..models.course import Course
            target_course = Course.query.filter_by(course_code=course_filter).first()

            if target_course:
                # Get students enrolled in this course via course_enrollments table
                # We need to join with the course_enrollments table to find enrolled students
                enrolled_user_ids_query = db.session.query(CourseEnrollment.student_id)\
                    .filter(CourseEnrollment.course_id == target_course.id)\
                    .filter(CourseEnrollment.enrollment_status == 'enrolled')

                enrolled_user_ids = [row[0] for row in enrolled_user_ids_query.all()]

                if enrolled_user_ids:
                    query = query.filter(User.id.in_(enrolled_user_ids))
                else:
                    # No students enrolled in this course
                    query = query.filter(User.id == -1)  # Return no results
            else:
                # Course not found
                query = query.filter(User.id == -1)  # Return no results

        except Exception as e:
            # If there's an error with course filtering, log it but continue without filtering
            print(f"Error filtering by course {course_filter}: {e}")
            # Don't apply any filtering if there's an error

    total_items = query.count()
    total_pages = math.ceil(total_items / per_page)

    students = query.offset((page - 1) * per_page).limit(per_page).all()

    students_data = []
    for student in students:
        student_dict = student.to_dict()
        # Add role name for display
        if student.role:
            student_dict['role_name'] = student.role.name
        else:
            student_dict['role_name'] = 'Student'
        students_data.append(student_dict)

    return jsonify({
        'students': students_data,
        'current_page': page,
        'total_pages': total_pages,
        'per_page': per_page,
        'total_items': total_items,
        'stats': {
            'total': total_students,
            'active': active_students,
            'inactive': inactive_students,
            'locked': locked_students
        }
    }), 200

@bp.route('/students/<int:student_id>', methods=['GET'])
@login_required
def get_student(student_id):
    """Get a specific student (user with role_id=2)"""
    student = User.query.filter_by(id=student_id, role_id=2).first()
    if not student:
        return jsonify({'error': 'Student not found'}), 404

    student_data = student.to_dict()
    if student.role:
        student_data['role_name'] = student.role.name
    else:
        student_data['role_name'] = 'Student'

    return jsonify({'student': student_data}), 200

@bp.route('/students', methods=['POST'])
@login_required
def create_student():
    """Create a new student (user with role_id=2)"""
    data = request.get_json()

    required_fields = ['email', 'name']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400

    # Check if user with this email already exists
    existing_user = User.query.filter_by(email=data['email']).first()
    if existing_user:
        return jsonify({'error': 'Email already exists'}), 400

    # Hash the password using werkzeug
    password_plain = data.get('password', 'TempPassword123!')
    from werkzeug.security import generate_password_hash
    password_hash = generate_password_hash(password_plain)

    student = User(
        name=data['name'],
        email=data['email'],
        password_hash=password_hash,
        role_id=2,  # Student role
        is_active=True,
        email_verified=True,
        department_id=data.get('department_id'),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    db.session.add(student)
    db.session.commit()

    student_data = student.to_dict()
    if student.role:
        student_data['role_name'] = student.role.name
    else:
        student_data['role_name'] = 'Student'

    return jsonify({'message': 'Student created successfully', 'student': student_data}), 201

@bp.route('/students/<int:student_id>', methods=['PUT'])
@login_required
def update_student(student_id):
    """Update a student (user with role_id=2)"""
    student = User.query.filter_by(id=student_id, role_id=2).first()
    if not student:
        return jsonify({'error': 'Student not found'}), 404

    data = request.get_json()

    # Check if email is being changed and already exists
    if 'email' in data and data['email'] != student.email:
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            return jsonify({'error': 'Email already exists'}), 400
        student.email = data['email']

    if 'name' in data:
        student.name = data['name']

    if 'is_active' in data:
        student.is_active = data['is_active']

    if 'department_id' in data:
        student.department_id = data['department_id']

    student.updated_at = datetime.utcnow()

    db.session.commit()

    student_data = student.to_dict()
    if student.role:
        student_data['role_name'] = student.role.name
    else:
        student_data['role_name'] = 'Student'

    return jsonify({'message': 'Student updated successfully', 'student': student_data}), 200

@bp.route('/students/<int:student_id>', methods=['DELETE'])
@login_required
def delete_student(student_id):
    """Delete a student (user with role_id=2)"""
    student = User.query.filter_by(id=student_id, role_id=2).first()
    if not student:
        return jsonify({'error': 'Student not found'}), 404

    db.session.delete(student)
    db.session.commit()

    return jsonify({'message': 'Student deleted successfully'}), 200

@bp.route('/students/search', methods=['GET'])
@login_required
def search_students():
    """Search students by various criteria"""
    query = request.args.get('q', '')
    department = request.args.get('department', '')

    students_query = User.query.filter_by(role_id=2)

    if query:
        students_query = students_query.filter(
            (User.name.ilike(f'%{query}%')) |
            (User.email.ilike(f'%{query}%'))
        )

    if department:
        # This would need to be updated if we add department relation
        # For now, search by department name if we had that relation
        pass

    students = students_query.all()

    students_data = []
    for student in students:
        student_dict = student.to_dict()
        if student.role:
            student_dict['role_name'] = student.role.name
        else:
            student_dict['role_name'] = 'Student'
        students_data.append(student_dict)

    return jsonify({'students': students_data}), 200

@bp.route('/students/export-csv', methods=['GET'])
@login_required
def export_students_csv():
    """Export students to CSV format"""
    students = User.query.filter_by(role_id=2).all()

    # Create CSV output
    output = io.StringIO()
    writer = csv.writer(output)

    # Write header
    writer.writerow(['ID', 'Name', 'Email', 'Is Active', 'Email Verified', 'Created At'])

    # Write data
    for student in students:
        writer.writerow([
            student.id,
            student.name,
            student.email,
            'Yes' if student.is_active else 'No',
            'Yes' if student.email_verified else 'No',
            student.created_at.strftime('%Y-%m-%d %H:%M:%S') if student.created_at else ''
        ])

    # Prepare response
    output.seek(0)
    return send_file(
        io.BytesIO(output.getvalue().encode('utf-8')),
        mimetype='text/csv',
        as_attachment=True,
        download_name='students_export.csv'
    )

@bp.route('/students/import-csv', methods=['POST'])
@login_required
def import_students_csv():
    """Import students from CSV file"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    if not file.filename:
        return jsonify({'error': 'No file selected'}), 400

    if not file.filename.endswith('.csv'):
        return jsonify({'error': 'File must be a CSV file'}), 400

    # Read CSV content
    try:
        content = file.read().decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(content))
    except Exception as e:
        return jsonify({'error': f'Error reading CSV file: {str(e)}'}), 400

    success_count = 0
    errors = []

    # Expected columns
    expected_columns = {'name', 'email', 'password'}

    for row_num, row in enumerate(csv_reader, start=2):  # Start at 2 for 0-indexed + header
        try:
            # Validate required columns
            if not row.get('email') or not row.get('name'):
                errors.append(f"Row {row_num}: Email and name are required")
                continue

            # Check if user already exists
            if User.query.filter_by(email=row['email']).first():
                errors.append(f"Row {row_num}: Email {row['email']} already exists")
                continue

            # Create new user
            name = row['name'].strip()
            email = row['email'].strip()
            password_plain = row.get('password', 'TempPassword123!').strip()

            from werkzeug.security import generate_password_hash
            password_hash = generate_password_hash(password_plain)

            student = User(
                name=name,
                email=email,
                password_hash=password_hash,
                role_id=2,  # Student role
                is_active=True,
                email_verified=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )

            db.session.add(student)
            success_count += 1

        except Exception as e:
            errors.append(f"Row {row_num}: {str(e)}")

    if success_count > 0:
        db.session.commit()

    response = {
        'success': success_count,
        'total_rows': row_num - 1 if 'row_num' in locals() else 0,
        'errors': errors
    }

    if success_count > 0 and errors:
        response['message'] = f'Successfully imported {success_count} students with {len(errors)} errors'
    elif success_count > 0:
        response['message'] = f'Successfully imported {success_count} students'
    else:
        response['message'] = f'No students imported. Errors: {errors}'

    return jsonify(response), 200
