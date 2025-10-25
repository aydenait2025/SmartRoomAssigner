from ..extensions import db

class Student(db.Model):
    __tablename__ = 'students'
    __table_args__ = {'extend_existing': True}
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    student_number = db.Column(db.String(20), unique=True, nullable=False)
    student_id = db.Column(db.String(100), nullable=False)
    department = db.Column(db.String(100))
    courses = db.Column(db.Text)

    enrollments = db.relationship('Enrollment', back_populates='student', lazy=True)
    assignments = db.relationship('Assignment', back_populates='student', lazy=True)

    def to_dict(self):
        """Convert student to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'student_number': self.student_number,
            'student_id': self.student_id,
            'department': self.department,
            'courses': self.courses
        }

    def __repr__(self):
        return f"<Student {self.student_number}>"
