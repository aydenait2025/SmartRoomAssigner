from ..extensions import db

class Enrollment(db.Model):
    __tablename__ = 'enrollments'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    exam_id = db.Column(db.Integer, db.ForeignKey('exams.id'), nullable=False)

class RoomAssignment(db.Model):
    __tablename__ = 'room_assignments'
    id = db.Column(db.Integer, primary_key=True)
    exam_id = db.Column(db.Integer, db.ForeignKey('exams.id'))
    room_id = db.Column(db.Integer, db.ForeignKey('rooms.id'))
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'))
    seat_number = db.Column(db.String(10))

class Assignment(db.Model):
    __tablename__ = 'assignments'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    room_id = db.Column(db.Integer, db.ForeignKey('rooms.id'), nullable=False)
    course = db.Column(db.String(100))
    exam_date = db.Column(db.DateTime)
