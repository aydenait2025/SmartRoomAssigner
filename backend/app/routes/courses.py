from flask import Blueprint, request, jsonify, send_file
from flask_login import login_required
from ..models.course import Course
from ..models.academic_department import AcademicDepartment
from ..extensions import db
import math
import pandas as pd
import os
from werkzeug.utils import secure_filename
from flask import current_app

ALLOWED_EXTENSIONS = {'csv', 'xlsx', 'xls'}

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

bp = Blueprint('courses', __name__)

@bp.route('/courses', methods=['GET'])
@login_required
def get_courses():
    """Get all courses with enrollment statistics"""
    # Pagination parameters
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))

    # Filter parameters
    status_filter = request.args.get('status', 'all')  # 'all', 'assigned', 'unassigned'

    # Query courses
    query = Course.query

    total_items = query.count()
    total_pages = math.ceil(total_items / per_page)

    # Get courses with pagination
    courses = query.offset((page - 1) * per_page).limit(per_page).all()

    courses_data = []
    for course in courses:
        course_dict = course.to_dict()

        # Get assigned students count (from assignments table based on course field)
        try:
            from ..extensions import db
            result = db.session.execute(
                "SELECT COUNT(*) FROM assignments WHERE course ILIKE :course_name",
                {'course_name': f'%{course.course_name}%'}
            ).scalar()
            assigned_students = result or 0
        except:
            assigned_students = 0

        course_dict['assigned_students'] = assigned_students
        course_dict['department'] = course.department.department_name if course.department else 'Unknown'

        courses_data.append(course_dict)

    # Apply status filtering on the results (client-side since we have the assigned students count)
    if status_filter == 'assigned':
        courses_data = [c for c in courses_data if c['assigned_students'] >= c['expected_students']]
    elif status_filter == 'unassigned':
        courses_data = [c for c in courses_data if c['assigned_students'] < c['expected_students']]

    # Recalc total_items based on filtering
    total_items = len(courses_data)

    return jsonify({
        'courses': courses_data,
        'current_page': page,
        'total_pages': total_pages,
        'per_page': per_page,
        'total_items': total_items
    }), 200

@bp.route('/courses/<int:course_id>', methods=['GET'])
@login_required
def get_course(course_id):
    """Get a specific course"""
    course = Course.query.get(course_id)
    if not course:
        return jsonify({'error': 'Course not found'}), 404

    course_dict = course.to_dict()

    # Get assigned students count
    try:
        result = db.session.execute(
            "SELECT COUNT(*) FROM assignments WHERE course ILIKE :course_name",
            {'course_name': f'%{course.course_name}%'}
        ).scalar()
        assigned_students = result or 0
    except:
        assigned_students = 0

    course_dict['assigned_students'] = assigned_students
    course_dict['department'] = course.department.department_name if course.department else 'Unknown'

    return jsonify({'course': course_dict}), 200

@bp.route('/courses', methods=['POST'])
@login_required
def create_course():
    """Create a new course"""
    data = request.get_json()

    required_fields = ['course_code', 'course_name']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400

    # Check if course with this code already exists
    if Course.query.filter_by(course_code=data['course_code']).first():
        return jsonify({'error': 'Course code already exists'}), 400

    course = Course(
        course_code=data['course_code'],
        course_name=data['course_name'],
        department_id=data.get('department_id'),
        typical_enrollment=data.get('expected_students', 0),
    )

    db.session.add(course)
    db.session.commit()

    course_dict = course.to_dict()
    course_dict['assigned_students'] = 0
    course_dict['department'] = course.department.department_name if course.department else 'Unknown'

    return jsonify({'message': 'Course created successfully', 'course': course_dict}), 201

@bp.route('/courses/<int:course_id>', methods=['PUT'])
@login_required
def update_course(course_id):
    """Update a course"""
    course = Course.query.get(course_id)
    if not course:
        return jsonify({'error': 'Course not found'}), 404

    data = request.get_json()

    # Check if course code is being changed and already exists
    if 'course_code' in data and data['course_code'] != course.course_code:
        if Course.query.filter_by(course_code=data['course_code']).first():
            return jsonify({'error': 'Course code already exists'}), 400
        course.course_code = data['course_code']

    if 'course_name' in data:
        course.course_name = data['course_name']
    if 'department_id' in data:
        course.department_id = data['department_id']
    if 'expected_students' in data:
        course.typical_enrollment = data['expected_students']

    course.updated_at = db.func.current_timestamp()
    db.session.commit()

    course_dict = course.to_dict()

    # Get current assigned students
    try:
        result = db.session.execute(
            "SELECT COUNT(*) FROM assignments WHERE course ILIKE :course_name",
            {'course_name': f'%{course.course_name}%'}
        ).scalar()
        assigned_students = result or 0
    except:
        assigned_students = 0

    course_dict['assigned_students'] = assigned_students
    course_dict['department'] = course.department.department_name if course.department else 'Unknown'

    return jsonify({'message': 'Course updated successfully', 'course': course_dict}), 200

@bp.route('/courses/<int:course_id>', methods=['DELETE'])
@login_required
def delete_course(course_id):
    """Delete a course"""
    course = Course.query.get(course_id)
    if not course:
        return jsonify({'error': 'Course not found'}), 404

    db.session.delete(course)
    db.session.commit()

    return jsonify({'message': 'Course deleted successfully'}), 200

@bp.route('/courses/export-csv', methods=['GET'])
@login_required
def export_courses_csv():
    """Export courses to CSV file"""
    courses = Course.query.all()

    # Create CSV content
    csv_content = "course_code,course_name,department,expected_students\n"

    for course in courses:
        department_name = course.department.department_name if course.department else ""
        csv_content += f'"{course.course_code}","{course.course_name}","{department_name}",{course.typical_enrollment}\n'

    # Return file
    response = send_file(
        pd.io.common.StringIO(csv_content),
        mimetype='text/csv',
        download_name='courses.csv',
        as_attachment=True
    )
    return response

@bp.route('/courses/import-csv', methods=['POST'])
@login_required
def import_courses_csv():
    """Import courses from CSV file"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed. Use CSV or Excel files'}), 400

    try:
        # Save file temporarily
        filename = secure_filename(file.filename)
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        # Read file
        if filename.endswith('.csv'):
            df = pd.read_csv(filepath)
        else:
            df = pd.read_excel(filepath)

        # Validate required columns
        required_columns = ['course_code', 'course_name']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            os.remove(filepath)
            return jsonify({'error': f'Missing required columns: {missing_columns}'}), 400

        imported_courses = []
        duplicates = []
        errors = []

        for i, row in df.iterrows():
            try:
                course_code = str(row['course_code']).strip()
                course_name = str(row['course_name']).strip()

                # Check if course with this code already exists
                existing_course = Course.query.filter_by(course_code=course_code).first()
                if existing_course:
                    duplicates.append(f'Row {i+2}: Course code {course_code} already exists')
                    continue

                # Find or create department
                department_id = None
                department_name = str(row.get('department', '')).strip() if pd.notna(row.get('department')) else ''

                if department_name:
                    # Try to find existing department
                    department = AcademicDepartment.query.filter_by(department_name=department_name).first()
                    if not department:
                        # Create new department
                        department = AcademicDepartment(department_name=department_name)
                        db.session.add(department)
                        db.session.commit()
                    department_id = department.id

                # Get expected students
                expected_students = int(row.get('expected_students', 0)) if pd.notna(row.get('expected_students')) and str(row.get('expected_students')).isdigit() else 0

                course = Course(
                    course_code=course_code,
                    course_name=course_name,
                    department_id=department_id,
                    typical_enrollment=expected_students,
                )

                db.session.add(course)
                imported_courses.append(course)

            except Exception as e:
                errors.append(f'Row {i+2}: {str(e)}')

        if imported_courses:
            db.session.commit()

        # Clean up file
        os.remove(filepath)

        success_count = len(imported_courses)
        result_message = f'Successfully imported {success_count} courses'

        if duplicates:
            result_message += f', {len(duplicates)} duplicates skipped'
        if errors:
            result_message += f', {len(errors)} errors'

        response_data = {
            'message': result_message,
            'success': success_count,
            'duplicates': duplicates,
            'errors': errors,
        }

        if imported_courses:
            response_data['courses'] = [course.to_dict() for course in imported_courses]

        return jsonify(response_data), 200 if success_count > 0 else 400

    except Exception as e:
        return jsonify({'error': f'Error processing file: {str(e)}'}), 500
