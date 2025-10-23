import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import axios from "axios";
import ErrorBoundary from "./components/ErrorBoundary";
import Login from "./components/Login";
import Signup from "./components/Signup";
import StudentDashboard from "./components/student/StudentDashboard";
import AdminDashboard from "./components/admin/AdminDashboard";
import RoomManagement from "./components/admin/RoomManagement";
import StudentManagement from "./components/admin/StudentManagement";
import CourseManagement from "./components/admin/CourseManagement";
import AssignmentTab from "./components/admin/AssignmentTab";
import BuildingLocator from "./components/admin/BuildingLocator";
import ScheduleManagement from "./components/admin/ScheduleManagement";
import Reports from "./components/admin/Reports";
import Notifications from "./components/admin/Notifications";
import HelpSupport from "./components/admin/HelpSupport";
import Settings from "./components/admin/Settings";
import Documentation from "./components/admin/Documentation";

// Configure axios to use the API URL from environment variables
axios.defaults.baseURL =
  process.env.REACT_APP_API_URL || "http://localhost:5000";
axios.defaults.withCredentials = true;

function App() {
  // Proper authentication checks
  const isAuthenticated = () => {
    return !!localStorage.getItem("token");
  };

  const isAdmin = () => {
    return localStorage.getItem("userRole") === "admin";
  };

  const isStudent = () => {
    return localStorage.getItem("userRole") === "student";
  };

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-900 text-gray-100">
          {" "}
          {/* Apply dark theme here */}
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Student Routes */}
            <Route
              path="/student/dashboard"
              element={
                isStudent() ? <StudentDashboard /> : <Navigate to="/login" />
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                isAdmin() ? (
                  <AdminDashboard />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/admin/room-management"
              element={
                isAdmin() ? <RoomManagement /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/admin/student-management"
              element={
                isAdmin() ? <StudentManagement /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/admin/course-management"
              element={
                isAdmin() ? <CourseManagement /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/admin/schedule-management"
              element={
                isAdmin() ? <ScheduleManagement /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/admin/assignment-tab"
              element={isAdmin() ? <AssignmentTab /> : <Navigate to="/login" />}
            />
            <Route
              path="/admin/building-locator"
              element={
                isAdmin() ? <BuildingLocator /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/admin/reports"
              element={isAdmin() ? <Reports /> : <Navigate to="/login" />}
            />
            <Route
              path="/admin/notifications"
              element={isAdmin() ? <Notifications /> : <Navigate to="/login" />}
            />
            <Route
              path="/admin/help-support"
              element={isAdmin() ? <HelpSupport /> : <Navigate to="/login" />}
            />
            <Route
              path="/admin/settings"
              element={isAdmin() ? <Settings /> : <Navigate to="/login" />}
            />
            <Route
              path="/admin/documentation"
              element={isAdmin() ? <Documentation /> : <Navigate to="/login" />}
            />

            {/* Default Route */}
            <Route
              path="/"
              element={
                isAuthenticated() ? (
                  isAdmin() ? (
                    <Navigate to="/admin/dashboard" replace />
                  ) : (
                    <Navigate to="/student/dashboard" replace />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
