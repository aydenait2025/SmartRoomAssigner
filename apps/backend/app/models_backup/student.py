from ..extensions import db

class Student(db.Model):
    """Student profile model"""
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.String(20), unique=True, nullable=False)  # Student ID number
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20))
    year = db.Column(db.Integer)  # Academic year (1, 2, 3, 4, etc.)
    major = db.Column(db.String(100))
    gpa = db.Column(db.Float)

    # Relationships
    # Note: assignments removed to avoid backref conflict with Assignment.student

    # Link to user account (for student users)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    user = db.relationship('User', backref='student_profiles', lazy=True)

    def __repr__(self):
        return f"<Student {self.student_id}: {self.first_name} {self.last_name}>"

    def to_dict(self):
        """Convert student to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'student_id': self.student_id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'email': self.email,
            'phone': self.phone,
            'year': self.year,
            'major': self.major,
            'gpa': self.gpa
        }
