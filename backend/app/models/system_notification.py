from ..extensions import db
from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP, TEXT, ForeignKey
from sqlalchemy.orm import relationship

class SystemNotification(db.Model):
    __tablename__ = 'system_notifications'

    # Primary key
    id = db.Column(db.Integer, primary_key=True)

    # Recipient information (can be user, role, or external email)
    recipient_user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    recipient_role_id = db.Column(db.Integer, db.ForeignKey('roles.id'))
    recipient_external_email = db.Column(db.String(150))

    # Notification content
    notification_title = db.Column(db.String(200), nullable=False)
    notification_message = db.Column(TEXT, nullable=False)

    # Notification metadata
    notification_type = db.Column(db.String(30), nullable=False)
    priority_level = db.Column(db.String(10), nullable=False, default='normal')
    action_required = db.Column(db.Boolean, nullable=False, default=False)
    action_url = db.Column(TEXT)

    # Expiry and status
    expires_at = db.Column(TIMESTAMP)
    read_by_user = db.Column(db.Boolean, nullable=False, default=False)
    read_at = db.Column(TIMESTAMP)

    # Email delivery status
    sent_via_email = db.Column(db.Boolean, nullable=False, default=False)
    sent_at = db.Column(TIMESTAMP)

    # Audit field
    created_at = db.Column(TIMESTAMP, nullable=False, server_default=db.text('CURRENT_TIMESTAMP'))

    # Relationships
    recipient_user = relationship('User', backref='notifications', foreign_keys=[recipient_user_id])
    recipient_role = relationship('Role', backref='notifications', foreign_keys=[recipient_role_id])

    # Constraints based on database schema
    __table_args__ = (
        db.CheckConstraint(
            "recipient_user_id IS NOT NULL OR recipient_role_id IS NOT NULL OR recipient_external_email IS NOT NULL",
            name="recipient_check"
        ),
        db.CheckConstraint(
            "notification_type IN ('system_alert', 'maintenance', 'exam_reminder', 'room_assignment', 'registration_deadline', 'grade_posted', 'fee_reminder', 'policy_update')",
            name="valid_notification_type"
        ),
        db.CheckConstraint(
            "priority_level IN ('low', 'normal', 'high', 'urgent')",
            name="valid_priority_level"
        ),
    )

    def mark_as_read(self):
        """Mark notification as read"""
        if not self.read_by_user:
            from datetime import datetime
            self.read_by_user = True
            self.read_at = datetime.utcnow()

    def to_dict(self):
        """Convert notification to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'recipient_user_id': self.recipient_user_id,
            'recipient_role_id': self.recipient_role_id,
            'recipient_external_email': self.recipient_external_email,
            'title': self.notification_title,
            'message': self.notification_message,
            'type': self.notification_type,
            'priority': self.priority_level,
            'action_required': self.action_required,
            'action_url': self.action_url,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'read': self.read_by_user,
            'read_at': self.read_at.isoformat() if self.read_at else None,
            'sent_via_email': self.sent_via_email,
            'sent_at': self.sent_at.isoformat() if self.sent_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    def __repr__(self):
        return f"<SystemNotification {self.notification_title} ({self.priority_level})>"
