from ..extensions import db

class Exam(db.Model):
    __tablename__ = 'exams'
    id = db.Column(db.Integer, primary_key=True)
    course_name = db.Column(db.String(100))
    course_code = db.Column(db.String(20))
    exam_date = db.Column(db.Date)
    start_time = db.Column(db.Time)
    end_time = db.Column(db.Time)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    creator = db.relationship('User', backref='created_exams', lazy=True)

    def to_dict(self):
        """Convert exam to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'course_name': self.course_name,
            'course_code': self.course_code,
            'exam_date': self.exam_date.isoformat() if self.exam_date else None,
            'start_time': str(self.start_time) if self.start_time else None,
            'end_time': str(self.end_time) if self.end_time else None,
            'created_by': self.created_by
        }

    def __repr__(self):
        return f"<Exam {self.course_code} on {self.exam_date}>"
