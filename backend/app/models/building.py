from ..extensions import db

class Building(db.Model):
    """Building model for campus facilities"""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    code = db.Column(db.String(10), unique=True, nullable=False)
    address = db.Column(db.Text)
    description = db.Column(db.Text)
    total_floors = db.Column(db.Integer)
    total_rooms = db.Column(db.Integer)
    coordinates_lat = db.Column(db.Float)
    coordinates_lng = db.Column(db.Float)
    campus = db.Column(db.String(100))
    accessibility_info = db.Column(db.Text)

    # Relationships
    rooms = db.relationship('Room', backref='building', lazy=True)

    def to_dict(self):
        """Convert building to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'name': self.name,
            'code': self.code,
            'address': self.address,
            'description': self.description,
            'total_floors': self.total_floors,
            'total_rooms': self.total_rooms,
            'coordinates_lat': self.coordinates_lat,
            'coordinates_lng': self.coordinates_lng,
            'campus': self.campus,
            'accessibility_info': self.accessibility_info
        }

    def __repr__(self):
        return f"<Building {self.code}: {self.name}>"
