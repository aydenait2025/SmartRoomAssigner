from ..extensions import db
from datetime import datetime

class Assignment(db.Model):
    """Assignment model for exam room assignments"""
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    exam_id = db.Column(db.Integer, db.ForeignKey('exam.id'), nullable=False)
    room_id = db.Column(db.Integer, db.ForeignKey('room.id'), nullable=False)
    assigned_date = db.Column(db.DateTime, default=datetime.now)
    special_accommodations = db.Column(db.Text)  # Special accommodations for the student
    notes = db.Column(db.Text)

    # Relationships
    student = db.relationship('Student', backref='assignments', lazy=True)
    exam = db.relationship('Exam', backref='assignments', lazy=True)
    room = db.relationship('Room', backref='assignments', lazy=True)

    def __repr__(self):
        return f"<Assignment Student: {self.student_id}, Exam: {self.exam_id}, Room: {self.room_id}>"

    def to_dict(self):
        """Convert assignment to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'student_id': self.student_id,
            'exam_id': self.exam_id,
            'room_id': self.room_id,
            'assigned_date': self.assigned_date.isoformat() if self.assigned_date else None,
            'special_accommodations': self.special_accommodations,
            'notes': self.notes,
            'student': self.student.to_dict() if self.student else None,
            'exam': self.exam.to_dict() if self.exam else None,
            'room': self.room.to_dict() if self.room else None
        }
