from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from ..models.assignment_algorithm import AssignmentAlgorithm
from ..extensions import db

bp = Blueprint('algorithms', __name__)

@bp.route('/algorithms', methods=['GET'])
@login_required
def get_algorithms():
    """Get all assignment algorithms"""
    if not hasattr(current_user, 'role') or current_user.role.name != 'Administrator':
        return jsonify({"error": "Unauthorized"}), 403

    try:
        algorithms = AssignmentAlgorithm.query.order_by(AssignmentAlgorithm.created_at.desc()).all()
        return jsonify({
            "algorithms": [algorithm.to_dict() for algorithm in algorithms]
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/algorithms', methods=['POST'])
@login_required
def create_algorithm():
    """Create new assignment algorithm"""
    if not hasattr(current_user, 'role') or current_user.role.name != 'Administrator':
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    try:
        # Validate required fields
        if not data.get('name'):
            return jsonify({"error": "Algorithm name is required"}), 400
        if not data.get('description'):
            return jsonify({"error": "Algorithm description is required"}), 400
        if not data.get('algorithm_logic'):
            return jsonify({"error": "Algorithm logic is required"}), 400

        # Check if name already exists
        existing = AssignmentAlgorithm.query.filter_by(name=data['name']).first()
        if existing:
            return jsonify({"error": "An algorithm with this name already exists"}), 409

        algorithm = AssignmentAlgorithm(
            name=data['name'],
            description=data['description'],
            version=data.get('version', '1.0'),
            algorithm_logic=data['algorithm_logic'],
            is_active=data.get('is_active', True),
            created_by=current_user.id
        )

        db.session.add(algorithm)
        db.session.commit()

        return jsonify({
            "message": "Algorithm created successfully",
            "algorithm": algorithm.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@bp.route('/algorithms/<int:algorithm_id>', methods=['PUT'])
@login_required
def update_algorithm(algorithm_id):
    """Update assignment algorithm"""
    if not hasattr(current_user, 'role') or current_user.role.name != 'Administrator':
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    try:
        algorithm = AssignmentAlgorithm.query.get_or_404(algorithm_id)

        # Check if name change conflicts with existing algorithms
        if data.get('name') and data['name'] != algorithm.name:
            existing = AssignmentAlgorithm.query.filter_by(name=data['name']).first()
            if existing:
                return jsonify({"error": "An algorithm with this name already exists"}), 409

        # Update fields
        algorithm.name = data.get('name', algorithm.name)
        algorithm.description = data.get('description', algorithm.description)
        algorithm.version = data.get('version', algorithm.version)
        algorithm.algorithm_logic = data.get('algorithm_logic', algorithm.algorithm_logic)
        algorithm.is_active = data.get('is_active', algorithm.is_active)

        db.session.commit()

        return jsonify({
            "message": "Algorithm updated successfully",
            "algorithm": algorithm.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@bp.route('/algorithms/<int:algorithm_id>', methods=['DELETE'])
@login_required
def delete_algorithm(algorithm_id):
    """Delete assignment algorithm"""
    if not hasattr(current_user, 'role') or current_user.role.name != 'Administrator':
        return jsonify({"error": "Unauthorized"}), 403

    try:
        algorithm = AssignmentAlgorithm.query.get_or_404(algorithm_id)

        # Prevent deletion of default algorithm
        if algorithm.name == 'Smart Alphabetical Grouping':
            return jsonify({"error": "Cannot delete the default algorithm"}), 409

        db.session.delete(algorithm)
        db.session.commit()

        return jsonify({"message": "Algorithm deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@bp.route('/algorithms/seed-default', methods=['POST'])
@login_required
def seed_default_algorithms():
    """Seed default algorithms into database"""
    if not hasattr(current_user, 'role') or current_user.role.name != 'Administrator':
        return jsonify({"error": "Unauthorized"}), 403

    try:
        success = AssignmentAlgorithm.seed_default_algorithms()
        if success:
            algorithms = AssignmentAlgorithm.query.all()
            return jsonify({
                "message": "Default algorithms seeded successfully",
                "algorithms": [algo.to_dict() for algo in algorithms]
            }), 200
        else:
            return jsonify({"error": "Failed to seed default algorithms"}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/algorithms/activate/<int:algorithm_id>', methods=['PUT'])
@login_required
def activate_algorithm(algorithm_id):
    """Activate a specific algorithm as default"""
    if not hasattr(current_user, 'role') or current_user.role.name != 'Administrator':
        return jsonify({"error": "Unauthorized"}), 403

    try:
        # Deactivate all algorithms
        AssignmentAlgorithm.query.update({"is_active": False})

        # Activate the selected algorithm
        algorithm = AssignmentAlgorithm.query.get_or_404(algorithm_id)
        algorithm.is_active = True

        db.session.commit()

        return jsonify({
            "message": f"Algorithm '{algorithm.name}' activated as default",
            "algorithm": algorithm.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@bp.route('/algorithms/default', methods=['GET'])
@login_required
def get_default_algorithm():
    """Get the currently active (default) algorithm"""
    if not hasattr(current_user, 'role') or current_user.role.name != 'Administrator':
        return jsonify({"error": "Unauthorized"}), 403

    try:
        default_algo = AssignmentAlgorithm.get_default_algorithm()
        if default_algo:
            return jsonify({
                "algorithm": default_algo.to_dict()
            }), 200
        else:
            return jsonify({
                "error": "No default algorithm found. Please seed default algorithms."
            }), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500
