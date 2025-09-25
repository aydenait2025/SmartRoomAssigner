from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_mail import Mail
from authlib.integrations.flask_client import OAuth

# Initialize extensions
db = SQLAlchemy()
login_manager = LoginManager()
login_manager.session_protection = "strong"
mail = Mail()
oauth = OAuth()

@login_manager.user_loader
def load_user(user_id):
    """User loader function for Flask-Login"""
    from .models.user import User
    return User.query.get(int(user_id))
