from ..extensions import db

class Room(db.Model):
    __tablename__ = 'rooms'
    id = db.Column(db.Integer, primary_key=True)
    building_id = db.Column(db.Integer, db.ForeignKey('buildings.id'), nullable=False)
    room_number = db.Column(db.String(20), nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    testing_capacity = db.Column(db.Integer)
    floor = db.Column(db.Integer, default=1)
    allowed = db.Column(db.Boolean, default=True)
    type = db.Column(db.String(50), default='Lecture')
    building_name = db.Column(db.String(200))

    def __repr__(self):
        return f"<Room {self.building.code if self.building else 'Unknown'}-{self.room_number}>"
