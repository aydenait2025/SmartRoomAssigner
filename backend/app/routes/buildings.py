from flask import Blueprint, request, jsonify
from flask_login import login_required
from ..models.building import Building
from ..extensions import db

bp = Blueprint('buildings', __name__)

@bp.route('/buildings', methods=['GET'])
@login_required
def get_buildings():
    """Get all buildings"""
    buildings = Building.query.all()
    return jsonify({'buildings': [building.to_dict() for building in buildings]}), 200

@bp.route('/buildings/<int:building_id>', methods=['GET'])
@login_required
def get_building(building_id):
    """Get a specific building"""
    building = Building.query.get_or_404(building_id)
    return jsonify({'building': building.to_dict()}), 200

@bp.route('/buildings', methods=['POST'])
@login_required
def create_building():
    """Create a new building"""
    data = request.get_json()

    required_fields = ['name', 'code', 'address']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400

    # Check if building code already exists
    existing_building = Building.query.filter_by(code=data['code']).first()
    if existing_building:
        return jsonify({'error': 'Building code already exists'}), 400

    building = Building(
        name=data['name'],
        code=data['code'],
        address=data['address'],
        description=data.get('description', ''),
        total_floors=data.get('total_floors'),
        total_rooms=data.get('total_rooms'),
        coordinates_lat=data.get('coordinates_lat'),
        coordinates_lng=data.get('coordinates_lng'),
        campus=data.get('campus', ''),
        accessibility_info=data.get('accessibility_info', '')
    )

    db.session.add(building)
    db.session.commit()

    return jsonify({'message': 'Building created successfully', 'building': building.to_dict()}), 201

@bp.route('/buildings/<int:building_id>', methods=['PUT'])
@login_required
def update_building(building_id):
    """Update a building"""
    building = Building.query.get_or_404(building_id)
    data = request.get_json()

    if 'name' in data:
        building.name = data['name']

    if 'code' in data:
        existing_building = Building.query.filter_by(code=data['code']).first()
        if existing_building and existing_building.id != building_id:
            return jsonify({'error': 'Building code already exists'}), 400
        building.code = data['code']

    if 'address' in data:
        building.address = data['address']

    if 'description' in data:
        building.description = data['description']

    if 'total_floors' in data:
        building.total_floors = data['total_floors']

    if 'total_rooms' in data:
        building.total_rooms = data['total_rooms']

    if 'coordinates_lat' in data:
        building.coordinates_lat = data['coordinates_lat']

    if 'coordinates_lng' in data:
        building.coordinates_lng = data['coordinates_lng']

    if 'campus' in data:
        building.campus = data['campus']

    if 'accessibility_info' in data:
        building.accessibility_info = data['accessibility_info']

    db.session.commit()

    return jsonify({'message': 'Building updated successfully', 'building': building.to_dict()}), 200

@bp.route('/buildings/<int:building_id>', methods=['DELETE'])
@login_required
def delete_building(building_id):
    """Delete a building"""
    building = Building.query.get_or_404(building_id)

    # Check if building has rooms
    if building.rooms:
        return jsonify({'error': 'Cannot delete building with existing rooms'}), 400

    db.session.delete(building)
    db.session.commit()

    return jsonify({'message': 'Building deleted successfully'}), 200

@bp.route('/buildings/search', methods=['GET'])
@login_required
def search_buildings():
    """Search buildings by various criteria"""
    query = request.args.get('q', '')
    campus = request.args.get('campus', '')

    buildings_query = Building.query

    if query:
        buildings_query = buildings_query.filter(
            (Building.name.ilike(f'%{query}%')) |
            (Building.code.ilike(f'%{query}%')) |
            (Building.address.ilike(f'%{query}%')) |
            (Building.description.ilike(f'%{query}%'))
        )

    if campus:
        buildings_query = buildings_query.filter(Building.campus.ilike(f'%{campus}%'))

    buildings = buildings_query.all()
    return jsonify({'buildings': [building.to_dict() for building in buildings]}), 200
