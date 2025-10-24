import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import { useToast } from "../../hooks/useToast";

function StudentManagement() {
  const { successToast, errorToast } = useToast();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    locked: 0
  });
  const perPage = 10;

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'active', 'inactive'
  const [courseFilter, setCourseFilter] = useState("all"); // 'all' or specific course code
  const [sortBy, setSortBy] = useState("name"); // 'name', 'email', 'status', 'created'
  const [sortOrder, setSortOrder] = useState("asc"); // 'asc', 'desc'

  // Courses state for filter dropdown
  const [courses, setCourses] = useState([]);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    password: "",
  });

  const fetchStudents = async (page = 1) => {
    try {
      setLoading(true);
      let url = `/students?page=${page}&per_page=${perPage}`;

      // Add filter parameters
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }
      if (statusFilter !== 'all') {
        url += `&status=${statusFilter}`;
      }
      if (courseFilter !== 'all') {
        url += `&course=${encodeURIComponent(courseFilter)}`;
      }

      const response = await axios.get(url, { withCredentials: true });
      setStudents(response.data.students);
      setCurrentPage(response.data.current_page);
      setTotalPages(response.data.total_pages);
      setTotalItems(response.data.total_items);
      setStats(response.data.stats || { total: 0, active: 0, inactive: 0, locked: 0 });
    } catch (err) {
      setError(err.response?.data?.error || "");
    } finally {
      setLoading(false);
    }
  };

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
    fetchStudents(1);
  }, [searchTerm, statusFilter, courseFilter]);

  // Fetch courses for filter dropdown
  const fetchCourses = async () => {
    try {
      const response = await axios.get(`/courses?per_page=1000`, { withCredentials: true });
      setCourses(response.data.courses || []);
    } catch (err) {
      console.error("Failed to load courses:", err);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchStudents();
  }, []);

  const handleAddStudent = async () => {
    try {
      setError("");
      setMessage("");

      // Add student via API (will create user with role_id=2)
      const response = await axios.post("/students", newStudent, {
        withCredentials: true,
      });
      successToast("Student added successfully!", 3000);
      setShowAddModal(false);
      setNewStudent({
        name: "",
        email: "",
        password: "",
      });
      fetchStudents();
    } catch (err) {
      errorToast(err.response?.data?.error || "Failed to add student");
    }
  };

  const handleEditStudent = async () => {
    try {
      setError("");
      setMessage("");

      // Update student via API
      const response = await axios.put(
        `/students/${editingStudent.id}`,
        editingStudent,
        { withCredentials: true },
      );
      successToast("Student updated successfully!", 3000);
      setShowEditModal(false);
      setEditingStudent(null);
      fetchStudents();
    } catch (err) {
      errorToast(err.response?.data?.error || "Failed to update student");
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm("Are you sure you want to delete this student?"))
      return;

    try {
      setError("");
      setMessage("");

      await axios.delete(`/students/${studentId}`, { withCredentials: true });
      successToast("Student deleted successfully!", 3000);
      fetchStudents();
    } catch (err) {
      errorToast(err.response?.data?.error || "Failed to delete student");
    }
  };

  const openEditModal = (student) => {
    setEditingStudent({ ...student });
    setShowEditModal(true);
  };

  // Apply client-side sorting to already server-filtered results
  const getSortedStudents = () => {
    let sortedStudents = [...students];

    // Apply sorting
    sortedStudents.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "name":
          aValue = a.name;
          bValue = b.name;
          break;
        case "email":
          aValue = a.email;
          bValue = b.email;
          break;
        case "status":
          aValue = a.is_active ? 1 : 0;
          bValue = b.is_active ? 1 : 0;
          break;
        case "created":
          aValue = a.created_at;
          bValue = b.created_at;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return sortedStudents;
  };

  const filteredStudents = getSortedStudents();

  // File input ref for import (must be at top level, before any conditional returns)
  const fileInputRef = React.useRef(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-600">Loading students...</div>
      </div>
    );
  }

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleDownloadTemplate = () => {
    const csvHeaders = "name,email,password\n";
    const csvContent = csvHeaders + "John Doe,john.doe@university.edu,TempPassword123\n";

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'students_template.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError("Please select a CSV file");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setError("");
      setMessage("");
      setLoading(true);

      const response = await axios.post('/students/import-csv', formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage(`Students imported successfully! Added ${response.data.success || 0} students.`);
      fetchStudents(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.error || "Failed to import students");
    } finally {
      setLoading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <AdminLayout title="👥 Student Management">
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-gray-600">
          Manage student accounts and user information
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleDownloadTemplate}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            📋 Download Template
          </button>
          <button
            onClick={handleImportClick}
            disabled={loading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            📥 Upload CSV
          </button>
          <button
            onClick={() => window.open('/students/export-csv', '_blank')}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            📊 Export CSV
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            ➕ Add Student
          </button>
        </div>
      </div>

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
      />

      {message && <p className="text-green-500 mb-4">{message}</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Summary Stats */}
      <div className="mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div
            onClick={() => setStatusFilter('all')}
            className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
              statusFilter === 'all'
                ? 'bg-blue-100 border-blue-400 ring-2 ring-blue-300 scale-105'
                : 'bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300 hover:scale-102'
            }`}
          >
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Students</div>
          </div>
          <div
            onClick={() => setStatusFilter('active')}
            className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
              statusFilter === 'active'
                ? 'bg-green-100 border-green-400 ring-2 ring-green-300 scale-105'
                : 'bg-green-50 border-green-200 hover:bg-green-100 hover:border-green-300 hover:scale-102'
            }`}
          >
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div
            onClick={() => setStatusFilter('inactive')}
            className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
              statusFilter === 'inactive'
                ? 'bg-yellow-100 border-yellow-400 ring-2 ring-yellow-300 scale-105'
                : 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100 hover:border-yellow-300 hover:scale-102'
            }`}
          >
            <div className="text-2xl font-bold text-yellow-600">{stats.inactive}</div>
            <div className="text-sm text-gray-600">Inactive</div>
          </div>
          <div
            onClick={() => setStatusFilter('locked')}
            className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
              statusFilter === 'locked'
                ? 'bg-purple-100 border-purple-400 ring-2 ring-purple-300 scale-105'
                : 'bg-purple-50 border-purple-200 hover:bg-purple-100 hover:border-purple-300 hover:scale-102'
            }`}
          >
            <div className="text-2xl font-bold text-purple-600">{stats.locked}</div>
            <div className="text-sm text-gray-600">Locked Accounts</div>
          </div>
        </div>
        {statusFilter !== 'all' && (
<div className="mt-3 text-center space-x-3">
            {(statusFilter !== 'all' || courseFilter !== 'all') && (
              <>
                {statusFilter !== 'all' && (
                  <button
                    onClick={() => setStatusFilter('all')}
                    className="inline-flex items-center px-3 py-1 text-xs font-medium text-gray-700 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors"
                  >
                    Clear Status Filter ×
                  </button>
                )}
                {courseFilter !== 'all' && (
                  <button
                    onClick={() => setCourseFilter('all')}
                    className="inline-flex items-center px-3 py-1 text-xs font-medium text-gray-700 bg-orange-100 rounded-full hover:bg-orange-200 transition-colors"
                  >
                    Clear Course Filter ×
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 p-4 bg-white shadow-lg rounded-xl border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 px-4 text-xs border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors duration-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Filter
            </label>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="w-full h-10 px-4 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors duration-200"
            >
              <option value="all">All Courses</option>
              {courses.map((course) => (
                <option key={course.id} value={course.course_code}>
                  {course.course_code} - {course.course_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full h-10 px-4 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors duration-200"
            >
              <option value="name">Name</option>
              <option value="email">Email</option>
              <option value="status">Account Status</option>
              <option value="created">Created Date</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full h-10 px-4 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors duration-200"
            >
              <option value="asc">↑ Ascending</option>
              <option value="desc">↓ Descending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
        {students.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Students Found
            </h3>
            <p className="text-gray-600 mb-4">
              Add a new student or import student data to get started.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Add First Student
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Account Status
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Email Verified
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student, index) => {
                  const isActive = student.is_active;
                  const isLocked = student.is_locked;
                  const emailVerified = student.email_verified;

                  return (
                    <tr
                      key={student.id}
                      className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-colors`}
                    >
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {student.name}
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 bg-blue-100 px-2 py-1 rounded-full font-mono text-xs">
                          {student.email}
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-center">
                        <div className="flex flex-col items-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mb-0.5 ${
                              isActive && !isLocked
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {isLocked ? "🔒 Locked" : isActive ? "✅ Active" : "⏸️ Inactive"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="text-sm text-gray-700">
                          {student.last_login_at ? new Date(student.last_login_at).toLocaleDateString() : "Never"}
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            emailVerified
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {emailVerified ? "✓" : "○"}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="text-sm text-gray-700">
                          {student.created_at ? new Date(student.created_at).toLocaleDateString() : "N/A"}
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-center">
                        <div className="flex space-x-1">
                          <button
                            onClick={() => openEditModal(student)}
                            className="px-2 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600 transition-colors"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student.id)}
                            className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {students.length > 0 && (
        <div className="mt-6 flex justify-center items-center space-x-4">
          <button
            onClick={() => fetchStudents(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 disabled:opacity-50"
          >
            ← Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages} ({totalItems} total students)
          </span>
          <button
            onClick={() => fetchStudents(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 disabled:opacity-50"
          >
            Next →
          </button>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-bold mb-4">Add New Student</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newStudent.name}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, name: e.target.value })
                  }
                  className="w-full h-10 px-4 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors duration-200"
                  placeholder="e.g., John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={newStudent.email}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, email: e.target.value })
                  }
                  className="w-full h-10 px-4 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors duration-200"
                  placeholder="student@university.edu"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={newStudent.password}
                  onChange={(e) =>
                    setNewStudent({
                      ...newStudent,
                      password: e.target.value,
                    })
                  }
                  className="w-full h-10 px-4 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors duration-200"
                  placeholder="Temporary password"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleAddStudent}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Add Student
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditModal && editingStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-bold mb-4">Edit Student</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editingStudent.name}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      name: e.target.value,
                    })
                  }
                  className="w-full h-10 px-4 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={editingStudent.email}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      email: e.target.value,
                    })
                  }
                  className="w-full h-10 px-4 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Status
                </label>
                <select
                  value={editingStudent.is_active ? "active" : "inactive"}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      is_active: e.target.value === "active",
                    })
                  }
                  className="w-full h-10 px-4 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors duration-200"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleEditStudent}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Update Student
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default StudentManagement;
