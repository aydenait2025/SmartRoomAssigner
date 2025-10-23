import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../Logo";

function AdminLayout({ children, title = "Dashboard" }) {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [academicResourcesOpen, setAcademicResourcesOpen] = useState(false);
  const [facilitiesOpen, setFacilitiesOpen] = useState(false);
  const [systemOpen, setSystemOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleLogout = () => {
    // Clear authentication data from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("rememberedUsername");

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
          <ul className="space-y-0.5">
            {/* Dashboard */}
            <li>
              <Link
                to="/admin/dashboard"
                className={`flex items-center ${sidebarCollapsed ? "justify-center" : ""} p-2 text-white hover:bg-gray-700 hover:text-blue-300 rounded-lg`}
              >
                {/* Icon */}
                {!sidebarCollapsed && <span className="ml-2 text-sm">Dashboard</span>}
              </Link>
            </li>
            {/* Assignments */}
            <li>
              <Link
                to="/admin/assignment-tab"
                className={`flex items-center ${sidebarCollapsed ? "justify-center" : ""} p-2 text-white hover:bg-gray-700 hover:text-blue-300 rounded-lg`}
              >
                {/* Icon */}
                {!sidebarCollapsed && <span className="ml-2 text-sm">Assignments</span>}
              </Link>
            </li>

            {/* Academic Resources */}
            {!sidebarCollapsed && (
              <li>
                <button
                  onClick={() => setAcademicResourcesOpen(!academicResourcesOpen)}
                  className="flex items-center justify-between w-full p-2 text-white hover:bg-gray-700 rounded-lg"
                >
                  <span className="text-sm">Academic Resources</span>
                  {/* Chevron Icon */}
                </button>
                {academicResourcesOpen && (
                  <ul className="pl-4">
                    <li><Link to="/admin/student-management" className="block p-2 text-white hover:bg-gray-700 rounded-lg">Students</Link></li>
                    <li><Link to="/admin/course-management" className="block p-2 text-white hover:bg-gray-700 rounded-lg">Courses</Link></li>
                    <li><Link to="/admin/exam-management" className="block p-2 text-white hover:bg-gray-700 rounded-lg">Exams</Link></li>
                  </ul>
                )}
              </li>
            )}

            {/* Facilities */}
            {!sidebarCollapsed && (
              <li>
                <button
                  onClick={() => setFacilitiesOpen(!facilitiesOpen)}
                  className="flex items-center justify-between w-full p-2 text-white hover:bg-gray-700 rounded-lg"
                >
                  <span className="text-sm">Facilities</span>
                  {/* Chevron Icon */}
                </button>
                {facilitiesOpen && (
                  <ul className="pl-4">
                    <li><Link to="/admin/building-locator" className="block p-2 text-white hover:bg-gray-700 rounded-lg">Buildings</Link></li>
                    <li><Link to="/admin/room-management" className="block p-2 text-white hover:bg-gray-700 rounded-lg">Rooms</Link></li>
                  </ul>
                )}
              </li>
            )}

            {/* Reports */}
            <li>
              <Link
                to="/admin/reports"
                className={`flex items-center ${sidebarCollapsed ? "justify-center" : ""} p-2 text-white hover:bg-gray-700 hover:text-blue-300 rounded-lg`}
              >
                {/* Icon */}
                {!sidebarCollapsed && <span className="ml-2 text-sm">Reports</span>}
              </Link>
            </li>

            {/* Separator */}
            {!sidebarCollapsed && <li className="pt-4"><hr className="border-gray-700" /></li>}

            {/* System */}
            {!sidebarCollapsed && (
              <li>
                <button
                  onClick={() => setSystemOpen(!systemOpen)}
                  className="flex items-center justify-between w-full p-2 text-white hover:bg-gray-700 rounded-lg"
                >
                  <span className="text-sm">System</span>
                  {/* Chevron Icon */}
                </button>
                {systemOpen && (
                  <ul className="pl-4">
                    <li><Link to="/admin/notifications" className="block p-2 text-white hover:bg-gray-700 rounded-lg">Notifications</Link></li>
                    <li><Link to="/admin/settings" className="block p-2 text-white hover:bg-gray-700 rounded-lg">Settings</Link></li>
                    <li><Link to="/admin/help-support" className="block p-2 text-white hover:bg-gray-700 rounded-lg">Help & Support</Link></li>
                    <li><Link to="/admin/documentation" className="block p-2 text-white hover:bg-gray-700 rounded-lg">Documentation</Link></li>
                  </ul>
                )}
              </li>
            )}
          </ul>
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
