import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import { useToast } from "../../hooks/useToast";

function DepartmentManagement() {
  const { successToast, errorToast } = useToast();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const perPage = 10;

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'active', 'inactive'
  const [sortBy, setSortBy] = useState("name"); // 'name', 'code', 'created'
  const [sortOrder, setSortOrder] = useState("asc"); // 'asc', 'desc'

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [newDepartment, setNewDepartment] = useState({
    department_code: "",
    department_name: "",
    faculty_name: "",
    email_domain: "",
    website_url: "",
    budget_code: "",
    headcount_limit: "",
  });

  const fetchDepartments = async (page = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/departments?page=${page}&per_page=${perPage}`,
        { withCredentials: true },
      );
      setDepartments(response.data.departments);
      setCurrentPage(response.data.current_page);
      setTotalPages(response.data.total_pages);
      setTotalItems(response.data.total_items);
    } catch (err) {
      setError(err.response?.data?.error || "");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleAddDepartment = async () => {
    try {
      setError("");
      setMessage("");

      // Add department via API
      const response = await axios.post("/departments", {
        ...newDepartment,
        headcount_limit: newDepartment.headcount_limit ? parseInt(newDepartment.headcount_limit) : null,
      }, {
        withCredentials: true,
      });
      successToast("Department added successfully!", 3000);
      setShowAddModal(false);
      setNewDepartment({
        department_code: "",
        department_name: "",
        faculty_name: "",
        email_domain: "",
        website_url: "",
        budget_code: "",
        headcount_limit: "",
      });
      fetchDepartments();
    } catch (err) {
      errorToast(err.response?.data?.error || "Failed to add department");
    }
  };

  const handleEditDepartment = async () => {
    try {
      setError("");
      setMessage("");

      // Update department via API
      const response = await axios.put(
        `/departments/${editingDepartment.id}`,
        {
          ...editingDepartment,
          headcount_limit: editingDepartment.headcount_limit ? parseInt(editingDepartment.headcount_limit) : null,
        },
        { withCredentials: true },
      );
      successToast("Department updated successfully!", 3000);
      setShowEditModal(false);
      setEditingDepartment(null);
      fetchDepartments();
    } catch (err) {
      errorToast(err.response?.data?.error || "Failed to update department");
    }
  };

  const handleDeleteDepartment = async (departmentId) => {
    if (!window.confirm("Are you sure you want to delete this department?")) return;

    try {
      setError("");
      setMessage("");

      await axios.delete(`/departments/${departmentId}`, { withCredentials: true });
      successToast("Department deleted successfully!", 3000);
      fetchDepartments();
    } catch (err) {
      errorToast(err.response?.data?.error || "Failed to delete department");
    }
  };

  const openEditModal = (department) => {
    setEditingDepartment({
      ...department,
      headcount_limit: department.headcount_limit ? department.headcount_limit.toString() : "",
    });
    setShowEditModal(true);
  };

  // Filter and sort departments
  const getFilteredDepartments = () => {
    let filteredDepartments = [...departments];

    // Apply search filter
    if (searchTerm) {
      filteredDepartments = filteredDepartments.filter(
        (dept) =>
          dept.department_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dept.department_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (dept.faculty_name && dept.faculty_name.toLowerCase().includes(searchTerm.toLowerCase())),
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filteredDepartments = filteredDepartments.filter((dept) => {
        switch (statusFilter) {
          case "active":
            return dept.is_active;
          case "inactive":
            return !dept.is_active;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filteredDepartments.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "name":
          aValue = a.department_name;
          bValue = b.department_name;
          break;
        case "code":
          aValue = a.department_code;
          bValue = b.department_code;
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

    return filteredDepartments;
  };

  const filteredDepartments = getFilteredDepartments();

  // File input ref for import
  const fileInputRef = React.useRef(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-600">Loading departments...</div>
      </div>
    );
  }

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleDownloadTemplate = () => {
    const csvHeaders = "department_code,department_name,faculty_name,email_domain,website_url,budget_code,headcount_limit\n";
    const csvContent = csvHeaders + "CS,Computer Science,Faculty of Science,,https://cs.university.edu,,100\n";

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'departments_template.csv');
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

      const response = await axios.post('/departments/import-csv', formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage(`Departments imported successfully! Added ${response.data.success || 0} departments.`);
      fetchDepartments();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to import departments");
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <AdminLayout title="🏫 Department Management">
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-gray-600">
          Manage academic departments and their information
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
            onClick={() => window.open('/departments/export-csv', '_blank')}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            📊 Export CSV
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            ➕ Add Department
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
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{totalItems}</div>
            <div className="text-sm text-gray-600">Total Departments</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600">
              {
                departments.filter(
                  (dept) => dept.is_active,
                ).length
              }
            </div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-600">
              {
                departments.filter((dept) => !dept.is_active)
                  .length
              }
            </div>
            <div className="text-sm text-gray-600">Inactive</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="text-2xl font-bold text-purple-600">
              {
                departments.filter((dept) => dept.courses && dept.courses.length > 0)
                  .length
              }
            </div>
            <div className="text-sm text-gray-600">With Courses</div>
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
              placeholder="Department name, code, or faculty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 px-4 text-xs border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors duration-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-10 px-4 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors duration-200"
            >
              <option value="all">All Departments</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
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
              <option value="name">Department Name</option>
              <option value="code">Department Code</option>
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

      {/* Departments Table */}
      <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
        {departments.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">🏫</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Departments Found
            </h3>
            <p className="text-gray-600 mb-4">
              Add a new department or import department data to get started.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Add First Department
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Department Name
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Faculty
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Email Domain
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Headcount
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDepartments.map((department, index) => (
                  <tr
                    key={department.id}
                    className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-colors`}
                  >
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 bg-blue-100 px-2 py-1 rounded-full font-mono text-xs">
                        {department.department_code}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {department.department_name}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-700">
                        {department.faculty_name || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-700">
                        {department.email_domain || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-700">
                        {department.current_headcount || 0}
                        {department.headcount_limit && (
                          <span className="text-gray-500">/{department.headcount_limit}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          department.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {department.is_active ? "✅ Active" : "⏸️ Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-center">
                      <div className="flex space-x-1">
                        <button
                          onClick={() => openEditModal(department)}
                          className="px-2 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600 transition-colors"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteDepartment(department.id)}
                          className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {departments.length > 0 && (
        <div className="mt-6 flex justify-center items-center space-x-4">
          <button
            onClick={() => fetchDepartments(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 disabled:opacity-50"
          >
            ← Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages} ({totalItems} total departments)
          </span>
          <button
            onClick={() => fetchDepartments(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 disabled:opacity-50"
          >
            Next →
          </button>
        </div>
      )}

      {/* Add Department Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl mx-4 max-h-screen overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Add New Department</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department Code *
                </label>
                <input
                  type="text"
                  value={newDepartment.department_code}
                  onChange={(e) =>
                    setNewDepartment({ ...newDepartment, department_code: e.target.value })
                  }
                  className="w-full h-10 px-4 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors duration-200"
                  placeholder="e.g., CS, MATH, ENG"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department Name *
                </label>
                <input
                  type="text"
                  value={newDepartment.department_name}
                  onChange={(e) =>
                    setNewDepartment({ ...newDepartment, department_name: e.target.value })
                  }
                  className="w-full h-10 px-4 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors duration-200"
                  placeholder="Full department name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Faculty Name
                </label>
                <input
                  type="text"
                  value={newDepartment.faculty_name}
                  onChange={(e) =>
                    setNewDepartment({ ...newDepartment, faculty_name: e.target.value })
                  }
                  className="w-full h-10 px-4 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors duration-200"
                  placeholder="Faculty this department belongs to"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Domain
                </label>
                <input
                  type="text"
                  value={newDepartment.email_domain}
                  onChange={(e) =>
                    setNewDepartment({ ...newDepartment, email_domain: e.target.value })
                  }
                  className="w-full h-10 px-4 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors duration-200"
                  placeholder="e.g., cs.university.edu"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website URL
                </label>
                <input
                  type="url"
                  value={newDepartment.website_url}
                  onChange={(e) =>
                    setNewDepartment({ ...newDepartment, website_url: e.target.value })
                  }
                  className="w-full h-10 px-4 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors duration-200"
                  placeholder="https://cs.university.edu"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Code
                </label>
                <input
                  type="text"
                  value={newDepartment.budget_code}
                  onChange={(e) =>
                    setNewDepartment({ ...newDepartment, budget_code: e.target.value })
                  }
                  className="w-full h-10 px-4 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors duration-200"
                  placeholder="Budget identifier"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Headcount Limit
                </label>
                <input
                  type="number"
                  value={newDepartment.headcount_limit}
                  onChange={(e) =>
                    setNewDepartment({ ...newDepartment, headcount_limit: e.target.value })
                  }
                  className="w-full h-10 px-4 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors duration-200"
                  placeholder="Maximum number of students/faculty"
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
                onClick={handleAddDepartment}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Add Department
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Department Modal */}
      {showEditModal && editingDepartment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl mx-4 max-h-screen overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Edit Department</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department Code *
                </label>
                <input
                  type="text"
                  value={editingDepartment.department_code}
                  onChange={(e) =>
                    setEditingDepartment({
                      ...editingDepartment,
                      department_code: e.target.value,
                    })
                  }
                  className="w-full h-10 px-4 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department Name *
                </label>
                <input
                  type="text"
                  value={editingDepartment.department_name}
                  onChange={(e) =>
                    setEditingDepartment({
                      ...editingDepartment,
                      department_name: e.target.value,
                    })
                  }
                  className="w-full h-10 px-4 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Faculty Name
                </label>
                <input
                  type="text"
                  value={editingDepartment.faculty_name || ""}
                  onChange={(e) =>
                    setEditingDepartment({
                      ...editingDepartment,
                      faculty_name: e.target.value,
                    })
                  }
                  className="w-full h-10 px-4 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Domain
                </label>
                <input
                  type="text"
                  value={editingDepartment.email_domain || ""}
                  onChange={(e) =>
                    setEditingDepartment({
                      ...editingDepartment,
                      email_domain: e.target.value,
                    })
                  }
                  className="w-full h-10 px-4 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website URL
                </label>
                <input
                  type="url"
                  value={editingDepartment.website_url || ""}
                  onChange={(e) =>
                    setEditingDepartment({
                      ...editingDepartment,
                      website_url: e.target.value,
                    })
                  }
                  className="w-full h-10 px-4 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Code
                </label>
                <input
                  type="text"
                  value={editingDepartment.budget_code || ""}
                  onChange={(e) =>
                    setEditingDepartment({
                      ...editingDepartment,
                      budget_code: e.target.value,
                    })
                  }
                  className="w-full h-10 px-4 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Headcount Limit
                </label>
                <input
                  type="number"
                  value={editingDepartment.headcount_limit || ""}
                  onChange={(e) =>
                    setEditingDepartment({
                      ...editingDepartment,
                      headcount_limit: e.target.value,
                    })
                  }
                  className="w-full h-10 px-4 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={editingDepartment.is_active ? "active" : "inactive"}
                  onChange={(e) =>
                    setEditingDepartment({
                      ...editingDepartment,
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
                onClick={handleEditDepartment}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Update Department
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default DepartmentManagement;
