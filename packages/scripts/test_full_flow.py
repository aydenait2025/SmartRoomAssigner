#!/usr/bin/env python3
"""
Test the full authentication flow with session cookies
"""

import requests

# Create a session to handle cookies
session = requests.Session()

# First try login
login_response = session.post('http://127.0.0.1:5000/login',
                             json={'email': 'alice@examspace.com', 'password': 'password'},
                             headers={'Content-Type': 'application/json'})

print(f"Login Response Status: {login_response.status_code}")
print(f"Login Response: {login_response.json()}")

# Check if login succeeded and get dashboard stats
stats_response = session.get('http://127.0.0.1:5000/dashboard/stats')

print(f"Stats Response Status: {stats_response.status_code}")
if stats_response.status_code == 200:
    print(f"Stats Response: {stats_response.json()}")
else:
    print(f"Stats Response Error: {stats_response.text}")

# Try password change - first get current user
current_user_response = session.get('http://127.0.0.1:5000/current_user')
print(f"Current User Status: {current_user_response.status_code}")
if current_user_response.status_code == 200:
    print(f"Current User: {current_user_response.json()}")
else:
    print(f"Current User Error: {current_user_response.text}")
