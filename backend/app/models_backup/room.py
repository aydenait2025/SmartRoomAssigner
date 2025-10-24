from ..extensions import db

class Room(db.Model):
    """Room model for individual rooms within buildings"""
    id = db.Column(db.Integer, primary_key=True)
    building_id = db.Column(db.Integer, db.ForeignKey('building.id'), nullable=False)
    room_number = db.Column(db.String(20), nullable=False)
    capacity = db.Column(db.Integer, nullable=False, default=30)
    room_type = db.Column(db.String(50))  # e.g., 'classroom', 'lab', 'auditorium'
    floor = db.Column(db.Integer)
    features = db.Column(db.Text)  # e.g., 'projector, whiteboard, air conditioning'
    accessibility_features = db.Column(db.Text)  # e.g., 'wheelchair accessible, braille signage'
    equipment = db.Column(db.Text)  # e.g., 'computers, microscopes, AV equipment'
    notes = db.Column(db.Text)

    # Relationships
    # Note: assignments removed to avoid backref conflict with Assignment.room

    def __repr__(self):
        return f"<Room {self.building.code if self.building else 'Unknown'}-{self.room_number}>"

    def to_dict(self):
        """Convert room to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'building_id': self.building_id,
            'room_number': self.room_number,
            'capacity': self.capacity,
            'room_type': self.room_type,
            'floor': self.floor,
            'features': self.features,
            'accessibility_features': self.accessibility_features,
            'equipment': self.equipment,
            'notes': self.notes,
            'building': self.building.to_dict() if self.building else None
        }
