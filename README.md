# SmartRoomAssign

SmartRoomAssign is a full-stack web application for automatic student exam room assignment. It provides features for administrators to upload room and student data, run an assignment algorithm, and generate reports. Students can log in to view their assigned exam rooms.

## Features

### Admin Features
*   **Secure Authentication:** Admin login with session-based authentication.
*   **Upload Exam Room Data:** Upload CSV or paste CSV/text directly. Data includes Building Name, Room Number, Room Capacity, Testing Capacity (optional, defaults to 0), and Allowed flag.
*   **Preview & Edit Room Data:** Preview uploaded room data in an editable table with a checkbox for allowed status.
*   **Upload Student Data:** Upload CSV or paste CSV/text directly. Automatically detects "First Name, Last Name, Student Number, Student ID" or "Last Name, First Name, Student Number, Student ID" formats.
*   **Preview Student Data:** Preview uploaded student data in a table.
*   **Assignment Algorithm:** Automatically assigns students to allowed rooms by alphabetical order of last names, respecting room capacities.
*   **Export/Reports:** Download final room assignments as CSV. Shows statistics like number of students per room, remaining capacity, and unassigned students.

### Student Features
*   **Secure Login:** Students can log in using their student ID.
*   **View Exam Room Assignment:** Displays course, exam date, room, and building.
*   **Download/Print Option:** Placeholder for downloading PDF or printing assignments.

## System Architecture

*   **Frontend:** React.js with Tailwind CSS for a modern, responsive UI.
*   **Backend:** Python Flask for RESTful API.
*   **Database:** PostgreSQL.
*   **Data Processing:** Pandas for CSV parsing and data manipulation.
*   **Authentication:** Flask-Login for session-based, role-based access (admin/student).
*   **Deployment:** Docker for containerization.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   Docker and Docker Compose installed on your system.

### Installation and Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/aydenait2025/SmartRoomAssigner.git
    cd SmartRoomAssigner
    ```

2.  **Build and run the Docker containers:**
    This command will build the Docker images for the backend and frontend, start the PostgreSQL database, and run all services in detached mode.
    ```bash
    docker-compose up --build -d
    ```

3.  **Initialize the database:**
    After the containers are up, initialize the database schema and create a default admin user.
    ```bash
    curl http://localhost:5000/init-db
    ```
    *   **Default Admin Credentials:**
        *   Username: `admin`
        *   Password: `adminpassword`

### Accessing the Application

*   **Frontend (React App):** Open your web browser and navigate to `http://localhost:3000`.
*   **Backend (Flask API):** The API will be running on `http://localhost:5000`.

## Usage

### Admin Workflow

1.  **Login:** Go to `http://localhost:3000` and log in with the admin credentials (`admin`/`adminpassword`).
2.  **Room Management:**
    *   Navigate to the "Room Management" tab.
    *   Upload a CSV file or paste room data directly.
        *   **CSV Format:** `Building Name,Room Number,Room Capacity,Testing Capacity,Allowed flag`
        *   `Testing Capacity` is optional; if missing or empty, it defaults to `Room Capacity`.
        *   `Allowed flag` is optional; if missing or empty, it defaults to `True`.
    *   Preview and edit the data in the table.
    *   Click "Save Rooms to Database" to persist the data.
3.  **Student Management:**
    *   Navigate to the "Student Management" tab.
    *   Upload a CSV file or paste student data directly.
        *   **CSV Format:** Automatically detects "First Name, Last Name, Student Number, Student ID" or "Last Name, First Name, Student Number, Student ID".
    *   Preview and edit the data in the table.
    *   Click "Save Students to Database" to persist the data.
4.  **Assignment:**
    *   Navigate to the "Assignment" tab.
    *   Click "Assign Students to Rooms" to run the assignment algorithm.
    *   View the current assignments.
5.  **Reports:**
    *   Navigate to the "Reports" tab.
    *   View statistics on students per room and unassigned students.
    *   Click "Download CSV" to export the assignments.

### Student Workflow

1.  **Register (if not already registered):** Students can be registered by an admin or through a separate registration process (not yet implemented in UI, but backend endpoint `/register` exists).
2.  **Login:** Log in with student credentials (e.g., `student_id` as username and a password).
3.  **View Assignment:** The student dashboard will display their assigned exam room details.

## Development

### Backend (Flask)

*   **Location:** `./backend`
*   **Dependencies:** Listed in `backend/requirements.txt`
*   **Run locally (without Docker):**
    ```bash
    cd backend
    pip install -r requirements.txt
    export FLASK_APP=app.py
    export FLASK_ENV=development
    export DATABASE_URL="postgresql://user:password@localhost:5432/smartroomassign" # Adjust if your DB is not local
    flask run --host 0.0.0.0
    ```

### Frontend (React)

*   **Location:** `./frontend`
*   **Dependencies:** Listed in `frontend/package.json`
*   **Run locally (without Docker):**
    ```bash
    cd frontend
    npm install
    npm start
    ```

## Future Enhancements

*   Implement PDF generation for reports.
*   Add manual override functionality in the assignment UI.
*   Implement student registration UI.
*   Email/SMS notifications for student assignments.
*   More robust error handling and input validation.
*   Improved UI/UX for responsiveness and accessibility.
*   Unit and integration tests.

## Contributing

Feel free to fork the repository, make improvements, and submit pull requests.

## License

This project is licensed under the MIT License.
