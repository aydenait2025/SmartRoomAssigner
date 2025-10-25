from flask import Blueprint, request, jsonify
from flask_login import login_required
from datetime import datetime, time, timedelta
from ..models.assignment import Assignment
from ..models.student import Student
from ..models.exam import Exam
from ..models.room import Room
from ..extensions import db

bp = Blueprint('assignments', __name__)

@bp.route('/assignments', methods=['GET'])
@login_required
def get_assignments():
    """Get all assignments"""
    # Support both student_id (legacy) and user_id for backward compatibility
    student_id = request.args.get('student_id', type=int)
    user_id = request.args.get('user_id', type=int) or student_id  # Support both naming conventions
    exam_id = request.args.get('exam_id', type=int)
    room_id = request.args.get('room_id', type=int)
    date_from = request.args.get('date_from')
    date_to = request.args.get('date_to')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    assignments_query = Assignment.query

    if user_id:
        assignments_query = assignments_query.filter_by(user_id=user_id)

    if exam_id:
        assignments_query = assignments_query.filter_by(exam_id=exam_id)

    if room_id:
        assignments_query = assignments_query.filter_by(room_id=room_id)

    if date_from:
        assignments_query = assignments_query.filter(Assignment.assigned_date >= datetime.fromisoformat(date_from))

    if date_to:
        assignments_query = assignments_query.filter(Assignment.assigned_date <= datetime.fromisoformat(date_to))

    # Apply pagination
    total_items = assignments_query.count()
    assignments = assignments_query.offset((page - 1) * per_page).limit(per_page).all()

    total_pages = (total_items + per_page - 1) // per_page

    return jsonify({
        'assignments': [assignment.to_dict() for assignment in assignments],
        'total_items': total_items,
        'total_pages': total_pages,
        'current_page': page,
        'per_page': per_page
    }), 200

@bp.route('/assignments/<int:assignment_id>', methods=['GET'])
@login_required
def get_assignment(assignment_id):
    """Get a specific assignment"""
    assignment = Assignment.query.get_or_404(assignment_id)
    return jsonify({'assignment': assignment.to_dict()}), 200

@bp.route('/assignments', methods=['POST'])
@login_required
def create_assignment():
    """Create a new assignment"""
    data = request.get_json()

    required_fields = ['student_id', 'exam_id', 'room_id']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400

    # Validate that student, exam, and room exist
    student = Student.query.get(data['student_id'])
    if not student:
        return jsonify({'error': 'Student not found'}), 404

    exam = Exam.query.get(data['exam_id'])
    if not exam:
        return jsonify({'error': 'Exam not found'}), 404

    room = Room.query.get(data['room_id'])
    if not room:
        return jsonify({'error': 'Room not found'}), 404

    # Check if student already has an assignment for this exam
    existing_assignment = Assignment.query.filter_by(
        student_id=data['student_id'],
        exam_id=data['exam_id']
    ).first()
    if existing_assignment:
        return jsonify({'error': 'Student already has an assignment for this exam'}), 400

    # Check room capacity
    room_assignments_count = Assignment.query.filter_by(room_id=data['room_id']).count()
    if room_assignments_count >= room.capacity:
        return jsonify({'error': 'Room is at full capacity'}), 400

    assignment = Assignment(
        student_id=data['student_id'],
        exam_id=data['exam_id'],
        room_id=data['room_id'],
        assigned_date=datetime.now(),
        special_accommodations=data.get('special_accommodations', ''),
        notes=data.get('notes', '')
    )

    db.session.add(assignment)
    db.session.commit()

    return jsonify({'message': 'Assignment created successfully', 'assignment': assignment.to_dict()}), 201

@bp.route('/assignments/<int:assignment_id>', methods=['PUT'])
@login_required
def update_assignment(assignment_id):
    """Update an assignment"""
    assignment = Assignment.query.get_or_404(assignment_id)
    data = request.get_json()

    if 'student_id' in data:
        # Check if student already has an assignment for this exam
        existing_assignment = Assignment.query.filter_by(
            student_id=data['student_id'],
            exam_id=assignment.exam_id
        ).first()
        if existing_assignment and existing_assignment.id != assignment_id:
            return jsonify({'error': 'Student already has an assignment for this exam'}), 400
        assignment.student_id = data['student_id']

    if 'exam_id' in data:
        assignment.exam_id = data['exam_id']

    if 'room_id' in data:
        # Check room capacity
        room = Room.query.get(data['room_id'])
        if not room:
            return jsonify({'error': 'Room not found'}), 404

        room_assignments_count = Assignment.query.filter_by(room_id=data['room_id']).count()
        if room_assignments_count >= room.capacity:
            return jsonify({'error': 'Room is at full capacity'}), 400

        assignment.room_id = data['room_id']

    if 'special_accommodations' in data:
        assignment.special_accommodations = data['special_accommodations']

    if 'notes' in data:
        assignment.notes = data['notes']

    db.session.commit()

    return jsonify({'message': 'Assignment updated successfully', 'assignment': assignment.to_dict()}), 200

@bp.route('/assignments/<int:assignment_id>', methods=['DELETE'])
@login_required
def delete_assignment(assignment_id):
    """Delete an assignment"""
    assignment = Assignment.query.get_or_404(assignment_id)
    db.session.delete(assignment)
    db.session.commit()

    return jsonify({'message': 'Assignment deleted successfully'}), 200

@bp.route('/assignments/bulk', methods=['POST'])
@login_required
def bulk_create_assignments():
    """Create multiple assignments at once"""
    data = request.get_json()

    if not data.get('assignments') or not isinstance(data['assignments'], list):
        return jsonify({'error': 'assignments list is required'}), 400

    created_assignments = []
    errors = []

    for i, assignment_data in enumerate(data['assignments']):
        try:
            # Validate required fields
            required_fields = ['student_id', 'exam_id', 'room_id']
            for field in required_fields:
                if not assignment_data.get(field):
                    errors.append(f'Assignment {i+1}: {field} is required')
                    continue

            # Validate entities exist
            student = Student.query.get(assignment_data['student_id'])
            if not student:
                errors.append(f'Assignment {i+1}: Student not found')
                continue

            exam = Exam.query.get(assignment_data['exam_id'])
            if not exam:
                errors.append(f'Assignment {i+1}: Exam not found')
                continue

            room = Room.query.get(assignment_data['room_id'])
            if not room:
                errors.append(f'Assignment {i+1}: Room not found')
                continue

            # Check if student already has an assignment for this exam
            existing_assignment = Assignment.query.filter_by(
                student_id=assignment_data['student_id'],
                exam_id=assignment_data['exam_id']
            ).first()
            if existing_assignment:
                errors.append(f'Assignment {i+1}: Student already has an assignment for this exam')
                continue

            # Check room capacity
            room_assignments_count = Assignment.query.filter_by(room_id=assignment_data['room_id']).count()
            if room_assignments_count >= room.capacity:
                errors.append(f'Assignment {i+1}: Room is at full capacity')
                continue

            assignment = Assignment(
                student_id=assignment_data['student_id'],
                exam_id=assignment_data['exam_id'],
                room_id=assignment_data['room_id'],
                assigned_date=datetime.now(),
                special_accommodations=assignment_data.get('special_accommodations', ''),
                notes=assignment_data.get('notes', '')
            )

            db.session.add(assignment)
            created_assignments.append(assignment)

        except Exception as e:
            errors.append(f'Assignment {i+1}: {str(e)}')

    if created_assignments:
        db.session.commit()

    return jsonify({
        'message': f'Created {len(created_assignments)} assignments successfully',
        'assignments': [assignment.to_dict() for assignment in created_assignments],
        'errors': errors
    }), 200 if created_assignments else 400

@bp.route('/assign-students', methods=['POST'])
@login_required
def assign_students():
    """Automatically assign students to exam rooms"""
    try:
        # Get all student users (role_id=2)
        from ..models.user import User
        students = User.query.filter_by(role_id=2, is_active=True).all()

        if not students:
            return jsonify({'error': 'No active students found'}), 400

        # Get all available rooms
        rooms = Room.query.filter_by(is_active=True, is_bookable=True).all()

        if not rooms:
            return jsonify({'error': 'No available rooms found'}), 400

        # Get existing assignments to avoid duplicates
        existing_assignments = {assignment.user_id: assignment for assignment in
                              Assignment.query.filter(Assignment.user_id.in_([s.id for s in students])).all()}

        # Simple assignment algorithm: assign students to rooms in round-robin fashion
        assignments_created = 0
        student_index = 0
        total_students = len(students)

        for room in rooms:
            room_capacity = room.capacity
            assignments_in_room = Assignment.query.filter_by(room_id=room.id).count()
            available_slots = max(0, room_capacity - assignments_in_room)

            for _ in range(available_slots):
                if student_index >= total_students:
                    break

                student = students[student_index]
                student_index += 1

                # Skip if student already has an assignment
                if student.id in existing_assignments:
                    continue

                # Create assignment
                assignment = Assignment(
                    user_id=student.id,
                    room_id=room.id,
                    # For now, leave exam_id and course as None - can be enhanced later
                    exam_id=None,
                    course='General Assignment',
                )

                db.session.add(assignment)
                assignments_created += 1

        if assignments_created > 0:
            db.session.commit()
            return jsonify({
                'message': f'Successfully assigned {assignments_created} students to exam rooms',
                'assignments_created': assignments_created
            }), 200
        else:
            return jsonify({'message': 'All students are already assigned or no capacity available'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Assignment failed: {str(e)}'}), 500

@bp.route('/assignments/create-exam-data', methods=['POST'])
@login_required
def create_exam_data():
    """Create mock exam data for existing courses with dates"""
    try:
        from ..models.course import Course

        # Get all courses
        courses = Course.query.filter_by(is_active=True).all()

        if not courses:
            return jsonify({'error': 'No courses found'}), 400

        # Create exams for each course with mock dates
        created_exams = 0
        base_date = datetime.now().date() + timedelta(days=30)  # Start 30 days from now

        for course in courses:
            # Create 1-3 exams per course with different dates
            num_exams = 1  # Simple case: one exam per course
            for i in range(num_exams):
                exam_date = base_date + timedelta(days=i * 7)  # Weekly spacing

                # Add some variety to times
                morning_times = [time(9, 0), time(10, 30), time(14, 0), time(15, 30)]
                end_times = [time(11, 0), time(12, 30), time(16, 0), time(17, 30)]

                start_time = morning_times[i % len(morning_times)]
                end_time = end_times[i % len(end_times)]

                exam = Exam(
                    course_name=course.course_name,
                    course_code=course.course_code,
                    exam_date=exam_date,
                    start_time=start_time,
                    end_time=end_time,
                    created_by=1  # Admin user
                )

                db.session.add(exam)
                created_exams += 1

        if created_exams > 0:
            db.session.commit()

            return jsonify({
                'message': f'Created {created_exams} exams for {len(courses)} courses',
                'exams_created': created_exams,
                'courses_with_exams': len(courses)
            }), 200
        else:
            return jsonify({'message': 'No exams needed to be created'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to create exam data: {str(e)}'}), 500
