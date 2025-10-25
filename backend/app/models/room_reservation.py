from ..extensions import db
from datetime import datetime

class RoomReservation(db.Model):
    """Room reservations for non-exam bookings - departments reserve rooms for their use"""
    __tablename__ = 'room_reservations'

    id = db.Column(db.Integer, primary_key=True)
    room_id = db.Column(db.Integer, db.ForeignKey('rooms.id'), nullable=False)
    requested_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    event_title = db.Column(db.String(300), nullable=False)
    event_description = db.Column(db.Text)
    event_type = db.Column(db.String(50), nullable=False,
                          default='department_reservation',
                          comment='meeting, workshop, conference, seminar, department_reservation, etc.')
    expected_attendees = db.Column(db.Integer, default=1, nullable=False)
    setup_requirements = db.Column(db.Text)
    catering_requirements = db.Column(db.Text)
    technology_requirements = db.Column(db.Text)
    reservation_date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    is_recurring = db.Column(db.Boolean, default=False)
    recurrence_pattern = db.Column(db.String(20), comment='Daily, Weekly, Monthly')
    recurrence_end_date = db.Column(db.Date)
    reservation_status = db.Column(db.String(20), default='approved',
                                  comment='pending, approved, denied, cancelled, completed')
    approved_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    approved_at = db.Column(db.DateTime)
    approval_notes = db.Column(db.Text)
    cancellation_reason = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    room = db.relationship('Room', backref=db.backref('reservations', lazy=True))
    requester = db.relationship('User', foreign_keys=[requested_by], backref=db.backref('room_requests', lazy=True))
    approver = db.relationship('User', foreign_keys=[approved_by], backref=db.backref('room_approvals', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'room_id': self.room_id,
            'requested_by': self.requested_by,
            'event_title': self.event_title,
            'event_description': self.event_description,
            'event_type': self.event_type,
            'expected_attendees': self.expected_attendees,
            'setup_requirements': self.setup_requirements,
            'catering_requirements': self.catering_requirements,
            'technology_requirements': self.technology_requirements,
            'reservation_date': self.reservation_date.isoformat() if self.reservation_date else None,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'is_recurring': self.is_recurring,
            'recurrence_pattern': self.recurrence_pattern,
            'recurrence_end_date': self.recurrence_end_date.isoformat() if self.recurrence_end_date else None,
            'reservation_status': self.reservation_status,
            'approved_by': self.approved_by,
            'approved_at': self.approved_at.isoformat() if self.approved_at else None,
            'approval_notes': self.approval_notes,
            'cancellation_reason': self.cancellation_reason,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            # Include related data
            'room': self.room.to_dict() if self.room else None,
            'requester': self.requester.to_dict() if self.requester else None,
            'approver': self.approver.to_dict() if self.approver else None
        }

    def __repr__(self):
        return f'<RoomReservation {self.id}: {self.event_title} by user {self.requested_by}>'
