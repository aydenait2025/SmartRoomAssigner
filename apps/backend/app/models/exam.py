from ..extensions import db

class Exam(db.Model):
    __tablename__ = 'exams'
    id = db.Column(db.Integer, primary_key=True)
    exam_code = db.Column(db.String(50), unique=True)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'))
    term_id = db.Column(db.Integer)
    instructor_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    exam_type = db.Column(db.String(20))
    duration_minutes = db.Column(db.Integer)
    special_instructions = db.Column(db.Text)
    requires_supervision = db.Column(db.Boolean, default=True)
    student_count_estimate = db.Column(db.Integer)
    status = db.Column(db.String(20), default='scheduled')
    is_rescheduled = db.Column(db.Boolean, default=False)
    original_exam_id = db.Column(db.Integer, db.ForeignKey('exams.id'))
    cancellation_reason = db.Column(db.Text)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

    # Relationships
    course = db.relationship('Course', backref='exams', lazy=True)
    instructor = db.relationship('User', foreign_keys=[instructor_id], backref='instructed_exams', lazy=True)
    creator = db.relationship('User', foreign_keys=[created_by], backref='created_exams', lazy=True)

    def to_dict(self):
        """Convert exam to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'exam_code': self.exam_code,
            'course_name': self.course.course_name if self.course else f'Course {self.course_id}',
            'course_code': self.course.course_code if self.course else f'C{self.course_id}',
            'exam_type': self.exam_type,
            'duration_minutes': self.duration_minutes,
            'student_count_estimate': self.student_count_estimate or 0,
            'status': self.status,
            'created_by': self.created_by,
            'special_instructions': self.special_instructions
        }

    def __repr__(self):
        return f"<Exam {self.course_code} on {self.exam_date}>"
