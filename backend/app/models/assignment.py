from ..extensions import db

class Assignment(db.Model):
    """Legacy assignment model for backward compatibility"""
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), unique=True, nullable=False)
    room_id = db.Column(db.Integer, db.ForeignKey('room.id'), nullable=False)
    course = db.Column(db.String(100))  # Optional: if assignments are course-specific
    exam_date = db.Column(db.DateTime)  # Optional: if assignments are date-specific

    # Relationships
    student = db.relationship('Student', backref='legacy_assignments', lazy=True)
    room = db.relationship('Room', backref='legacy_assignments', lazy=True)

    def __repr__(self):
        return f"<Assignment Student: {self.student_id}, Room: {self.room_id}>"
