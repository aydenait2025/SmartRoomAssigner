from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from ..models.building import Building
from ..models.room import Room
from ..models.room_reservation import RoomReservation
from ..models.user import User
from ..extensions import db

bp = Blueprint('rooms', __name__)

@bp.route('/rooms', methods=['GET'])
@login_required
def get_rooms():
    """Get rooms with pagination and stats"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    building_id = request.args.get('building_id', type=int)
    room_type = request.args.get('type', '')
    status_filter = request.args.get('status', 'all')  # 'all', 'active', 'inactive'
    department_id = request.args.get('department_id', type=int)

    rooms_query = Room.query

    if building_id:
        rooms_query = rooms_query.filter_by(building_id=building_id)

    if room_type:
        rooms_query = rooms_query.filter_by(room_type=room_type)

    if department_id:
        # Find rooms with active reservations for this department
        # Get all users in this department and their approved reservations
        department_users_ids = db.session.query(User.id).filter(User.department_id == department_id).subquery()
        reserved_room_ids = db.session.query(RoomReservation.room_id).filter(
            RoomReservation.requested_by.in_(department_users_ids),
            RoomReservation.reservation_status == 'approved'
        ).distinct().subquery()

        rooms_query = rooms_query.filter(Room.id.in_(reserved_room_ids))

    # Apply status filter
    if status_filter == 'active':
        # Active: both is_active and is_bookable are True (or null, which we treat as True)
        rooms_query = rooms_query.filter(
            db.or_(Room.is_active.is_(None), Room.is_active == True),
            db.or_(Room.is_bookable.is_(None), Room.is_bookable == True)
        )
    elif status_filter == 'inactive':
        # Inactive: either is_active is False OR is_bookable is False
        rooms_query = rooms_query.filter(
            db.or_(Room.is_active == False, Room.is_bookable == False)
        )

    # Get paginated results
    paginated_rooms = rooms_query.paginate(page=page, per_page=per_page, error_out=False)
    rooms = paginated_rooms.items

    # Calculate total active rooms (across all records, not just this page)
    # Treat NULL values as True (since default is True)
    total_active = Room.query.filter(
        db.or_(Room.is_active.is_(None), Room.is_active == True),
        db.or_(Room.is_bookable.is_(None), Room.is_bookable == True)
    ).count()

    return jsonify({
        'rooms': [room.to_dict() for room in rooms],
        'current_page': paginated_rooms.page,
        'total_pages': paginated_rooms.pages,
        'total_items': paginated_rooms.total,
        'total_active': total_active
    }), 200

@bp.route('/rooms/<int:room_id>', methods=['GET'])
@login_required
def get_room(room_id):
    """Get a specific room"""
    room = Room.query.get_or_404(room_id)
    return jsonify({'room': room.to_dict()}), 200

@bp.route('/buildings/<int:building_id>/rooms', methods=['GET'])
@login_required
def get_building_rooms(building_id):
    """Get all rooms in a specific building"""
    building = Building.query.get_or_404(building_id)
    rooms = Room.query.filter_by(building_id=building_id).all()
    return jsonify({'rooms': [room.to_dict() for room in rooms]}), 200

@bp.route('/rooms', methods=['POST'])
@login_required
def create_room():
    """Create a new room"""
    data = request.get_json()

    required_fields = ['room_number', 'building_id', 'capacity', 'room_type']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400

    # Check if room already exists in this building
    existing_room = Room.query.filter_by(
        room_number=data['room_number'],
        building_id=data['building_id']
    ).first()
    if existing_room:
        return jsonify({'error': 'Room number already exists in this building'}), 400

    room = Room(
        room_number=data['room_number'],
        building_id=data['building_id'],
        capacity=data['capacity'],
        room_type=data['room_type'],
        floor=data.get('floor'),
        features=data.get('features', ''),
        accessibility_features=data.get('accessibility_features', ''),
        equipment=data.get('equipment', ''),
        notes=data.get('notes', '')
    )

    db.session.add(room)
    db.session.commit()

    return jsonify({'message': 'Room created successfully', 'room': room.to_dict()}), 201

@bp.route('/rooms/<int:room_id>', methods=['PUT'])
@login_required
def update_room(room_id):
    """Update a room"""
    room = Room.query.get_or_404(room_id)
    data = request.get_json()

    if 'room_number' in data:
        existing_room = Room.query.filter_by(
            room_number=data['room_number'],
            building_id=room.building_id
        ).first()
        if existing_room and existing_room.id != room_id:
            return jsonify({'error': 'Room number already exists in this building'}), 400
        room.room_number = data['room_number']

    if 'building_id' in data:
        room.building_id = data['building_id']

    if 'capacity' in data:
        room.capacity = data['capacity']

    if 'room_type' in data:
        room.room_type = data['room_type']

    if 'floor' in data:
        room.floor = data['floor']

    if 'features' in data:
        room.features = data['features']

    if 'accessibility_features' in data:
        room.accessibility_features = data['accessibility_features']

    if 'equipment' in data:
        room.equipment = data['equipment']

    if 'notes' in data:
        room.notes = data['notes']

    db.session.commit()

    return jsonify({'message': 'Room updated successfully', 'room': room.to_dict()}), 200

@bp.route('/rooms/<int:room_id>', methods=['DELETE'])
@login_required
def delete_room(room_id):
    """Delete a room"""
    room = Room.query.get_or_404(room_id)
    db.session.delete(room)
    db.session.commit()

    return jsonify({'message': 'Room deleted successfully'}), 200

@bp.route('/rooms/search', methods=['GET'])
@login_required
def search_rooms():
    """Search rooms by various criteria"""
    query = request.args.get('q', '')
    min_capacity = request.args.get('min_capacity', type=int)
    max_capacity = request.args.get('max_capacity', type=int)
    room_type = request.args.get('type', '')
    building_id = request.args.get('building_id', type=int)

    rooms_query = Room.query

    if query:
        rooms_query = rooms_query.filter(
            (Room.room_number.ilike(f'%{query}%')) |
            (Room.features.ilike(f'%{query}%')) |
            (Room.equipment.ilike(f'%{query}%'))
        )

    if min_capacity:
        rooms_query = rooms_query.filter(Room.capacity >= min_capacity)

    if max_capacity:
        rooms_query = rooms_query.filter(Room.capacity <= max_capacity)

    if room_type:
        rooms_query = rooms_query.filter_by(room_type=room_type)

    if building_id:
        rooms_query = rooms_query.filter_by(building_id=building_id)

    rooms = rooms_query.all()
    return jsonify({'rooms': [room.to_dict() for room in rooms]}), 200

# ============= ROOM RESERVATION MANAGEMENT ============

@bp.route('/room-reservations', methods=['GET'])
@login_required
def get_room_reservations():
    """Get room reservations with filtering options"""
    room_id = request.args.get('room_id', type=int)
    department_id = request.args.get('department_id', type=int)
    status = request.args.get('status', 'approved')  # Default to approved only

    reservations_query = RoomReservation.query

    if room_id:
        reservations_query = reservations_query.filter_by(room_id=room_id)

    if department_id:
        # Get reservations from users in this department
        department_users_ids = db.session.query(User.id).filter(User.department_id == department_id).subquery()
        reservations_query = reservations_query.filter(RoomReservation.requested_by.in_(department_users_ids))

    if status != 'all':
        reservations_query = reservations_query.filter_by(reservation_status=status)

    # Order by creation date (newest first)
    reservations_query = reservations_query.order_by(RoomReservation.created_at.desc())

    reservations = reservations_query.all()
    return jsonify({'reservations': [r.to_dict() for r in reservations]}), 200

@bp.route('/rooms/counts', methods=['GET'])
@login_required
def get_room_counts():
    """Get room counts for tab headers"""
    department_id = request.args.get('department_id', type=int)
    user = current_user

    # Total university rooms (all active rooms)
    total_university = Room.query.filter(
        db.or_(Room.is_active.is_(None), Room.is_active == True),
        db.or_(Room.is_bookable.is_(None), Room.is_bookable == True)
    ).count()

    # Departmental rooms (if user has department)
    departmental_count = 0
    if user and hasattr(user, 'department_id') and user.department_id:
        # Find rooms with active reservations for this department
        department_users_ids = db.session.query(User.id).filter(User.department_id == user.department_id).subquery()
        reserved_room_ids = db.session.query(RoomReservation.room_id).filter(
            RoomReservation.requested_by.in_(department_users_ids),
            RoomReservation.reservation_status == 'approved'
        ).distinct().subquery()

        departmental_count = Room.query.filter(
            Room.id.in_(reserved_room_ids),
            db.or_(Room.is_active.is_(None), Room.is_active == True),
            db.or_(Room.is_bookable.is_(None), Room.is_bookable == True)
        ).count()

    return jsonify({
        'total_university': total_university,
        'departmental': departmental_count
    }), 200

@bp.route('/room-reservations', methods=['POST'])
@login_required
def create_room_reservation():
    """Create a new room reservation (for department assignment)"""
    data = request.get_json()

    required_fields = ['room_id', 'event_title']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400

    # Set defaults for department reservations
    if not data.get('event_type'):
        data['event_type'] = 'department_reservation'

    # Auto-approve department reservations for now
    if not data.get('reservation_status'):
        data['reservation_status'] = 'approved'

    if not data.get('approved_at'):
        data['approved_at'] = db.func.now()

    if not data.get('approved_by'):
        data['approved_by'] = current_user.id

    # Check for conflicting reservations (simplified - same room, overlapping time)
    if data.get('reservation_date') and data.get('start_time') and data.get('end_time'):
        conflicting = RoomReservation.query.filter(
            RoomReservation.room_id == data['room_id'],
            RoomReservation.reservation_date == data['reservation_date'],
            RoomReservation.reservation_status == 'approved',
            db.or_(
                db.and_(
                    RoomReservation.start_time <= data['end_time'],
                    RoomReservation.end_time >= data['start_time']
                )
            )
        ).first()

        if conflicting:
            return jsonify({'error': 'Room is already reserved during this time period'}), 409

    reservation = RoomReservation(
        room_id=data['room_id'],
        requested_by=current_user.id,
        event_title=data['event_title'],
        event_description=data.get('event_description', ''),
        event_type=data.get('event_type', 'department_reservation'),
        expected_attendees=data.get('expected_attendees', 1),
        reservation_date=data.get('reservation_date'),
        start_time=data.get('start_time'),
        end_time=data.get('end_time'),
        reservation_status=data.get('reservation_status', 'approved'),
        approved_by=data.get('approved_by', current_user.id),
        approved_at=data.get('approved_at'),
        approval_notes=data.get('approval_notes', 'Auto-approved department reservation')
    )

    db.session.add(reservation)
    db.session.commit()

    return jsonify({'message': 'Room reservation created successfully', 'reservation': reservation.to_dict()}), 201

@bp.route('/room-reservations/<int:reservation_id>', methods=['DELETE'])
@login_required
def delete_room_reservation(reservation_id):
    """Delete a room reservation"""
    reservation = RoomReservation.query.get_or_404(reservation_id)

    # Only allow users to delete their own reservations (or admins)
    if reservation.requested_by != current_user.id and current_user.role.name != 'admin':
        return jsonify({'error': 'Permission denied'}), 403

    db.session.delete(reservation)
    db.session.commit()

    return jsonify({'message': 'Room reservation deleted successfully'}), 200

# Endpoint for department room management
@bp.route('/departments/<int:department_id>/assign-room', methods=['POST'])
@login_required
def assign_room_to_department(department_id):
    """Simplified endpoint to assign a room to a department via reservation"""
    data = request.get_json()

    if not data.get('room_id'):
        return jsonify({'error': 'room_id is required'}), 400

    # Create a long-term reservation for department use
    reservation = RoomReservation(
        room_id=data['room_id'],
        requested_by=current_user.id,
        event_title=f'Department Assignment - Room {data.get("room_number", "Unknown")}',
        event_description=f'Assigned to department for academic use',
        event_type='department_reservation',
        expected_attendees=50,  # Default capacity
        reservation_date=db.func.current_date(),
        start_time='08:00',  # All day
        end_time='22:00',
        reservation_status='approved',
        approved_by=current_user.id,
        approved_at=db.func.now(),
        approval_notes='Department room assignment'
    )

    db.session.add(reservation)
    db.session.commit()

    return jsonify({'message': 'Room assigned to department successfully', 'reservation': reservation.to_dict()}), 201
