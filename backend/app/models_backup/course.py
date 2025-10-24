from .. import db

class Course(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    course_code = db.Column(db.String(20), unique=True, nullable=False)
    course_name = db.Column(db.String(200), nullable=False)
    department = db.Column(db.String(100), nullable=False)
    expected_students = db.Column(db.Integer, default=0)
    assigned_students = db.Column(db.Integer, default=0)

    def __repr__(self):
        return f"<Course {self.course_code}: {self.course_name}>"
