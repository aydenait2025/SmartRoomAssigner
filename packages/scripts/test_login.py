#!/usr/bin/env python3
"""
Simple script to test login
"""

import requests

# Test login
response = requests.post('http://127.0.0.1:5000/login',
                        json={'email': 'alice@examspace.com', 'password': 'password'},
                        headers={'Content-Type': 'application/json'})

print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")
