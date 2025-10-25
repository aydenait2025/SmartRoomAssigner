from ..extensions import db

class Student(db.Model):
    __tablename__ = 'students'
    __table_args__ = {'extend_existing': True}
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    student_number = db.Column(db.String(20), nullable=False, unique=True)
    program_id = db.Column(db.Integer, db.ForeignKey('academic_programs.id'))
    enrollment_year = db.Column(db.Integer)
    expected_graduation_year = db.Column(db.Integer)
    enrollment_status = db.Column(db.String(30), default='active')
    enrollment_type = db.Column(db.String(30), default='full_time')
    gpa = db.Column(db.Numeric(4,3))
    credits_completed = db.Column(db.Numeric(6,2), default=0)
    credits_in_progress = db.Column(db.Numeric(6,2), default=0)
    credits_registered = db.Column(db.Numeric(6,2), default=0)
    academic_standing = db.Column(db.String(30))
    residence_status = db.Column(db.String(30))
    citizenship_country = db.Column(db.String(100))
    tuition_status = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    # Add the missing relationships
    enrollments = db.relationship('Enrollment', back_populates='student', lazy=True)
    # Relationship to user for name access (assignments now link directly to users)
    user = db.relationship('User', backref=db.backref('student_profile', uselist=False), lazy=True)

    def to_dict(self):
        """Convert student to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.user.name if self.user else None,
            'email': self.user.email if self.user else None,
            'student_number': self.student_number,
            'enrollment_year': self.enrollment_year,
            'gpa': str(self.gpa) if self.gpa else None,
            'enrollment_status': self.enrollment_status,
            'academic_standing': self.academic_standing
        }

    @property
    def name(self):
        """Get student name from associated user"""
        return self.user.name if self.user else None

    @property
    def email(self):
        """Get student email from associated user"""
        return self.user.email if self.user else None

    def __repr__(self):
        return f"<Student {self.student_number}>"
