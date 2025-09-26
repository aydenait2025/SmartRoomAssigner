from ..extensions import db

class Exam(db.Model):
    """Exam scheduling model"""
    id = db.Column(db.Integer, primary_key=True)
    course_name = db.Column(db.String(100))
    course_code = db.Column(db.String(20))
    exam_date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    creator = db.relationship('User', backref='created_exams', lazy=True)

    # Relationships
    enrollments = db.relationship('Enrollment', backref='exam', lazy=True)
    room_assignments = db.relationship('RoomAssignment', backref='exam', lazy=True)

    def to_dict(self):
        """Convert exam to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'course_name': self.course_name,
            'course_code': self.course_code,
            'exam_date': self.exam_date.isoformat() if self.exam_date else None,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'created_by': self.created_by
        }

    def __repr__(self):
        return f"<Exam {self.course_code} on {self.exam_date}>"

class Enrollment(db.Model):
    """Student enrollment in exams"""
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    exam_id = db.Column(db.Integer, db.ForeignKey('exam.id'), nullable=False)

    def __repr__(self):
        return f"<Enrollment Student: {self.student_id}, Exam: {self.exam_id}>"

class RoomAssignment(db.Model):
    """Room assignment for exam seating"""
    id = db.Column(db.Integer, primary_key=True)
    exam_id = db.Column(db.Integer, db.ForeignKey('exam.id'), nullable=False)
    room_id = db.Column(db.Integer, db.ForeignKey('room.id'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    seat_number = db.Column(db.String(10))

    def __repr__(self):
        return f"<RoomAssignment Student: {self.student_id}, Room: {self.room_id}, Exam: {self.exam_id}>"
