from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from ..models.user import User
from ..extensions import db

bp = Blueprint('users', __name__)

@bp.route('/users', methods=['GET'])
@login_required
def get_users():
    """Get all users"""
    users = User.query.all()
    return jsonify({'users': [user.to_dict() for user in users]}), 200

@bp.route('/users/<int:user_id>', methods=['GET'])
@login_required
def get_user(user_id):
    """Get a specific user"""
    user = User.query.get_or_404(user_id)
    return jsonify({'user': user.to_dict()}), 200

@bp.route('/users', methods=['POST'])
@login_required
def create_user():
    """Create a new user"""
    data = request.get_json()

    if not data.get('username') or not data.get('email'):
        return jsonify({'error': 'Username and email required'}), 400

    # Check if user already exists
    existing_user = User.query.filter_by(username=data['username']).first()
    if existing_user:
        return jsonify({'error': 'Username already exists'}), 400

    existing_email = User.query.filter_by(email=data['email']).first()
    if existing_email:
        return jsonify({'error': 'Email already exists'}), 400

    user = User(
        username=data['username'],
        email=data['email'],
        name=data.get('name', ''),
        role=data.get('role', 'user')
    )

    if data.get('password'):
        user.set_password(data['password'])

    db.session.add(user)
    db.session.commit()

    return jsonify({'message': 'User created successfully', 'user': user.to_dict()}), 201

@bp.route('/users/<int:user_id>', methods=['PUT'])
@login_required
def update_user(user_id):
    """Update a user"""
    user = User.query.get_or_404(user_id)
    data = request.get_json()

    if 'username' in data:
        existing_user = User.query.filter_by(username=data['username']).first()
        if existing_user and existing_user.id != user_id:
            return jsonify({'error': 'Username already exists'}), 400
        user.username = data['username']

    if 'email' in data:
        existing_email = User.query.filter_by(email=data['email']).first()
        if existing_email and existing_email.id != user_id:
            return jsonify({'error': 'Email already exists'}), 400
        user.email = data['email']

    if 'name' in data:
        user.name = data['name']

    if 'role' in data:
        user.role = data['role']

    if 'password' in data:
        user.set_password(data['password'])

    db.session.commit()

    return jsonify({'message': 'User updated successfully', 'user': user.to_dict()}), 200

@bp.route('/users/<int:user_id>', methods=['DELETE'])
@login_required
def delete_user(user_id):
    """Delete a user"""
    user = User.query.get_or_404(user_id)

    # Prevent deleting self
    if user.id == current_user.id:
        return jsonify({'error': 'Cannot delete your own account'}), 400

    db.session.delete(user)
    db.session.commit()

    return jsonify({'message': 'User deleted successfully'}), 200
