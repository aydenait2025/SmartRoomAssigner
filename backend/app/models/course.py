from ..extensions import db

class Course(db.Model):
    __tablename__ = 'courses'
    id = db.Column(db.Integer, primary_key=True)
    course_code = db.Column(db.String(20), nullable=False, unique=True)
    course_name = db.Column(db.String(300), nullable=False)
    department_id = db.Column(db.Integer, db.ForeignKey('academic_departments.id'))
    credits = db.Column(db.Numeric(4, 2), default=3.0)
    course_level = db.Column(db.Integer)
    course_format = db.Column(db.String(20))  # Lecture, Lab, Seminar, Tutorial, Hybrid
    prerequisites = db.Column(db.JSON, default=list)
    corequisites = db.Column(db.JSON, default=list)
    course_description = db.Column(db.Text)
    learning_objectives = db.Column(db.Text)
    required_materials = db.Column(db.Text)
    textbook_isbns = db.Column(db.JSON)
    assessment_methods = db.Column(db.JSON)
    grading_scheme = db.Column(db.String(200))
    typical_enrollment = db.Column(db.Integer)
    workload_hours_per_week = db.Column(db.Integer)
    special_notes = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    # Relationships
    department = db.relationship('AcademicDepartment', back_populates='courses', lazy=True)
    enrollments = db.relationship('Enrollment', back_populates='course', lazy=True)

    def to_dict(self):
        """Convert course to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'course_code': self.course_code,
            'course_name': self.course_name,
            'department_id': self.department_id,
            'credits': float(self.credits) if self.credits else None,
            'course_level': self.course_level,
            'course_format': self.course_format,
            'prerequisites': self.prerequisites or [],
            'corequisites': self.corequisites or [],
            'course_description': self.course_description,
            'learning_objectives': self.learning_objectives,
            'required_materials': self.required_materials,
            'textbook_isbns': self.textbook_isbns or [],
            'assessment_methods': self.assessment_methods or [],
            'grading_scheme': self.grading_scheme,
            'typical_enrollment': self.typical_enrollment,
            'expected_students': self.typical_enrollment,
            'workload_hours_per_week': self.workload_hours_per_week,
            'special_notes': self.special_notes,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def __repr__(self):
        return f"<Course {self.course_code}: {self.course_name}>"
