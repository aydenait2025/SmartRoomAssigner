from ..extensions import db

class Building(db.Model):
    __tablename__ = 'buildings'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    code = db.Column(db.String(10), nullable=False)
    address = db.Column(db.Text)

    rooms = db.relationship('Room', backref='building', lazy=True)

    def __repr__(self):
        return f"<Building {self.code}: {self.name}>"
