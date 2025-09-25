from ..extensions import db

class Student(db.Model):
    """Student profile model"""
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    student_number = db.Column(db.String(20), unique=True, nullable=False)
    student_id = db.Column(db.String(100), nullable=False)  # Email/ID
    department = db.Column(db.String(100), nullable=True)
    courses = db.Column(db.Text, nullable=True)  # Comma-separated courses

    # Relationships
    enrollments = db.relationship('Enrollment', backref='student', lazy=True)
    room_assignments = db.relationship('RoomAssignment', backref='student', lazy=True)

    # Link to user account (for student users)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    user = db.relationship('User', backref='student_profile_backref', lazy=True)

    def __repr__(self):
        return f"<Student {self.student_number}>"
