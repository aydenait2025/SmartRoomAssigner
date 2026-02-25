import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import AssignmentTab from "./AssignmentTab";

function AdminDashboard() {
  const navigate = useNavigate();
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [stats, setStats] = useState({
    total_buildings: 0,
    total_rooms: 0,
    available_rooms: 0,
    total_students: 0,
    active_exams: 0,
    assigned_students: 0,
    unassigned_students: 0,
  });
  const [loading, setLoading] = useState(true);
  const [criticalAlerts, setCriticalAlerts] = useState([]);
  const [todaysSchedule, setTodaysSchedule] = useState([]);
  const [recentAssignments, setRecentAssignments] = useState([]);

  // Smart Assignment State
  const [assigning, setAssigning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Fetch real-time dashboard data function
  const fetchAllData = async () => {
    try {
      const [statsResponse, alertsResponse, scheduleResponse, assignmentsResponse] = await Promise.allSettled([
        axios.get('/dashboard/stats'),
        axios.get('/dashboard/critical-alerts'),
        axios.get('/dashboard/todays-schedule'),
        axios.get('/dashboard/recent-assignments')
      ]);

      // Handle stats
      if (statsResponse.status === 'fulfilled') {
        setStats(statsResponse.value.data);
      } else {
        console.error('Failed to fetch dashboard stats:', statsResponse.reason);
      }

      // Handle critical alerts
      if (alertsResponse.status === 'fulfilled') {
        setCriticalAlerts(alertsResponse.value.data.alerts || []);
      } else {
        console.error('Failed to fetch critical alerts:', alertsResponse.reason);
        setCriticalAlerts([]);
      }

      // Handle today's schedule
      if (scheduleResponse.status === 'fulfilled') {
        setTodaysSchedule(scheduleResponse.value.data.todays_schedule || []);
      } else {
        console.error('Failed to fetch today\'s schedule:', scheduleResponse.reason);
        setTodaysSchedule([]);
      }

      // Handle recent assignments
      if (assignmentsResponse.status === 'fulfilled') {
        setRecentAssignments(assignmentsResponse.value.data.assignments || []);
      } else {
        console.error('Failed to fetch recent assignments:', assignmentsResponse.reason);
        setRecentAssignments([]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setLoading(false);
    }
  };

  // Handle Smart Assignment from Dashboard Quick Actions
  const handleSmartAssign = async () => {
    if (assigning) return;

    setMessage("");
    setError("");
    setAssigning(true);
    setProgress(0);
    setProgressMessage("Initializing smart assignment...");

    try {
      // Start progress simulation for advanced alphabetical algorithm
      const progressSteps = [
        { progress: 10, message: "Getting available rooms...", duration: 500 },
        { progress: 20, message: "Finding eligible students...", duration: 800 },
        { progress: 25, message: "Analyzing student data...", duration: 600 },
        { progress: 30, message: "Calculating optimal distribution...", duration: 800 },
        { progress: 40, message: "Sorting students alphabetically...", duration: 1000 },
        { progress: 45, message: "Creating alphabetical groups...", duration: 700 },
        { progress: 50, message: "Initializing room assignment...", duration: 500 },
        { progress: 90, message: "Assigning groups to rooms...", duration: 2000 },
        { progress: 95, message: "Saving assignments to database...", duration: 800 },
        { progress: 100, message: "Smart assignment complete! 🎯", duration: 300 },
      ];

      // Simulate progress steps
      for (const step of progressSteps) {
        await new Promise(resolve => setTimeout(resolve, step.duration));
        setProgress(step.progress);
        setProgressMessage(step.message);
      }

      // Make actual API call
      const response = await axios.post(
        "/api/assignments/smart-assign",
        {},
        { withCredentials: true },
      );

      setMessage(response.data.message || "Smart assignment completed successfully!");
      // Refresh dashboard data to show updated assignments
      await fetchAllData();

    } catch (err) {
      setError(err.response?.data?.error || "Smart assignment failed. Please try from the Assignments page.");
      setProgress(0);
      setProgressMessage("");
    } finally {
      setAssigning(false);
      // Clear progress after a delay
      setTimeout(() => {
        setProgress(0);
        setProgressMessage("");
      }, 2000);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchAllData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AdminLayout title="">
      {/* Critical Alerts Section - Only show when there are alerts */}
      {!loading && criticalAlerts && criticalAlerts.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">
              🚨 Urgent Actions Required
            </h2>
            <span className="text-sm text-gray-500">
              {criticalAlerts.filter((a) => a.urgent).length} high priority
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
            {criticalAlerts
              .filter((alert) => alert.urgent || alert.priority === "medium")
              .map((alert, index) => (
                <div
                  key={index}
                  className={`
                p-3 rounded-lg border-l-3 shadow-sm hover:shadow-md transition-shadow duration-200 ${
                  alert.type === "danger"
                    ? "bg-red-50 border-red-500"
                    : alert.type === "warning"
                      ? "bg-yellow-50 border-yellow-500"
                      : "bg-blue-50 border-blue-500"
                }
              `}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-xl flex-shrink-0">
                      {alert.type === "danger" ? "🚨" :
                       alert.type === "warning" ? "⚠️" : "ℹ️"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 text-sm">
                          {alert.title}
                        </h3>
                        {alert.time_sensitive && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 ml-2">
                            ⏰
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1 leading-tight">
                        {alert.message}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => navigate(alert.action_route)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-200 ${
                        alert.type === "danger"
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : alert.type === "warning"
                            ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      {alert.action}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Loading state for alerts */}
      {loading && (
        <div className="mb-6">
          <div className="text-center py-4">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <span className="ml-2 text-gray-600 text-sm">Loading alerts...</span>
          </div>
        </div>
      )}

      {/* Quick Stats Cards - Enhanced */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Buildings
              </p>
              <p className="text-2xl font-light text-gray-900">
                {loading ? "..." : stats.total_buildings}
              </p>
            </div>
            <div className="text-indigo-500 text-2xl">🏢</div>
          </div>
          <button
            onClick={() => navigate("/admin/buildings")}
            className="mt-3 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Manage Buildings →
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Rooms</p>
              <p className="text-2xl font-light text-gray-900">
                {loading ? "..." : stats.total_rooms}
              </p>
            </div>
            <div className="text-green-500 text-2xl">🚪</div>
          </div>
          <button
            onClick={() => navigate("/admin/room-management")}
            className="mt-3 text-xs text-green-600 hover:text-green-800 font-medium"
          >
            View Room Status →
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Courses</p>
              <p className="text-2xl font-light text-gray-900">
                {loading ? "..." : stats.active_exams}
              </p>
            </div>
            <div className="text-blue-500 text-2xl">📚</div>
          </div>
          <button
            onClick={() => navigate("/admin/assignment-tab")}
            className="mt-3 text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Manage Exams →
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Students
              </p>
              <p className="text-2xl font-light text-gray-900">
                {loading ? "..." : stats.total_students.toLocaleString()}
              </p>
            </div>
            <div className="text-purple-500 text-2xl">👥</div>
          </div>
          <button
            onClick={() => navigate("/admin/student-management")}
            className="mt-3 text-xs text-purple-600 hover:text-purple-800 font-medium"
          >
            View Students →
          </button>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            ⚡ Quick Actions
          </h3>

          {/* Progress Bar - Only show when smart assigning */}
          {assigning && progress > 0 && (
            <div className="mb-4 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="text-xl">🎯</div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-indigo-900">
                    Smart Assignment In Progress
                  </div>
                  <div className="text-xs text-indigo-700">
                    {progressMessage}
                  </div>
                </div>
                <div className="text-sm font-medium text-indigo-900">
                  {progress}%
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-indigo-200 rounded-full h-2 mb-2">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Success/Error Messages */}
          {message && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">{message}</p>
                </div>
                <div className="ml-auto pl-3">
                  <button onClick={() => setMessage("")} className="inline-flex text-green-800 hover:text-green-600">
                    ✕
                  </button>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
                <div className="ml-auto pl-3">
                  <button onClick={() => setError("")} className="inline-flex text-red-800 hover:text-red-600">
                    ✕
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleSmartAssign}
              disabled={assigning || loading}
              className={`p-4 border border-gray-200 rounded-lg transition-colors duration-200 ${
                assigning
                  ? 'bg-indigo-100 border-indigo-300'
                  : 'hover:bg-indigo-50 hover:border-indigo-300'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">{assigning ? '⏳' : '🎯'}</div>
                <div className="font-medium text-gray-900">
                  {assigning ? 'Assigning...' : 'Smart Assign'}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {assigning ? `${progressMessage}` : 'Auto-assign rooms'}
                </div>
              </div>
            </button>
            <button
              onClick={() => navigate("/admin/assignment-tab")}
              className="p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors duration-200"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">📝</div>
                <div className="font-medium text-gray-900">Manual Assign</div>
                <div className="text-xs text-gray-600 mt-1">
                  Custom assignments
                </div>
              </div>
            </button>
            <button
              onClick={() => navigate("/admin/schedule-management")}
              className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">📚</div>
                <div className="font-medium text-gray-900">Schedule Exam</div>
                <div className="text-xs text-gray-600 mt-1">
                  Create new exam
                </div>
              </div>
            </button>
            <button
              onClick={() => navigate("/admin/reports")}
              className="p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors duration-200"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">📊</div>
                <div className="font-medium text-gray-900">Generate Report</div>
                <div className="text-xs text-gray-600 mt-1">
                  Analytics & insights
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            📅 Today's Schedule
          </h3>
          <div className="space-y-3">
            {!loading && todaysSchedule.map((exam, index) => (
              <div key={index} className={`
                flex items-center p-3 rounded-lg ${
                  exam.status === "full" ? "bg-green-50" :
                  exam.status === "partial" ? "bg-blue-50" :
                  "bg-gray-50"
                }
              `}>
                <div className={`w-2 h-8 rounded mr-3 ${
                  exam.status === "full" ? "bg-green-500" :
                  exam.status === "partial" ? "bg-blue-500" :
                  "bg-gray-400"
                }`}></div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {exam.course_code} {exam.course_name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {exam.building_code}-{exam.room_number} • {exam.start_time.slice(0,5)} - {exam.end_time.slice(0,5)}
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  exam.unassigned_students > 0
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }`}>
                  {exam.unassigned_students > 0
                    ? `${exam.unassigned_students} unassigned`
                    : exam.status === "full" ? "Fully assigned" : "Pending"
                  }
                </span>
              </div>
            ))}
            {loading && (
              <div className="flex justify-center items-center py-8">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-2 text-gray-600">Loading schedule...</span>
              </div>
            )}
            {!loading && todaysSchedule.length === 0 && (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No exams today
                </h3>
                <p className="text-gray-600">
                  All caught up for today! 📅
                </p>
              </div>
            )}
          </div>
          <button
            onClick={() => navigate("/admin/schedule-management")}
            className="w-full mt-4 text-center text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            View Full Calendar →
          </button>
        </div>
      </div>

      {/* Admin Focus Areas: Recent Assignments */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-xl font-light text-gray-900 mb-6">
          📋 Recent Room Assignments
        </h2>
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Room
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Building
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {!loading && recentAssignments.map((assignment, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {assignment.student_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {assignment.course_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 bg-blue-50 text-blue-800 px-2 py-1 rounded text-center font-medium">
                    {assignment.room_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {assignment.building_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {assignment.exam_date || new Date().toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✅ Assigned
                    </span>
                  </td>
                </tr>
              ))}
              {loading && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <div className="flex justify-center items-center">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="ml-2 text-gray-600">Loading assignments...</span>
                    </div>
                  </td>
                </tr>
              )}
              {!loading && recentAssignments.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No recent assignments
                    </h3>
                    <p className="text-gray-600">
                      Recent room assignments will appear here.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {!loading ? `Showing ${recentAssignments.length} recent assignments` : "Loading..."}. Total assigned: {stats.assigned_students || 0}
          </div>
          <button onClick={() => navigate("/admin/assignment-tab")} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View all assignments →
          </button>
        </div>
      </div>

      {/* Smart Assignment Modal */}
      {showAssignmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-4xl h-5/6 overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                🎯 Smart Room Assignment
              </h2>
              <button
                onClick={() => setShowAssignmentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <AssignmentTab />
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminDashboard;
