#!/usr/bin/env python3
"""Test login functionality"""

import requests
import json

def test_login():
    """Test the login endpoint"""
    BASE_URL = 'http://localhost:5000'  # Default Flask dev port

    print('🔍 Testing login endpoint...')
    print('=' * 40)

    # Test credentials (from our migrated data)
    test_users = [
        {'email': 'alice@examspace.com', 'password': 'alice123'},
        {'email': 'sara@student.edu', 'password': 'sara123'},
    ]

    for user in test_users:
        print(f'\nTesting login for: {user["email"]}')

        try:
            response = requests.post(
                f'{BASE_URL}/api/auth/login',
                json=user,
                timeout=5
            )

            if response.status_code == 200:
                data = response.json()
                print(f'✅ Login successful: {user["email"]}')
                print(f'   Role: {data.get("user", {}).get("role", "N/A")}')
                print(f'   User ID: {data.get("user", {}).get("id", "N/A")}')
            else:
                print(f'❌ Login failed: {response.status_code}')
                try:
                    error = response.json()
                    print(f'   Error: {error.get("error", "Unknown")}')
                except:
                    print(f'   Response: {response.text[:100]}...')

        except requests.exceptions.ConnectionError:
            print('❌ Cannot connect to backend server')
            print('   Make sure the backend is running:')
            print('   cd backend && python app.py')
            break
        except Exception as e:
            print(f'❌ Request failed: {e}')

    print('\n' + '=' * 40)
    print('Login test complete')

if __name__ == '__main__':
    test_login()
