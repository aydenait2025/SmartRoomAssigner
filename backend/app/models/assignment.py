from ..extensions import db

# Enterprise-compatible Enrollment model (updated table name and fields)
class Enrollment(db.Model):
    """Student enrollments in courses - enterprise schema compatible"""
    __tablename__ = 'course_enrollments'

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    term_id = db.Column(db.Integer)  # Reference to academic_terms table when defined
    enrollment_status = db.Column(db.String(20), default='enrolled')
    enrollment_date = db.Column(db.DateTime, default=db.func.current_timestamp())
    grade = db.Column(db.String(10))
    credit_hours = db.Column(db.Integer, default=3)

    # Relationships - only add these if Course class is already defined
    student = db.relationship('Student', back_populates='enrollments', lazy=True)
    # course relationship will be added later when all models are loaded

# Future enterprise RoomAssignment model - comment out until full models are available
# class RoomAssignment(db.Model):
#     """Room assignments from enterprise schema"""
#     __tablename__ = 'room_assignments'
#     # ... full enterprise schema implementation

# Current Assignment model - updated for enterprise schema compatibility
class Assignment(db.Model):
    """Assignment model with enterprise schema foreign key references"""
    __tablename__ = 'assignments'

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    room_id = db.Column(db.Integer, db.ForeignKey('rooms.id'), nullable=False)
    exam_id = db.Column(db.Integer, db.ForeignKey('exams.id'))
    course = db.Column(db.String(100))
    exam_date = db.Column(db.DateTime)
    assigned_date = db.Column(db.DateTime, default=db.func.current_timestamp())
    special_accommodations = db.Column(db.Text)
    notes = db.Column(db.Text)
    seat_number = db.Column(db.String(10))

    # Relationships
    student = db.relationship('Student', back_populates='assignments', lazy=True)
    room = db.relationship('Room', backref='assignments', lazy=True)
    exam = db.relationship('Exam', backref='assignments', lazy=True)

    def __repr__(self):
        return f"<Assignment Student: {self.student_id}, Exam: {self.exam_id}, Room: {self.room_id}>"

    def to_dict(self):
        """Convert assignment to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'student_id': self.student_id,
            'exam_id': self.exam_id,
            'room_id': self.room_id,
            'course': self.course,
            'exam_date': self.exam_date.isoformat() if self.exam_date else None,
            'assigned_date': self.assigned_date.isoformat() if self.assigned_date else None,
            'special_accommodations': self.special_accommodations,
            'notes': self.notes,
            'seat_number': self.seat_number,
            'student': self.student.to_dict() if self.student else None,
            'exam': self.exam.to_dict() if self.exam else None,
            'room': self.room.to_dict() if self.room else None
        }
