import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../Logo";

function AdminLayout({ children, title = "Dashboard" }) {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleLogout = () => {
    // Clear ALL authentication data from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("rememberedUsername");
    localStorage.removeItem("loginTime");
    localStorage.removeItem("rememberMe");

    // Navigate to login page
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-900">
      {/* Vertical Dark Sidebar */}
      <aside
        className={`${sidebarCollapsed ? "w-16" : "w-64"} bg-gray-900 text-white transition-all duration-300 ease-in-out flex flex-col shadow-lg`}
      >
        <div className="p-4 border-b border-gray-700">
          {/* Logo and Title */}
          <div className="flex items-center justify-between">
            <Logo collapsed={sidebarCollapsed} />
            <button
              onClick={toggleSidebar}
              className={`p-2 hover:bg-gray-800 rounded-lg transition-colors duration-200 ${sidebarCollapsed ? "w-full flex justify-center" : ""}`}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    sidebarCollapsed
                      ? "M13 5l7 7-7 7M5 5l7 7-7 7"
                      : "M11 19l-7-7 7-7M19 19l-7-7 7-7"
                  }
                />
              </svg>
            </button>
          </div>

          {/* Search Bar */}
          {!sidebarCollapsed && (
            <div className="mt-4 mb-2">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-2 py-1.5 bg-gray-800 text-white placeholder-gray-400 rounded-full border border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          )}
        </div>

        <nav className="flex-1 p-2">
          <div className="space-y-6">
            {/* Main Navigation */}
            <div>
              {/* Dashboard */}
              <Link
                to="/admin/dashboard"
                className={`flex items-center ${sidebarCollapsed ? "justify-center px-2" : "px-3"} py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-all duration-200 group`}
              >
                <svg
                  className="w-5 h-5 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0M9 21v-4a2 2 0 012-2h2a2 2 0 012 2v4"
                  />
                </svg>
                {!sidebarCollapsed && (
                  <span className="ml-3 text-sm font-medium">Dashboard</span>
                )}
              </Link>

              {/* Schedule Management */}
              <Link
                to="/admin/assignment-tab"
                className={`flex items-center ${sidebarCollapsed ? "justify-center px-2" : "px-3"} py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-all duration-200 group`}
              >
                <svg
                  className="w-5 h-5 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
                {!sidebarCollapsed && (
                  <span className="ml-3 text-sm font-medium">Schedule</span>
                )}
              </Link>
            </div>

            {/* Management Section */}
            {!sidebarCollapsed && (
              <div>
                <div className="px-2 mb-2">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Management
                  </h3>
                </div>
                <div className="space-y-1">
                  <Link
                    to="/admin/student-management"
                    className="flex items-center px-3 py-2.5 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-all duration-200"
                  >
                    <svg
                      className="w-4 h-4 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                      />
                    </svg>
                    <span className="ml-3 text-sm">Students</span>
                  </Link>
                  <Link
                    to="/admin/department-management"
                    className="flex items-center px-3 py-2.5 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-all duration-200"
                  >
                    <svg
                      className="w-4 h-4 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    <span className="ml-3 text-sm">Departments</span>
                  </Link>
                  <Link
                    to="/admin/course-management"
                    className="flex items-center px-3 py-2.5 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-all duration-200"
                  >
                    <svg
                      className="w-4 h-4 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                    <span className="ml-3 text-sm">Courses</span>
                  </Link>
                  <Link
                    to="/admin/room-management"
                    className="flex items-center px-3 py-2.5 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-all duration-200"
                  >
                    <svg
                      className="w-4 h-4 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    <span className="ml-3 text-sm">Rooms</span>
                  </Link>
                  <Link
                    to="/admin/building-locator"
                    className="flex items-center px-3 py-2.5 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-all duration-200"
                  >
                    <svg
                      className="w-4 h-4 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2h5m8-10h2a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6a2 2 0 012-2h6m-4-4h.01"
                      />
                    </svg>
                    <span className="ml-3 text-sm">Buildings</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Analytics Section */}
            {!sidebarCollapsed && (
              <div>
                <div className="px-2 mb-2">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Analytics
                  </h3>
                </div>
                <Link
                  to="/admin/reports"
                  className="flex items-center px-3 py-2.5 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-all duration-200"
                >
                  <svg
                    className="w-4 h-4 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <span className="ml-3 text-sm">Reports</span>
                </Link>
              </div>
            )}

            {/* System Section */}
            {!sidebarCollapsed && (
              <div>
                <div className="px-2 mb-2">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    System
                  </h3>
                </div>
                <div className="space-y-1">
                  <Link
                    to="/admin/settings"
                    className="flex items-center px-3 py-2.5 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-all duration-200"
                  >
                    <svg
                      className="w-4 h-4 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="ml-3 text-sm">Settings</span>
                  </Link>
                  <Link
                    to="/admin/notifications"
                    className="flex items-center px-3 py-2.5 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-all duration-200"
                  >
                    <svg
                      className="w-4 h-4 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-5 5v-5zM4.868 12.683A17.925 17.925 0 0112 21c7.962 0 12-1.21 12-2.683m-12 2.683a17.925 17.925 0 01-7.132-8.317M12 21c4.411 0 8-4.03 8-9s-3.589-9-8-9-8 4.03-8 9a9.06 9.06 0 001.832 5.683L4 21l4.868-8.317z"
                      />
                    </svg>
                    <span className="ml-3 text-sm">Notifications</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Collapsed Icons - Show all navigation when sidebar is collapsed */}
          {sidebarCollapsed && (
            <div className="space-y-2 mt-4">
              {/* Students */}
              <Link
                to="/admin/student-management"
                className="flex justify-center py-2 px-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200"
                title="Students"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </Link>

              {/* Departments */}
              <Link
                to="/admin/department-management"
                className="flex justify-center py-2 px-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200"
                title="Departments"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </Link>

              {/* Courses */}
              <Link
                to="/admin/course-management"
                className="flex justify-center py-2 px-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200"
                title="Courses"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </Link>

              {/* Rooms */}
              <Link
                to="/admin/room-management"
                className="flex justify-center py-2 px-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200"
                title="Rooms"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </Link>

              {/* Buildings */}
              <Link
                to="/admin/building-locator"
                className="flex justify-center py-2 px-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200"
                title="Buildings"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2h5m8-10h2a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6a2 2 0 012-2h6m-4-4h.01"
                  />
                </svg>
              </Link>

              {/* Reports */}
              <Link
                to="/admin/reports"
                className="flex justify-center py-2 px-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200"
                title="Reports"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </Link>

              {/* Settings */}
              <Link
                to="/admin/settings"
                className="flex justify-center py-2 px-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200"
                title="Settings"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </Link>

              {/* Notifications */}
              <Link
                to="/admin/notifications"
                className="flex justify-center py-2 px-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200"
                title="Notifications"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-5 5v-5zM4.868 12.683A17.925 17.925 0 0112 21c7.962 0 12-1.21 12-2.683m-12 2.683a17.925 17.925 0 01-7.132-8.317M12 21c4.411 0 8-4.03 8-9s-3.589-9-8-9-8 4.03-8 9a9.06 9.06 0 001.832 5.683L4 21l4.868-8.317z"
                  />
                </svg>
              </Link>

              {/* Help & Support */}
              <Link
                to="/admin/help-support"
                className="flex justify-center py-2 px-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200"
                title="Help & Support"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </Link>

              {/* Documentation */}
              <Link
                to="/admin/documentation"
                className="flex justify-center py-2 px-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200"
                title="Documentation"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </Link>

              {/* Separator */}
              <div className="border-t border-gray-700 my-2"></div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex justify-center py-2 px-2 text-gray-400 hover:text-white hover:bg-red-600 rounded-lg transition-all duration-200 w-full"
                title="Logout"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </div>
          )}
        </nav>

        {/* Footer with user profile and logout */}
        {!sidebarCollapsed && (
          <div className="p-3 border-t border-gray-700">
            <div className="flex items-center justify-between">
              {/* User profile section */}
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">
                  👤
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">
                    Admin User
                  </p>
                  <p className="text-xs text-white truncate">Administrator</p>
                </div>
              </div>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="flex items-center p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors duration-200"
                title="Logout"
              >
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 pt-2 pr-2 pb-2 pl-2 overflow-y-auto">
        <div className="bg-white rounded-[8px] shadow-[0_2px_10px_rgba(0,0,0,0.05)] p-6 md:p-8 min-h-[calc(100vh-1rem)]">
          <div className="mb-8">
            <h1 className="text-3xl font-light text-gray-900 mb-2">{title}</h1>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
