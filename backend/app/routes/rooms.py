from flask import Blueprint, request, jsonify
from flask_login import login_required
from ..models.building import Building
from ..models.room import Room
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

    rooms_query = Room.query

    if building_id:
        rooms_query = rooms_query.filter_by(building_id=building_id)

    if room_type:
        rooms_query = rooms_query.filter_by(room_type=room_type)

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
