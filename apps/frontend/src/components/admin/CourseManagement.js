import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";

function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const perPage = 10;

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'assigned', 'unassigned'
  const [sortBy, setSortBy] = useState("name"); // 'name', 'code', 'students', 'status'
  const [sortOrder, setSortOrder] = useState("asc"); // 'asc', 'desc'
  const [showAll, setShowAll] = useState(false); // Toggle between paginated and all courses

  // Departments state for dropdown
  const [departments, setDepartments] = useState([]);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [newCourse, setNewCourse] = useState({
    course_code: "",
    course_name: "",
    department_id: "", // Changed to department_id
    expected_students: 0,
  });

  const fetchCourses = async (page = 1) => {
    try {
      setLoading(true);
      // Fetch all courses to support client-side filtering and pagination
      // Note: In production, consider backend filtering pagination for better performance
      const response = await axios.get(
        `/courses?per_page=1000`, // Fetch all courses for client-side filtering
        { withCredentials: true },
      );
      setCourses(response.data.courses || []);
      setTotalItems(response.data.courses ? response.data.courses.length : 0);
      // We'll handle pagination client-side for better filtering UX
      setTotalPages(Math.ceil((response.data.courses || []).length / perPage));
    } catch (err) {
      setError(err.response?.data?.error || "");
      setCourses([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch departments for dropdown
  const fetchDepartments = async () => {
    try {
      const response = await axios.get("/departments", { withCredentials: true });
      setDepartments(response.data.departments || []);
    } catch (err) {
      console.error("Failed to fetch departments:", err);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchCourses();
  }, []); // Fetch once, since we now paginate client-side

  useEffect(() => {
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortBy, sortOrder]);

  const handleAddCourse = async () => {
    try {
      setError("");
      setMessage("");

      // Add course via API
      const response = await axios.post("/courses", newCourse, {
        withCredentials: true,
      });
      setMessage("Course added successfully!");
      setShowAddModal(false);
      setNewCourse({
        course_code: "",
        course_name: "",
        department_id: "",
        expected_students: 0,
      });
      fetchCourses();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add course");
    }
  };

  const handleEditCourse = async () => {
    try {
      setError("");
      setMessage("");

      // Update course via API
      const response = await axios.put(
        `/courses/${editingCourse.id}`,
        editingCourse,
        { withCredentials: true },
      );
      setMessage("Course updated successfully!");
      setShowEditModal(false);
      setEditingCourse(null);
      fetchCourses();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update course");
    }
  };



  const openEditModal = (course) => {
    setEditingCourse({
      ...course,
      department_id: course.department_id || "" // Ensure department_id is set
    });
    setShowEditModal(true);
  };

  // Filter and sort courses
  const getFilteredCourses = () => {
    let filteredCourses = [...courses];

    // Apply search filter
    if (searchTerm) {
      filteredCourses = filteredCourses.filter(
        (course) =>
          course.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.department.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filteredCourses = filteredCourses.filter((course) => {
        switch (statusFilter) {
          case "assigned":
            return course.assigned_students >= course.expected_students;
          case "unassigned":
            return course.assigned_students < course.expected_students;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filteredCourses.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "name":
          aValue = a.course_name;
          bValue = b.course_name;
          break;
        case "code":
          aValue = a.course_code;
          bValue = b.course_code;
          break;
        case "students":
          aValue = a.expected_students;
          bValue = b.expected_students;
          break;
        case "status":
          aValue = a.assigned_students >= a.expected_students ? 1 : 0;
          bValue = b.assigned_students >= b.expected_students ? 1 : 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filteredCourses;
  };

  const filteredCourses = getFilteredCourses();

  // Paginate filtered courses
  const getPaginatedCourses = () => {
    const startIndex = (currentPage - 1) * perPage;
    const endIndex = startIndex + perPage;
    return filteredCourses.slice(startIndex, endIndex);
  };

  const paginatedCourses = getPaginatedCourses();
  const filteredTotalPages = Math.ceil(filteredCourses.length / perPage);

  // File input ref for import (must be at top level, before any conditional returns)
  const fileInputRef = React.useRef(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-600">Loading courses...</div>
      </div>
    );
  }

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleDownloadTemplate = () => {
    const csvHeaders = "course_code,course_name,department,expected_students\n";
    const csvContent = csvHeaders;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'courses_template.csv');
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

      const response = await axios.post('/courses/import-csv', formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage(`Courses imported successfully! Added ${response.data.success} courses.`);
      fetchCourses(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.error || "Failed to import courses");
    } finally {
      setLoading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleExportCsv = () => {
    const headers = "course_code,course_name,department,expected_students,assigned_students\n";
    const csvContent = headers + filteredCourses.map(course =>
      `"${course.course_code}","${course.course_name}","${course.department}",${course.expected_students},${course.assigned_students}`
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'courses_export.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <AdminLayout title="📚 Course Management">
      <div className="flex items-center justify-end mb-6">
        <div className="flex flex-wrap items-center gap-3">
          {filteredCourses.length > perPage && (
            <button
              onClick={() => {
                setShowAll(!showAll);
                if (!showAll) {
                  setCurrentPage(1); // Reset to first page when switching to paginated view
                }
              }}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {showAll ? "🔽 Show Less (10 per page)" : `🔼 Show All (${filteredCourses.length} courses)`}
            </button>
          )}
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
            onClick={handleExportCsv}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            📊 Export CSV
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            ➕ Add Course
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div
            className="bg-blue-50 p-4 rounded-lg border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors"
            onClick={() => setStatusFilter('all')}
          >
            <div className="text-2xl font-bold text-blue-600">{totalItems}</div>
            <div className="text-sm text-gray-600">Total Courses</div>
          </div>
          <div
            className="bg-green-50 p-4 rounded-lg border border-green-200 cursor-pointer hover:bg-green-100 transition-colors"
            onClick={() => setStatusFilter('assigned')}
          >
            <div className="text-2xl font-bold text-green-600">
              {
                courses.filter(
                  (c) => c.assigned_students >= c.expected_students,
                ).length
              }
            </div>
            <div className="text-sm text-gray-600">Fully Assigned</div>
          </div>
          <div
            className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 cursor-pointer hover:bg-yellow-100 transition-colors"
            onClick={() => setStatusFilter('unassigned')}
          >
            <div className="text-2xl font-bold text-yellow-600">
              {
                courses.filter((c) => c.assigned_students < c.expected_students)
                  .length
              }
            </div>
            <div className="text-sm text-gray-600">Partially Assigned</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="text-2xl font-bold text-orange-600">
              {courses.filter((c) => c.assigned_students < c.expected_students).length > 0 ?
                Math.round(
                  (courses.filter((c) => c.assigned_students >= c.expected_students).length /
                   courses.length) * 100
                ) : 100}
              %
            </div>
            <div className="text-sm text-gray-600">Courses Assigned</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="text-2xl font-bold text-purple-600">
              {courses.reduce((sum, c) => sum + c.assigned_students, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Enrolled Students</div>
          </div>
        </div>
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
              placeholder="Course code, name, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 px-4 text-xs border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors duration-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seating Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-10 px-4 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors duration-200"
            >
              <option value="all">All Courses</option>
              <option value="assigned">Fully Assigned</option>
              <option value="unassigned">Partially Assigned</option>
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
              <option value="name">Course Name</option>
              <option value="code">Course Code</option>
              <option value="students">Enrollment</option>
              <option value="status">Seating Status</option>
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

      {/* Courses Table */}
      <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
        {filteredCourses.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Courses Found
            </h3>
            <p className="text-gray-600 mb-4">
              Add a new course or import course data to get started.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Add First Course
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Course Code
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Course Name
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Enrollment
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Assigned Students
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Seating Status
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(showAll ? filteredCourses : paginatedCourses).map((course, index) => {
                  const isFullyAssigned =
                    course.assigned_students >= course.expected_students;
                  const assignmentRate =
                    course.expected_students > 0
                      ? Math.round(
                          (course.assigned_students /
                            course.expected_students) *
                            100,
                        )
                      : 0;

                  return (
                    <tr
                      key={course.id}
                      className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-colors`}
                    >
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {course.course_code}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {course.course_name}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {course.department}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-center">
                      <span className="text-sm font-medium text-gray-900">
                        {course.expected_students}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        {course.assigned_students}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-12 bg-gray-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${isFullyAssigned ? "bg-green-500" : "bg-yellow-500"}`}
                            style={{
                              width: `${Math.min(assignmentRate, 100)}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600">
                          {assignmentRate}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-center">
                      <button
                        onClick={() => openEditModal(course)}
                        className="px-2 py-1 text-sm"
                      >
                        ✏️
                      </button>
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
      {filteredTotalPages > 1 && !showAll && (
        <div className="mt-6 flex justify-center items-center space-x-4">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 disabled:opacity-50"
          >
            ← Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {filteredTotalPages} ({filteredCourses.length} filtered courses)
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(filteredTotalPages, currentPage + 1))}
            disabled={currentPage === filteredTotalPages}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 disabled:opacity-50"
          >
            Next →
          </button>
        </div>
      )}

      {/* Add Course Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-bold mb-4">Add New Course</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Code
                </label>
                <input
                  type="text"
                  value={newCourse.course_code}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, course_code: e.target.value })
                  }
                  className="w-full h-10 px-4 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors duration-200"
                  placeholder="e.g., CSC108"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Name
                </label>
                <input
                  type="text"
                  value={newCourse.course_name}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, course_name: e.target.value })
                  }
                  className="w-full h-10 px-4 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors duration-200"
                  placeholder="e.g., Introduction to Computer Science"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <select
                  value={newCourse.department_id}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, department_id: e.target.value })
                  }
                  className="w-full h-10 px-4 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors duration-200"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.department_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enrollment
                </label>
                <input
                  type="number"
                  value={newCourse.expected_students}
                  onChange={(e) =>
                    setNewCourse({
                      ...newCourse,
                      expected_students: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full h-10 px-4 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors duration-200"
                  placeholder="e.g., 200"
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
                onClick={handleAddCourse}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Add Course
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {showEditModal && editingCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-bold mb-4">Edit Course</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Code
                </label>
                <input
                  type="text"
                  value={editingCourse.course_code}
                  onChange={(e) =>
                    setEditingCourse({
                      ...editingCourse,
                      course_code: e.target.value,
                    })
                  }
                  className="w-full h-10 px-4 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Name
                </label>
                <input
                  type="text"
                  value={editingCourse.course_name}
                  onChange={(e) =>
                    setEditingCourse({
                      ...editingCourse,
                      course_name: e.target.value,
                    })
                  }
                  className="w-full h-10 px-4 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <select
                  value={editingCourse.department_id || ""}
                  onChange={(e) =>
                    setEditingCourse({
                      ...editingCourse,
                      department_id: e.target.value,
                    })
                  }
                  className="w-full h-10 px-4 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors duration-200"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.department_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enrollment
                </label>
                <input
                  type="number"
                  value={editingCourse.expected_students}
                  onChange={(e) =>
                    setEditingCourse({
                      ...editingCourse,
                      expected_students: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full h-10 px-4 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors duration-200"
                />
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
                onClick={handleEditCourse}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Update Course
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default CourseManagement;
