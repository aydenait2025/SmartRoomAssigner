from flask import Blueprint, request, jsonify
from ..extensions import db
from datetime import datetime, time
import math

bp = Blueprint('schedules', __name__)

# Try to import models inside functions to avoid circular import issues
# from ..models.exam import Exam
# from ..models.user import User
# from ..models.room import Room

@bp.route('/test-schedules', methods=['GET'])
def test_schedules():
    return jsonify({'message': 'schedules blueprint is working!'})

@bp.route('/schedules', methods=['GET'])
def get_schedules():
    """Get paginated list of schedules/exams"""
    try:
        # Import models here to avoid circular imports
        from ..models.exam import Exam
        from ..models.user import User

        # Get query parameters
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        search = request.args.get('search', '')
        type_filter = request.args.get('type', '')
        sort_by = request.args.get('sort_by', 'exam_date')
        sort_order = request.args.get('sort_order', 'desc')

        # Base query - simplified without room assignments for now
        query = db.session.query(Exam).join(User, Exam.created_by == User.id)

        # Apply search filter if provided
        if search:
            query = query.filter(
                (Exam.course_name.ilike(f'%{search}%')) |
                (Exam.course_code.ilike(f'%{search}%'))
            )

        # Apply type filter if provided (map to exam type in future)
        if type_filter:
            # For now, all are exams
            if type_filter != 'exam':
                query = query.filter(db.false())  # No results for non-exam types

        # Apply sorting
        if hasattr(Exam, sort_by):
            sort_column = getattr(Exam, sort_by)
            if sort_order == 'desc':
                query = query.order_by(sort_column.desc())
            else:
                query = query.order_by(sort_column.asc())

        # Get total count
        total_items = query.count()

        # Apply pagination
        schedules_data = query.offset((page - 1) * per_page).limit(per_page).all()

        # Calculate total pages
        total_pages = math.ceil(total_items / per_page)

        # Format schedules
        schedules_list = []
        for exam in schedules_data:
            # Simplified - no room info for now since RoomAssignment is not working
            schedule_dict = {
                'id': exam.id,
                'title': f"{exam.course_code} - {exam.course_name}" if exam.course_code else exam.course_name,
                'type': 'exam',
                'course_code': exam.course_code,
                'course_name': exam.course_name,
                'date': exam.exam_date.isoformat() if exam.exam_date else None,
                'start_time': exam.start_time.isoformat() if exam.start_time else None,
                'end_time': exam.end_time.isoformat() if exam.end_time else None,
                'building_code': '',
                'room_number': '',
                'expected_students': 0,  # Placeholder
                'description': f'Exam scheduled for {exam.course_code}',
                'created_by': exam.created_by
            }
            schedules_list.append(schedule_dict)

        return jsonify({
            'schedules': schedules_list,
            'current_page': page,
            'total_pages': total_pages,
            'total_items': total_items,
            'per_page': per_page
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/schedules', methods=['POST'])
def create_schedule():
    """Create a new schedule/exam"""
    try:
        from ..models.exam import Exam

        data = request.get_json()

        # Create exam
        exam = Exam(
            course_name=data.get('course_name', data.get('title', '')),
            course_code=data.get('course_code', ''),
            exam_date=datetime.fromisoformat(data['date']).date() if data.get('date') else None,
            start_time=datetime.strptime(data['start_time'], '%H:%M').time() if data.get('start_time') else time(9, 0),
            end_time=datetime.strptime(data['end_time'], '%H:%M').time() if data.get('end_time') else time(11, 0),
            created_by=1  # TODO: Get from session/current user
        )

        db.session.add(exam)
        db.session.flush()  # Get the exam ID

        # TODO: Add room assignment creation when RoomAssignment model is available
        db.session.commit()

        return jsonify({
            'message': 'Schedule created successfully',
            'schedule_id': exam.id
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/<int:schedule_id>', methods=['PUT'])
def update_schedule(schedule_id):
    """Update an existing schedule/exam"""
    try:
        from ..models.exam import Exam

        data = request.get_json()

        exam = db.session.query(Exam).get(schedule_id)
        if not exam:
            return jsonify({'error': 'Schedule not found'}), 404

        # Update exam fields
        if 'course_name' in data:
            exam.course_name = data['course_name']
        if 'course_code' in data:
            exam.course_code = data['course_code']
        if 'date' in data:
            exam.exam_date = datetime.fromisoformat(data['date']).date()
        if 'start_time' in data:
            exam.start_time = datetime.strptime(data['start_time'], '%H:%M').time()
        if 'end_time' in data:
            exam.end_time = datetime.strptime(data['end_time'], '%H:%M').time()

        db.session.commit()

        return jsonify({'message': 'Schedule updated successfully'})

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/<int:schedule_id>', methods=['DELETE'])
def delete_schedule(schedule_id):
    """Delete a schedule/exam"""
    try:
        from ..models.exam import Exam

        exam = db.session.query(Exam).get(schedule_id)
        if not exam:
            return jsonify({'error': 'Schedule not found'}), 404

        # TODO: Delete related assignments first when RoomAssignment is available
        # db.session.query(RoomAssignment).filter_by(exam_session_id=schedule_id).delete()

        # Delete exam
        db.session.delete(exam)
        db.session.commit()

        return jsonify({'message': 'Schedule deleted successfully'})

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
