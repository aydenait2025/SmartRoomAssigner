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
# Link directly to users instead of students table to simplify
class Assignment(db.Model):
    """Assignment model linking users (students) directly to exam rooms"""
    __tablename__ = 'assignments'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    room_id = db.Column(db.Integer, db.ForeignKey('rooms.id'), nullable=False)
    exam_id = db.Column(db.Integer, db.ForeignKey('exams.id'))
    course = db.Column(db.String(100))
    exam_date = db.Column(db.DateTime)
    assigned_date = db.Column(db.DateTime, default=db.func.current_timestamp())
    special_accommodations = db.Column(db.Text)
    notes = db.Column(db.Text)
    seat_number = db.Column(db.String(10))

    # Relationships - link directly to users
    user = db.relationship('User', backref=db.backref('exam_assignments', lazy=True), lazy=True)
    room = db.relationship('Room', backref='exam_assignments', lazy=True)
    exam = db.relationship('Exam', backref='exam_assignments', lazy=True)

    def __repr__(self):
        return f"<Assignment User: {self.user_id}, Exam: {self.exam_id}, Room: {self.room_id}>"

    def to_dict(self):
        """Convert assignment to dictionary for JSON serialization"""
        # For frontend compatibility, return flattened data structure
        # Safely extract data without calling to_dict() on related models
        student_name = None
        student_email = None
        if self.user:
            try:
                student_name = getattr(self.user, 'name', None)
                student_email = getattr(self.user, 'email', None)
            except:
                pass

        room_name = None
        room_capacity = None
        if self.room:
            try:
                room_name = self.room.room_name
                room_capacity = self.room.capacity
            except:
                pass

        return {
            'assignment_id': self.id,
            'student_id': self.user_id,  # Map to student_id for frontend compatibility
            'student_name': student_name,
            'student_email': student_email,
            'exam_id': self.exam_id,
            'room_id': self.room_id,
            'room_name': room_name,
            'room_capacity': room_capacity,
            'course': self.course,
            'exam_date': self.exam_date.isoformat() if self.exam_date else None,
            'assigned_date': self.assigned_date.isoformat() if self.assigned_date else None,
            'special_accommodations': self.special_accommodations,
            'notes': self.notes,
            'seat_number': self.seat_number
        }
