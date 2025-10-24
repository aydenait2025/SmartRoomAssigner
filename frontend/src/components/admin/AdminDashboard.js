import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import AssignmentTab from "./AssignmentTab";

function AdminDashboard() {
  const navigate = useNavigate();
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [stats, setStats] = useState({
    total_buildings: 36,
    total_rooms: 3,
    available_rooms: 3,
    total_students: 0,
    active_exams: 0,
    assigned_students: 0,
    unassigned_students: 0,
  });
  const [loading, setLoading] = useState(true);
  const [criticalAlerts] = useState([
    {
      id: 1,
      type: "warning",
      title: "3 exams pending room assignment",
      message:
        "Calculus I, Physics II, Chemistry Lab require immediate attention",
      action: "Assign Now",
      actionHandler: () => navigate("/admin/assignment-tab"),
      icon: "⚠️",
      urgent: true,
    },
    {
      id: 2,
      type: "danger",
      title: "27 students unassigned for tomorrow's exam",
      message: "CS 301 Final Exam is under capacity. Student: data_to_go_here",
      action: "Resolve Now",
      actionHandler: () => setShowAssignmentModal(true),
      icon: "🚨",
      urgent: true,
      timeSensitive: true,
    },
    {
      id: 3,
      type: "info",
      title: "Room conflict detected",
      message: "MB-101 is double-booked for 2pm-4pm on Dec 10",
      action: "Review Conflicts",
      actionHandler: () => navigate("/admin/assignment-tab"),
      icon: "⚡",
      urgent: false,
    },
  ]);

  // Fetch real-time dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/dashboard/stats');
        setStats(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        setLoading(false);
      }
    };

    fetchStats();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AdminLayout title="">
      {/* Critical Alerts Section - Compact Design */}
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
            .filter((alert) => alert.urgent || alert.type === "info")
            .map((alert) => (
              <div
                key={alert.id}
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
                  <span className="text-xl flex-shrink-0">{alert.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 text-sm">
                        {alert.title}
                      </h3>
                      {alert.timeSensitive && (
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
                    onClick={alert.actionHandler}
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
              <span className="text-xs text-green-600 font-medium">
                {loading ? "" : `${stats.available_rooms} available`}
              </span>
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
              <p className="text-sm font-medium text-gray-600">Active Exams</p>
              <p className="text-2xl font-light text-gray-900">
                {loading ? "..." : stats.active_exams}
              </p>
              <span className="text-xs text-yellow-600 font-medium">
                Live count
              </span>
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
              <span className="text-xs text-purple-600 font-medium">
                {loading ? "" : `${stats.unassigned_students} unassigned`}
              </span>
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
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setShowAssignmentModal(true)}
              className="p-4 border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-colors duration-200"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🎯</div>
                <div className="font-medium text-gray-900">Smart Assign</div>
                <div className="text-xs text-gray-600 mt-1">
                  Auto-assign rooms
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
              onClick={() => navigate("/admin/course-management")}
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
            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-10 bg-blue-500 rounded mr-3"></div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  CS 301 Final Exam
                </div>
                <div className="text-sm text-gray-600">
                  MB-101 • 9:00 AM - 12:00 PM
                </div>
              </div>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                27 unassigned
              </span>
            </div>
            <div className="flex items-center p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-8 bg-green-500 rounded mr-3"></div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  MATH 201 Midterm
                </div>
                <div className="text-sm text-gray-600">
                  SH-201 • 1:00 PM - 3:00 PM
                </div>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Fully assigned
              </span>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-6 bg-gray-400 rounded mr-3"></div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">PHYS 101 Lab</div>
                <div className="text-sm text-gray-600">
                  LAB-A • 4:00 PM - 6:00 PM
                </div>
              </div>
              <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                Pending
              </span>
            </div>
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
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Sarah Johnson
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  CS 301
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 bg-blue-50 text-blue-800 px-2 py-1 rounded text-center font-medium">
                  MB-101
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  Main Building
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  Dec 10, 2025
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✅ Assigned
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Mike Chen
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  MATH 201
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 bg-green-50 text-green-800 px-2 py-1 rounded text-center font-medium">
                  SH-201
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  Science Hall
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  Nov 15, 2025
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✅ Assigned
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Emma Davis
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  PHYS 101
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  Unassigned
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  -
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  Dec 01, 2025
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    ⏳ Pending
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing recent assignments. Total: 247 assigned, 8 pending
          </div>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
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
