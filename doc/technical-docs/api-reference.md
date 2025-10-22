# 🔧 API Reference

## Overview

Complete REST API documentation for SmartRoomAssigner backend services.

## Base URL
```
http://localhost:5000/api
```

## Authentication

All API endpoints require authentication. Include session cookies or JWT tokens in requests.

### Headers
```
Content-Type: application/json
Cookie: session=your-session-id
```

## 📊 Data Models

### Student
```json
{
  "id": "integer",
  "first_name": "string",
  "last_name": "string",
  "student_number": "string",
  "student_id": "string",
  "department": "string",
  "courses": "string"
}
```

### Room
```json
{
  "id": "integer",
  "building_id": "integer",
  "room_number": "string",
  "capacity": "integer",
  "floor": "integer",
  "type": "string",
  "allowed": "boolean"
}
```

### Building
```json
{
  "id": "integer",
  "name": "string",
  "code": "string",
  "address": "string"
}
```

### Exam
```json
{
  "id": "integer",
  "course_name": "string",
  "course_code": "string",
  "exam_date": "date",
  "start_time": "time",
  "end_time": "time",
  "created_by": "integer"
}
```

## 🛠️ Endpoints

### Students

#### Get All Students
```http
GET /students
```

**Query Parameters:**
- `page` (integer): Page number (default: 1)
- `per_page` (integer): Items per page (default: 10)

**Response:**
```json
{
  "students": [
    {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "student_number": "S2023001",
      "student_id": "john.doe@student.edu"
    }
  ],
  "total_pages": 5,
  "current_page": 1,
  "total_items": 50
}
```

#### Create Student
```http
POST /students
```

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "student_number": "S2023001",
  "student_id": "john.doe@student.edu",
  "department": "Computer Science"
}
```

#### Update Student
```http
PUT /students/{id}
```

#### Delete Student
```http
DELETE /students/{id}
```

### Rooms

#### Get All Rooms
```http
GET /rooms
```

#### Create Room
```http
POST /rooms
```

**Request Body:**
```json
{
  "building_name": "Main Building",
  "room_number": "101",
  "capacity": 30,
  "floor": 1,
  "type": "Lecture"
}
```

### Buildings

#### Get All Buildings
```http
GET /buildings
```

**Response:**
```json
{
  "buildings": [
    {
      "building_name": "BA - Bahen Centre Information Tech",
      "total_rooms": 15,
      "total_capacity": 450,
      "available_rooms": 12,
      "rooms": [...]
    }
  ]
}
```

### Assignments

#### Generate Smart Assignments
```http
POST /assign-students
```

**Response:**
```json
{
  "assignments": [
    {
      "room_id": 1,
      "building_name": "Main Building",
      "room_number": "101",
      "assigned_students": [...],
      "remaining_capacity": 5
    }
  ],
  "unassigned_students": [...],
  "message": "Students assigned successfully"
}
```

#### Get Student Assignment
```http
GET /student-assignment
```

**Response:**
```json
{
  "student_name": "John Doe",
  "student_id": "john.doe@student.edu",
  "room": {
    "building_name": "Main Building",
    "room_number": "101"
  },
  "course": "CS 301",
  "exam_date": "2025-12-10"
}
```

### Data Import/Export

#### Import Students (Bulk)
```http
POST /students/bulk-import
Content-Type: multipart/form-data

file: students.csv
```

#### Import Buildings
```http
POST /import-buildings
Content-Type: multipart/form-data

file: buildings.csv
```

#### Export Assignments (CSV)
```http
GET /export-assignments-csv
```

#### Export Assignments (PDF)
```http
GET /export-assignments-pdf
```

## 🔐 Authentication Endpoints

### Login
```http
POST /login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "admin"
  },
  "token": "session-token"
}
```

### Register
```http
POST /register
```

### Logout
```http
POST /logout
```

### Get Current User
```http
GET /current_user
```

## ⚠️ Error Handling

### Error Response Format
```json
{
  "error": "Error description",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `422`: Unprocessable Entity
- `500`: Internal Server Error

## 📝 Content Types

### Request Content Types
- `application/json` - For JSON data
- `multipart/form-data` - For file uploads

### Response Content Types
- `application/json` - Default response format
- `text/csv` - CSV export responses
- `application/pdf` - PDF export responses

## 🔍 Filtering and Pagination

Most list endpoints support:

### Query Parameters
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 10, max: 100)
- `search`: Search term for filtering
- `sort_by`: Field to sort by
- `sort_order`: `asc` or `desc`

### Example
```http
GET /students?page=2&per_page=20&search=john&sort_by=last_name&sort_order=asc
```

## 🚀 Rate Limiting

API calls are rate limited to prevent abuse:
- **100 requests per minute** for authenticated users
- **10 requests per minute** for unauthenticated users

## 📊 Response Metadata

Paginated responses include metadata:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "per_page": 10,
    "total_items": 50,
    "total_pages": 5
  }
}
```

## 🔧 Development

### Running the API Server
```bash
cd backend
python app.py
```

### API Base URL in Development
```
http://localhost:5000
```

### Testing API Endpoints
Use tools like Postman, Insomnia, or curl:

```bash
curl -X GET "http://localhost:5000/students" \
  -H "Content-Type: application/json" \
  -b "session=cookies-here"
```

## 🔒 Security Considerations

- All endpoints require authentication
- Input validation on all endpoints
- SQL injection prevention via ORM
- XSS protection on frontend
- CSRF protection enabled
- Secure session management

## 📞 Support

For API-related questions:
- Check this documentation first
- Review the troubleshooting guide
- Contact: api-support@smartroomassigner.com

---

*API Version: 2.1.0*
*Last Updated: October 2025*
