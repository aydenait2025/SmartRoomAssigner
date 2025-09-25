import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../Logo';

function AdminLayout({ children, title = "Dashboard" }) {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleLogout = () => {
    // Clear authentication data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('rememberedUsername');

    // Navigate to login page
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-900">
      {/* Vertical Dark Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-gray-900 text-white transition-all duration-300 ease-in-out flex flex-col shadow-lg`}>
        <div className="p-4 border-b border-gray-700">
          {/* Logo and Title */}
          <div className="flex items-center justify-between">
            <Logo collapsed={sidebarCollapsed} />
            <button
              onClick={toggleSidebar}
              className={`p-2 hover:bg-gray-800 rounded-lg transition-colors duration-200 ${sidebarCollapsed ? 'w-full flex justify-center' : ''}`}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarCollapsed ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7M19 19l-7-7 7-7"} />
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
            {/* Primary/High-frequency tasks at top */}
            <li>
              <Link to="/admin/dashboard" className={`flex items-center ${sidebarCollapsed ? 'justify-center' : ''} p-2 text-white hover:bg-gray-700 hover:text-blue-300 hover:scale-105 hover:shadow-lg transform transition-all duration-300 animate-pulse hover:animate-none rounded-lg`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0" />
                </svg>
                {!sidebarCollapsed && <span className="ml-2 text-sm">Dashboard</span>}
              </Link>
            </li>
            <li>
              <Link to="/admin/assignment-tab" className={`flex items-center ${sidebarCollapsed ? 'justify-center' : ''} p-2 text-white hover:bg-gray-700 hover:text-blue-300 hover:scale-105 hover:shadow-lg transform transition-all duration-300 rounded-lg`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                {!sidebarCollapsed && <span className="ml-2 text-sm">Assignments</span>}
              </Link>
            </li>

            {/* Core data management - most frequently used */}
            <li>
              <Link to="/admin/student-management" className={`flex items-center ${sidebarCollapsed ? 'justify-center' : ''} p-2 text-white hover:bg-gray-700 hover:text-blue-300 hover:scale-105 hover:shadow-lg transform transition-all duration-300 rounded-lg`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                {!sidebarCollapsed && <span className="ml-2 text-sm">Students</span>}
              </Link>
            </li>
            <li>
              <Link to="/admin/course-management" className={`flex items-center ${sidebarCollapsed ? 'justify-center' : ''} p-2 text-white hover:bg-gray-700 hover:text-blue-300 hover:scale-105 hover:shadow-lg transform transition-all duration-300 rounded-lg`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                </svg>
                {!sidebarCollapsed && <span className="ml-2 text-sm">Courses</span>}
              </Link>
            </li>

            {/* Infrastructure/facility management - less frequent */}
            <li>
              <Link to="/admin/room-management" className={`flex items-center ${sidebarCollapsed ? 'justify-center' : ''} p-2 text-white hover:bg-gray-700 hover:text-blue-300 hover:scale-105 hover:shadow-lg transform transition-all duration-300 rounded-lg`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 17V7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 11h12"/>
                </svg>
                {!sidebarCollapsed && <span className="ml-2 text-sm">Rooms</span>}
              </Link>
            </li>
            <li>
              <Link to="/admin/building-locator" className={`flex items-center ${sidebarCollapsed ? 'justify-center' : ''} p-2 text-white hover:bg-gray-700 hover:text-blue-300 hover:scale-105 hover:shadow-lg transform transition-all duration-300 rounded-lg`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
                {!sidebarCollapsed && <span className="ml-2 text-sm">Buildings</span>}
              </Link>
            </li>

            {/* Analysis & Reporting */}
            <li>
              <Link to="/admin/reports" className={`flex items-center ${sidebarCollapsed ? 'justify-center' : ''} p-2 text-white hover:bg-gray-700 hover:text-blue-300 hover:scale-105 hover:shadow-lg transform transition-all duration-300 rounded-lg`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
                {!sidebarCollapsed && <span className="ml-2 text-sm">Reports</span>}
              </Link>
            </li>

            {/* Separator */}
            {!sidebarCollapsed && <li className="pt-4"><hr className="border-gray-700" /></li>}

            {/* Additional menu items */}
            <li>
              <Link className={`flex items-center ${sidebarCollapsed ? 'justify-center' : ''} p-2 text-white hover:bg-gray-700 hover:text-blue-300 hover:scale-105 hover:shadow-lg transform transition-all duration-300 rounded-lg`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 6.5A6.5 6.5 0 0119.5 13m0 0a6.5 6.5 0 01-6.5 6.5"/>
                </svg>
                {!sidebarCollapsed && <span className="ml-2 text-sm">Notifications</span>}
              </Link>
            </li>
            <li>
              <Link className={`flex items-center ${sidebarCollapsed ? 'justify-center' : ''} p-2 text-white hover:bg-gray-700 hover:text-blue-300 hover:scale-105 hover:shadow-lg transform transition-all duration-300 rounded-lg`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                {!sidebarCollapsed && <span className="ml-2 text-sm">Help & Support</span>}
              </Link>
            </li>
            <li>
              <Link className={`flex items-center ${sidebarCollapsed ? 'justify-center' : ''} p-2 text-white hover:bg-gray-700 hover:text-blue-300 hover:scale-105 hover:shadow-lg transform transition-all duration-300 rounded-lg`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                {!sidebarCollapsed && <span className="ml-2 text-sm">Settings</span>}
              </Link>
            </li>
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
                  <p className="text-xs font-medium text-white truncate">Admin User</p>
                  <p className="text-xs text-white truncate">Administrator</p>
                </div>
              </div>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="flex items-center p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors duration-200"
                title="Logout"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
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
