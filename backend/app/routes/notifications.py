from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from ..models.system_notification import SystemNotification
from ..models.user import Role
from ..extensions import db
from sqlalchemy import or_
from datetime import datetime

bp = Blueprint('notifications', __name__)

@bp.route('/notifications/test', methods=['GET'])
@login_required
def test_notifications():
    """Test endpoint to debug notifications"""
    try:
        user_role_id = current_user.role_id
        user_id = current_user.id

        print(f"DEBUG: User {current_user.name} (ID: {user_id}) with role_id {user_role_id}")

        # Get all notifications that should be visible to this user
        from app.extensions import db
        query = SystemNotification.query.filter(
            or_(
                SystemNotification.recipient_user_id == user_id,
                SystemNotification.recipient_role_id == user_role_id
            )
        )

        all_notifications = query.all()
        print(f"DEBUG: Found {len(all_notifications)} notifications for user")

        for n in all_notifications:
            print(f"  - Notification {n.id}: '{n.notification_title}' for role_id {n.recipient_role_id}, user_id {n.recipient_user_id}")

        return jsonify({
            'debug': {
                'current_user_id': user_id,
                'current_user_role': user_role_id,
                'total_notifications': len(all_notifications),
                'notifications': [n.to_dict() for n in all_notifications]
            }
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/notifications', methods=['GET'])
@login_required
def get_notifications():
    """Get all notifications for the current user"""
    try:
        # Get user's role ID for role-based notifications
        user_role_id = current_user.role_id

        # Query notifications addressed to:
        # 1. The specific user
        # 2. The user's role
        # Excludes notifications that have expired
        notifications = SystemNotification.query.filter(
            or_(
                SystemNotification.recipient_user_id == current_user.id,
                SystemNotification.recipient_role_id == user_role_id
            )
        ).filter(
            or_(
                SystemNotification.expires_at.is_(None),
                SystemNotification.expires_at > datetime.utcnow()
            )
        ).order_by(
            SystemNotification.created_at.desc()
        ).all()

        return jsonify({
            'notifications': [notification.to_dict() for notification in notifications],
            'unread_count': sum(1 for n in notifications if not n.read_by_user)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/notifications/<int:notification_id>/read', methods=['PUT'])
@login_required
def mark_as_read(notification_id):
    """Mark a notification as read"""
    try:
        # Find notification that belongs to current user
        notification = SystemNotification.query.filter(
            SystemNotification.id == notification_id,
            or_(
                SystemNotification.recipient_user_id == current_user.id,
                SystemNotification.recipient_role_id == current_user.role_id
            )
        ).first_or_404()

        if not notification.read_by_user:
            notification.mark_as_read()
            db.session.commit()

        return jsonify({
            'message': 'Notification marked as read',
            'notification': notification.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/notifications/mark-all-read', methods=['PUT'])
@login_required
def mark_all_as_read():
    """Mark all notifications as read for current user"""
    try:
        # Get user's role ID
        user_role_id = current_user.role_id

        # Update all unread notifications for this user/role
        updated_count = SystemNotification.query.filter(
            or_(
                SystemNotification.recipient_user_id == current_user.id,
                SystemNotification.recipient_role_id == user_role_id
            ),
            SystemNotification.read_by_user == False
        ).update({
            'read_by_user': True,
            'read_at': datetime.utcnow()
        })

        db.session.commit()

        return jsonify({
            'message': f'Marked {updated_count} notifications as read'
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/notifications/<int:notification_id>', methods=['DELETE'])
@login_required
def delete_notification(notification_id):
    """Delete a notification"""
    try:
        # Find notification that belongs to current user
        notification = SystemNotification.query.filter(
            SystemNotification.id == notification_id,
            or_(
                SystemNotification.recipient_user_id == current_user.id,
                SystemNotification.recipient_role_id == current_user.role_id
            )
        ).first_or_404()

        db.session.delete(notification)
        db.session.commit()

        return jsonify({
            'message': 'Notification deleted successfully'
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Admin routes for managing notifications (future enhancement)
@bp.route('/admin/notifications', methods=['POST'])
@login_required
def create_notification():
    """Create a new notification (admin only)"""
    if not current_user.is_admin():
        return jsonify({'error': 'Admin access required'}), 403

    try:
        data = request.get_json()

        # Validate required fields
        if not data.get('title') or not data.get('message') or not data.get('type'):
            return jsonify({'error': 'Title, message, and type are required'}), 400

        # Validate notification type
        valid_types = ['system_alert', 'maintenance', 'exam_reminder', 'room_assignment',
                      'registration_deadline', 'grade_posted', 'fee_reminder', 'policy_update']
        if data['type'] not in valid_types:
            return jsonify({'error': f'Invalid notification type. Must be one of: {", ".join(valid_types)}'}), 400

        # Validate priority
        valid_priorities = ['low', 'normal', 'high', 'urgent']
        priority = data.get('priority', 'normal')
        if priority not in valid_priorities:
            return jsonify({'error': f'Invalid priority. Must be one of: {", ".join(valid_priorities)}'}), 400

        # Determine recipient
        recipient_user_id = data.get('recipient_user_id')
        recipient_role_id = data.get('recipient_role_id')
        recipient_external_email = data.get('recipient_external_email')

        if not recipient_user_id and not recipient_role_id and not recipient_external_email:
            return jsonify({'error': 'Must specify recipient_user_id, recipient_role_id, or recipient_external_email'}), 400

        notification = SystemNotification(
            recipient_user_id=recipient_user_id,
            recipient_role_id=recipient_role_id,
            recipient_external_email=recipient_external_email,
            notification_title=data['title'],
            notification_message=data['message'],
            notification_type=data['type'],
            priority_level=priority,
            action_required=data.get('action_required', False),
            action_url=data.get('action_url'),
            expires_at=data.get('expires_at')
        )

        db.session.add(notification)
        db.session.commit()

        return jsonify({
            'message': 'Notification created successfully',
            'notification': notification.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/admin/notifications/<int:notification_id>', methods=['PUT'])
@login_required
def update_notification(notification_id):
    """Update a notification (admin only)"""
    if not current_user.is_admin():
        return jsonify({'error': 'Admin access required'}), 403

    try:
        notification = SystemNotification.query.get_or_404(notification_id)
        data = request.get_json()

        # Update allowed fields
        if 'title' in data:
            notification.notification_title = data['title']
        if 'message' in data:
            notification.notification_message = data['message']
        if 'read' in data:
            notification.read_by_user = data['read']
            if data['read'] and not notification.read_at:
                notification.read_at = datetime.utcnow()
        if 'expires_at' in data:
            notification.expires_at = data['expires_at']

        db.session.commit()

        return jsonify({
            'message': 'Notification updated successfully',
            'notification': notification.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
