import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import StudentDashboard from './components/student/StudentDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import RoomManagement from './components/admin/RoomManagement';
import StudentManagement from './components/admin/StudentManagement';
import CourseManagement from './components/admin/CourseManagement';
import AssignmentTab from './components/admin/AssignmentTab';
import BuildingLocator from './components/admin/BuildingLocator';
import ScheduleManagement from './components/admin/ScheduleManagement';
import Reports from './components/admin/Reports';

function App() {
  // This is a placeholder for authentication logic.
  // In a real application, you would check for a token or user session.
  const isAuthenticated = () => {
    // Temporarily return true for testing the admin dashboard
    return true;
    // return localStorage.getItem('token') !== null;
  };

  const isAdmin = () => {
    // Temporarily return true for testing the admin dashboard
    return true;
    // return localStorage.getItem('userRole') === 'admin';
  };

  const isStudent = () => {
    return localStorage.getItem('userRole') === 'student';
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-gray-100"> {/* Apply dark theme here */}
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Student Routes */}
          <Route 
            path="/student/dashboard" 
            element={isStudent() ? <StudentDashboard /> : <Navigate to="/login" />} 
          />

          {/* Admin Routes */}
          <Route 
            path="/admin/dashboard" 
            element={isAdmin() ? <AdminDashboard /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/admin/room-management" 
            element={isAdmin() ? <RoomManagement /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/admin/student-management" 
            element={isAdmin() ? <StudentManagement /> : <Navigate to="/login" />} 
          />
          <Route
            path="/admin/course-management"
            element={isAdmin() ? <CourseManagement /> : <Navigate to="/login" />}
          />
          <Route
            path="/admin/schedule-management"
            element={isAdmin() ? <ScheduleManagement /> : <Navigate to="/login" />}
          />
          <Route
            path="/admin/assignment-tab"
            element={isAdmin() ? <AssignmentTab /> : <Navigate to="/login" />}
          />
          <Route 
            path="/admin/building-locator" 
            element={isAdmin() ? <BuildingLocator /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/admin/reports" 
            element={isAdmin() ? <Reports /> : <Navigate to="/login" />} 
          />

          {/* Default Route */}
          <Route 
            path="/" 
            element={
              isAuthenticated() ? (
                isAdmin() ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/student/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
