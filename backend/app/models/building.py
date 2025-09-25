from ..extensions import db

class Building(db.Model):
    """Building model for campus facilities"""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    code = db.Column(db.String(10), unique=True, nullable=False)
    address = db.Column(db.Text)

    # Relationships
    rooms = db.relationship('Room', backref='building', lazy=True)

    def __repr__(self):
        return f"<Building {self.code}: {self.name}>"

class Room(db.Model):
    """Room model for individual rooms within buildings"""
    id = db.Column(db.Integer, primary_key=True)
    building_id = db.Column(db.Integer, db.ForeignKey('building.id'), nullable=False)
    room_number = db.Column(db.String(20), nullable=False)
    capacity = db.Column(db.Integer, nullable=False, default=30)
    floor = db.Column(db.Integer)
    type = db.Column(db.String(50))

    # Relationships
    room_assignments = db.relationship('RoomAssignment', backref='room', lazy=True)

    def __repr__(self):
        return f"<Room {self.building.code if self.building else 'Unknown'}-{self.room_number}>"
