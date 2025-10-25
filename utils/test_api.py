#!/usr/bin/env python3
"""Test Student Management API"""

import sys, os
sys.path.append('../backend')
from app import create_app

def test_students_api():
    """Test the students API endpoint"""

    app = create_app()

    with app.app_context():
        test_client = app.test_client()

        # Test the GET /students endpoint
        print("Testing GET /students...")
        response = test_client.get('/students?page=1&per_page=5')

        print(f'Status Code: {response.status_code}')

        if response.status_code == 200:
            data = response.get_json()
            students = data.get('students', [])
            print(f'Students returned: {len(students)}')

            if students:
                print('\nFirst student:')
                student = students[0]
                print(f'  Name: {student.get("name")}')
                print(f'  Email: {student.get("email")}')
                print(f'  Role ID: {student.get("role_id")}')
                print(f'  Role Name: {student.get("role_name")}')
            else:
                print('No students returned')
        else:
            print(f'Error: {response.get_json()}')

if __name__ == "__main__":
    test_students_api()
