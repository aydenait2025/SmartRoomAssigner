from flask import Blueprint, request, jsonify
from flask_login import login_required
from datetime import datetime
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
    student_id = request.args.get('student_id', type=int)
    exam_id = request.args.get('exam_id', type=int)
    room_id = request.args.get('room_id', type=int)
    date_from = request.args.get('date_from')
    date_to = request.args.get('date_to')

    assignments_query = Assignment.query

    if student_id:
        assignments_query = assignments_query.filter_by(student_id=student_id)

    if exam_id:
        assignments_query = assignments_query.filter_by(exam_id=exam_id)

    if room_id:
        assignments_query = assignments_query.filter_by(room_id=room_id)

    if date_from:
        assignments_query = assignments_query.filter(Assignment.assigned_date >= datetime.fromisoformat(date_from))

    if date_to:
        assignments_query = assignments_query.filter(Assignment.assigned_date <= datetime.fromisoformat(date_to))

    assignments = assignments_query.all()
    return jsonify({'assignments': [assignment.to_dict() for assignment in assignments]}), 200

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
