from flask import Blueprint, request, jsonify, current_app
from flask_login import login_user, logout_user, login_required, current_user
from ..services.auth_service import AuthService
from ..models.user import User
import requests

bp = Blueprint('auth', __name__)

@bp.route('/login', methods=['POST'])
def login():
    """Handle user login using email and password"""
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400

    # Authenticate user against database
    user, error = AuthService.authenticate_user(email, password)
    if error:
        return jsonify({'error': error}), 401

    # Check if user account is active
    if not user.is_active:
        return jsonify({'error': 'Account is not active'}), 401

    # Login the user
    login_user(user)

    # Get role name for frontend - must match frontend expectations exactly
    role_name_frontend = 'Administrator' if user.is_admin() else 'student'

    # Return user info
    user_response = {
        'id': user.id,
        'name': user.name,
        'email': user.email,
        'role': role_name_frontend
    }

    return jsonify({'message': 'Login successful', 'user': user_response}), 200

@bp.route('/logout', methods=['POST'])
@login_required
def logout():
    """Handle user logout"""
    logout_user()
    return jsonify({'message': 'Logout successful'}), 200

@bp.route('/google')
def google_login():
    """Initiate Google OAuth login"""
    google = current_app.extensions['oauth']['google']
    redirect_uri = request.args.get('redirect_uri', 'http://localhost:3000/auth/callback')
    return google.authorize_redirect(redirect_uri)

@bp.route('/google/callback')
def google_callback():
    """Handle Google OAuth callback"""
    google = current_app.extensions['oauth']['google']
    token = google.authorize_access_token()
    user_info = google.get('https://www.googleapis.com/oauth2/v2/userinfo').json()

    # Create or update user
    user = User.query.filter_by(email=user_info['email']).first()
    if not user:
        user = User(
            email=user_info['email'],
            name=user_info.get('name', ''),
            role_id=2,  # TODO: Set appropriate default role
            password_hash=''  # OAuth users don't need password
        )
        from ..extensions import db
        db.session.add(user)
        db.session.commit()

    login_user(user)
    return jsonify({'message': 'Google login successful', 'user': user.to_dict()}), 200

@bp.route('/microsoft')
def microsoft_login():
    """Initiate Microsoft OAuth login"""
    microsoft = current_app.extensions['oauth']['microsoft']
    redirect_uri = request.args.get('redirect_uri', 'http://localhost:3000/auth/callback')
    return microsoft.authorize_redirect(redirect_uri)

@bp.route('/microsoft/callback')
def microsoft_callback():
    """Handle Microsoft OAuth callback"""
    microsoft = current_app.extensions['oauth']['microsoft']
    token = microsoft.authorize_access_token()
    user_info = microsoft.get('https://graph.microsoft.com/v1.0/me').json()

    # Create or update user
    user = User.query.filter_by(email=user_info['mail']).first()
    if not user:
        user = User(
            name=user_info.get('displayName', ''),
            email=user_info['mail'],
            role_id=2,  # Set appropriate default role
            password_hash=''  # OAuth users don't need password
        )
        from ..extensions import db
        db.session.add(user)
        db.session.commit()

    login_user(user)
    return jsonify({'message': 'Microsoft login successful', 'user': user.to_dict()}), 200

@bp.route('/me', methods=['GET'])
@login_required
def get_current_user():
    """Get current user information"""
    return jsonify({'user': current_user.to_dict()}), 200
