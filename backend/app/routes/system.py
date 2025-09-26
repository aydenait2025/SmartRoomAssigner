from flask import Blueprint, request, jsonify, current_app
from flask_login import login_required, current_user
from ..models.student import Student
from ..models.building import Building
from ..models.room import Room
from ..models.exam import Exam
from ..models.assignment import Assignment
from ..models.user import User
from ..extensions import db
import os
from datetime import datetime

bp = Blueprint('system', __name__)

@bp.route('/system/stats', methods=['GET'])
@login_required
def get_system_stats():
    """Get system statistics"""
    stats = {
        'students': Student.query.count(),
        'buildings': Building.query.count(),
        'rooms': Room.query.count(),
        'exams': Exam.query.count(),
        'assignments': Assignment.query.count(),
        'users': User.query.count()
    }

    # Room utilization
    total_capacity = db.session.query(db.func.sum(Room.capacity)).scalar() or 0
    assigned_seats = Assignment.query.count()
    stats['room_utilization'] = {
        'total_capacity': total_capacity,
        'assigned_seats': assigned_seats,
        'utilization_rate': (assigned_seats / total_capacity * 100) if total_capacity > 0 else 0
    }

    # Students by year
    year_stats = db.session.query(
        Student.year,
        db.func.count(Student.id)
    ).filter(Student.year.isnot(None)).group_by(Student.year).all()
    stats['students_by_year'] = {year: count for year, count in year_stats}

    # Rooms by type
    type_stats = db.session.query(
        Room.room_type,
        db.func.count(Room.id)
    ).filter(Room.room_type.isnot(None)).group_by(Room.room_type).all()
    stats['rooms_by_type'] = {room_type: count for room_type, count in type_stats}

    return jsonify({'stats': stats}), 200

@bp.route('/system/health', methods=['GET'])
def get_system_health():
    """Get system health status"""
    health = {
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'database': 'connected',
        'version': '1.0.0'
    }

    try:
        # Test database connection
        db.session.execute(db.text('SELECT 1'))
        health['database_status'] = 'connected'
    except Exception as e:
        health['database_status'] = 'error'
        health['database_error'] = str(e)
        health['status'] = 'unhealthy'

    # Check required environment variables
    required_env_vars = [
        'SECRET_KEY',
        'SQLALCHEMY_DATABASE_URI',
        'GOOGLE_CLIENT_ID',
        'GOOGLE_CLIENT_SECRET',
        'MICROSOFT_CLIENT_ID',
        'MICROSOFT_CLIENT_SECRET'
    ]

    missing_env_vars = []
    for var in required_env_vars:
        if not os.getenv(var):
            missing_env_vars.append(var)

    if missing_env_vars:
        health['missing_env_vars'] = missing_env_vars
        health['status'] = 'configuration_error'

    return jsonify(health), 200 if health['status'] == 'healthy' else 500

@bp.route('/system/backup', methods=['POST'])
@login_required
def create_backup():
    """Create a system backup"""
    try:
        # This is a placeholder for backup functionality
        # In a real implementation, you would:
        # 1. Export all data to JSON/CSV files
        # 2. Create database dumps
        # 3. Store in a backup location

        backup_info = {
            'timestamp': datetime.now().isoformat(),
            'backup_type': 'manual',
            'status': 'completed',
            'message': 'Backup functionality not yet implemented'
        }

        return jsonify(backup_info), 200

    except Exception as e:
        return jsonify({'error': f'Backup failed: {str(e)}'}), 500

@bp.route('/system/logs', methods=['GET'])
@login_required
def get_system_logs():
    """Get system logs (placeholder)"""
    # This is a placeholder for log retrieval functionality
    logs = {
        'logs': [],
        'message': 'Log functionality not yet implemented'
    }

    return jsonify(logs), 200

@bp.route('/system/settings', methods=['GET'])
@login_required
def get_system_settings():
    """Get system settings"""
    settings = {
        'max_upload_size': current_app.config.get('MAX_CONTENT_LENGTH', '16MB'),
        'upload_folder': current_app.config.get('UPLOAD_FOLDER', 'uploads'),
        'allowed_extensions': ['csv', 'xlsx', 'xls'],
        'session_timeout': current_app.config.get('PERMANENT_SESSION_LIFETIME', '1 day'),
        'maintenance_mode': False
    }

    return jsonify({'settings': settings}), 200

@bp.route('/system/settings', methods=['PUT'])
@login_required
def update_system_settings():
    """Update system settings"""
    data = request.get_json()

    # This is a placeholder for settings update functionality
    # In a real implementation, you would validate and save settings

    return jsonify({'message': 'Settings update functionality not yet implemented'}), 200

@bp.route('/system/cache/clear', methods=['POST'])
@login_required
def clear_cache():
    """Clear system cache"""
    try:
        # This is a placeholder for cache clearing functionality
        # In a real implementation, you would clear Redis cache, file cache, etc.

        return jsonify({'message': 'Cache cleared successfully'}), 200

    except Exception as e:
        return jsonify({'error': f'Cache clear failed: {str(e)}'}), 500

@bp.route('/system/export/students', methods=['GET'])
@login_required
def export_students():
    """Export all students data"""
    try:
        students = Student.query.all()
        students_data = [student.to_dict() for student in students]

        return jsonify({
            'export_type': 'students',
            'timestamp': datetime.now().isoformat(),
            'count': len(students_data),
            'data': students_data
        }), 200

    except Exception as e:
        return jsonify({'error': f'Export failed: {str(e)}'}), 500

@bp.route('/system/export/assignments', methods=['GET'])
@login_required
def export_assignments():
    """Export all assignments data"""
    try:
        assignments = Assignment.query.all()
        assignments_data = [assignment.to_dict() for assignment in assignments]

        return jsonify({
            'export_type': 'assignments',
            'timestamp': datetime.now().isoformat(),
            'count': len(assignments_data),
            'data': assignments_data
        }), 200

    except Exception as e:
        return jsonify({'error': f'Export failed: {str(e)}'}), 500

@bp.route('/system/maintenance', methods=['POST'])
@login_required
def toggle_maintenance_mode():
    """Toggle maintenance mode"""
    # This is a placeholder for maintenance mode functionality
    return jsonify({'message': 'Maintenance mode functionality not yet implemented'}), 200
