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

    enrollments = db.relationship('Enrollment', backref='student', lazy=True)
    room_assignments = db.relationship('RoomAssignment', backref='student', lazy=True)

    def __repr__(self):
        return f"<Student {self.student_number}>"
