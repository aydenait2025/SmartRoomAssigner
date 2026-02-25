from ..extensions import db

class AcademicDepartment(db.Model):
    __tablename__ = 'academic_departments'

    id = db.Column(db.Integer, primary_key=True)
    department_code = db.Column(db.String(10), nullable=False, unique=True)
    department_name = db.Column(db.String(200), nullable=False)
    faculty_name = db.Column(db.String(200))
    email_domain = db.Column(db.String(100))
    website_url = db.Column(db.Text)
    dean_user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    budget_code = db.Column(db.String(20))
    headcount_limit = db.Column(db.Integer)
    current_headcount = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    # Relationships
    dean = db.relationship('User', backref='dean_of_departments', lazy=True)
    courses = db.relationship('Course', back_populates='department', lazy=True)

    def to_dict(self):
        """Convert department to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'department_code': self.department_code,
            'department_name': self.department_name,
            'faculty_name': self.faculty_name,
            'email_domain': self.email_domain,
            'website_url': self.website_url,
            'dean_user_id': self.dean_user_id,
            'budget_code': self.budget_code,
            'headcount_limit': self.headcount_limit,
            'current_headcount': self.current_headcount,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def __repr__(self):
        return f"<AcademicDepartment {self.department_code}: {self.department_name}>"
