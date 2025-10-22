import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';
import { useToast } from '../../hooks/useToast';

function StudentManagement() {
  const { successToast, errorToast } = useToast();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [assignmentStats, setAssignmentStats] = useState({
    total: 0,
    assigned: 0,
    unassigned: 0,
    percentage: 0
  });
  const perPage = 10;

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'assigned', 'unassigned'
  const [sortBy, setSortBy] = useState('name'); // 'name', 'number', 'id', 'status'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc', 'desc'

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [newStudent, setNewStudent] = useState({
    first_name: '',
    last_name: '',
    student_number: '',
    student_id: '',
    department: '',
    courses: ''
  });

  // Bulk import states
  const [csvFile, setCsvFile] = useState(null);
  const [csvPreview, setCsvPreview] = useState([]);
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);

  const fetchStudents = async (page = 1) => {
    try {
      setLoading(true);
      // eslint-disable-next-line no-unused-vars
      const response = await axios.get(`/students?page=${page}&per_page=${perPage}`, { withCredentials: true });
      setStudents(response.data.students);
      setCurrentPage(response.data.current_page);
      setTotalPages(response.data.total_pages);
      setTotalItems(response.data.total_items);
    } catch (err) {
      setError(err.response?.data?.error || '');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleAddStudent = async () => {
    try {
      setError('');
      setMessage('');

      // Add student via API
      const response = await axios.post('/students', newStudent, { withCredentials: true });
      successToast('Student added successfully!', 3000);
      setShowAddModal(false);
      setNewStudent({ first_name: '', last_name: '', student_number: '', student_id: '', department: '', courses: '' });
      fetchStudents();
    } catch (err) {
      errorToast(err.response?.data?.error || 'Failed to add student');
    }
  };

  const handleEditStudent = async () => {
    try {
      setError('');
      setMessage('');

      // Update student via API
      const response = await axios.put(`/students/${editingStudent.id}`, editingStudent, { withCredentials: true });
      successToast('Student updated successfully!', 3000);
      setShowEditModal(false);
      setEditingStudent(null);
      fetchStudents();
    } catch (err) {
      errorToast(err.response?.data?.error || 'Failed to update student');
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;

    try {
      setError('');
      setMessage('');

      await axios.delete(`/students/${studentId}`, { withCredentials: true });
      successToast('Student deleted successfully!', 3000);
      fetchStudents();
    } catch (err) {
      errorToast(err.response?.data?.error || 'Failed to delete student');
    }
  };

  const openEditModal = (student) => {
    setEditingStudent({ ...student });
    setShowEditModal(true);
  };

  // Filter and sort students
  const getFilteredStudents = () => {
    let filteredStudents = [...students];

    // Apply search filter
    if (searchTerm) {
      filteredStudents = filteredStudents.filter(student =>
        student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student_number.includes(searchTerm) ||
        student.student_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filteredStudents = filteredStudents.filter(student => {
        switch (statusFilter) {
          case 'assigned':
            return student.assignment;
          case 'unassigned':
            return !student.assignment;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filteredStudents.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'name':
          aValue = `${a.first_name} ${a.last_name}`;
          bValue = `${b.first_name} ${b.last_name}`;
          break;
        case 'number':
          aValue = a.student_number;
          bValue = b.student_number;
          break;
        case 'id':
          aValue = a.student_id;
          bValue = b.student_id;
          break;
        case 'status':
          aValue = a.assignment ? 1 : 0;
          bValue = b.assignment ? 1 : 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filteredStudents;
  };

  const filteredStudents = getFilteredStudents();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-600">Loading students...</div>
      </div>
    );
  }

  return (
    <AdminLayout title="👥 Student Management">
      <div className="flex justify-end space-x-2 mb-6">
          <button
            onClick={() => setShowBulkImportModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            📤 Bulk Import
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
          >
            ➕ Add New Student
          </button>
        <button
          onClick={() => {
            const csvContent = [
              // CSV header
              'Student ID,Name,Department,Courses Enrolled,Assignment Status',
              // CSV data rows
              ...filteredStudents.map(student =>
                `"${student.student_id}","${student.first_name} ${student.last_name}","${student.department || 'Not Assigned'}","${student.courses || 'No courses enrolled'}","${student.assignment ? 'Assigned' : 'Unassigned'}"`
              )
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `students_export_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            successToast('Student data exported successfully!', 3000);
          }}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
        >
          📊 Export Data
        </button>
      </div>

      {message && <p className="text-green-500 mb-4">{message}</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Assignment Completion Visualization */}
      <div className="mb-6 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Assignment Completion Dashboard</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Progress Circle */}
          <div className="flex items-center justify-center">
            <div className="relative">
              <svg className="transform -rotate-90 w-32 h-32" viewBox="0 0 120 120">
                {/* Background circle */}
                <circle
                  cx="60" cy="60" r="54"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Progress circle */}
                <circle
                  cx="60" cy="60" r="54"
                  stroke="#3b82f6"
                  strokeWidth="8"
                  fill="transparent"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 54}`}
                  strokeDashoffset={`${2 * Math.PI * 54 * (1 - (students.filter(s => s.assignment).length / students.length || 0))}`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {students.length > 0 ? Math.round((students.filter(s => s.assignment).length / students.length) * 100) : 0}%
                  </div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 bg-gray-200 rounded-full h-4">
                <div
                  className="bg-green-500 h-4 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${students.length > 0 ? (students.filter(s => s.assignment).length / students.length) * 100 : 0}%` }}
                ></div>
              </div>
              <div className="text-lg font-semibold text-green-600">
                {students.filter(s => s.assignment).length}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex-1 bg-gray-200 rounded-full h-4">
                <div
                  className="bg-yellow-500 h-4 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${students.length > 0 ? (students.filter(s => !s.assignment).length / students.length) * 100 : 0}%` }}
                ></div>
              </div>
              <div className="text-lg font-semibold text-yellow-600">
                {students.filter(s => !s.assignment).length}
              </div>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>Assigned</span>
              <span>Unassigned</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalItems}</div>
            <div className="text-sm text-gray-600">Total Students</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{students.filter(s => s.assignment).length}</div>
            <div className="text-sm text-gray-600">Assigned</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{students.filter(s => !s.assignment).length}</div>
            <div className="text-sm text-gray-600">Unassigned</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{students.length > 0 ? Math.round((students.filter(s => s.assignment).length / students.length) * 100) : 0}%</div>
            <div className="text-sm text-gray-600">Completion Rate</div>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 p-4 bg-white shadow-lg rounded-xl border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Courses</label>
            <input
              type="text"
              placeholder="Name, number, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 px-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors duration-200 text-xs"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Seating Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-10 px-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors duration-200 text-xs"
            >
              <option value="all">All Students</option>
              <option value="assigned">Assigned</option>
              <option value="unassigned">Unassigned</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full h-10 px-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors duration-200 text-xs"
            >
              <option value="name">Student Name</option>
              <option value="number">Student Number</option>
              <option value="id">Student ID</option>
              <option value="status">Seating Status</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full h-10 px-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors duration-200 text-xs"
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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Students Found</h3>
            <p className="text-gray-600 mb-4">Add a new student or import student data to get started.</p>
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
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Student ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Courses Enrolled</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Assignment Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student, index) => {
                  // Calculate assignment status highlight
                  const hasIncompleteAssignment = !student.assignment;
                  const recentAssignment = student.recently_assigned; // This would be from the API

                  return (
                    <tr key={student.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors ${
                      hasIncompleteAssignment ? 'border-l-4 border-yellow-400' : ''
                    }`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${recentAssignment ? 'text-green-600 font-semibold' : 'text-gray-900'}`}>
                          {student.student_id}
                          {recentAssignment && <span className="ml-2 text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">New</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {student.first_name} {student.last_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700 bg-purple-50 px-2 py-1 rounded">
                          {student.department || 'Not Assigned'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700 max-w-xs truncate" title={student.courses || 'No courses enrolled'}>
                          {student.courses || 'No courses enrolled'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          student.assignment ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        }`}>
                          {student.assignment ? '✅ Assigned' : '⏳ Unassigned'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex space-x-1">
                          <button
                            onClick={() => openEditModal(student)}
                            className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors duration-200"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => {/* TODO: Export individual student */}}
                            title="Export"
                            className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600 transition-colors duration-200"
                          >
                            📊
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student.id)}
                            className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors duration-200"
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
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 disabled:opacity-50"
          >
            ← Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages} ({totalItems} total students)
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  value={newStudent.first_name}
                  onChange={(e) => setNewStudent({...newStudent, first_name: e.target.value})}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors duration-200 text-sm"
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={newStudent.last_name}
                  onChange={(e) => setNewStudent({...newStudent, last_name: e.target.value})}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors duration-200 text-sm"
                  placeholder="Enter last name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Student Number</label>
                <input
                  type="text"
                  value={newStudent.student_number}
                  onChange={(e) => setNewStudent({...newStudent, student_number: e.target.value})}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors duration-200 text-sm"
                  placeholder="e.g., 12345678"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Student ID</label>
                <input
                  type="text"
                  value={newStudent.student_id}
                  onChange={(e) => setNewStudent({...newStudent, student_id: e.target.value})}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors duration-200 text-sm"
                  placeholder="e.g., student@university.edu"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <input
                  type="text"
                  value={newStudent.department}
                  onChange={(e) => setNewStudent({...newStudent, department: e.target.value})}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors duration-200 text-sm"
                  placeholder="e.g., Computer Science"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Courses Enrolled</label>
                <input
                  type="text"
                  value={newStudent.courses}
                  onChange={(e) => setNewStudent({...newStudent, courses: e.target.value})}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors duration-200 text-sm"
                  placeholder="e.g., CS301,MATH201,PHYS101"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  value={editingStudent.first_name}
                  onChange={(e) => setEditingStudent({...editingStudent, first_name: e.target.value})}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors duration-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={editingStudent.last_name}
                  onChange={(e) => setEditingStudent({...editingStudent, last_name: e.target.value})}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors duration-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Student Number</label>
                <input
                  type="text"
                  value={editingStudent.student_number}
                  onChange={(e) => setEditingStudent({...editingStudent, student_number: e.target.value})}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors duration-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Student ID</label>
                <input
                  type="text"
                  value={editingStudent.student_id}
                  onChange={(e) => setEditingStudent({...editingStudent, student_id: e.target.value})}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors duration-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <input
                  type="text"
                  value={editingStudent.department || ''}
                  onChange={(e) => setEditingStudent({...editingStudent, department: e.target.value})}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors duration-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Courses Enrolled</label>
                <input
                  type="text"
                  value={editingStudent.courses || ''}
                  onChange={(e) => setEditingStudent({...editingStudent, courses: e.target.value})}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors duration-200 text-sm"
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
                onClick={handleEditStudent}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Update Student
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-4xl mx-4 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">📤 Bulk Import Students</h2>
              <button
                onClick={() => {
                  setShowBulkImportModal(false);
                  setCsvFile(null);
                  setCsvPreview([]);
                  setImportResults(null);
                  setImportProgress(0);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {!importResults ? (
                <>
                  {/* CSV Format Instructions */}
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-800 mb-2">📋 CSV Format Requirements</h3>
                    <div className="text-xs text-blue-700 space-y-1">
                      <p>• First row must contain headers: first_name, last_name, student_number, student_id</p>
                      <p>• Data should be comma-separated values</p>
                      <p>• Maximum file size: 10MB</p>
                      <p>• Example: John,Doe,12345678,john.doe@university.edu</p>
                    </div>
                  </div>

                  {/* File Upload */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select CSV File</label>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file && file.size > 10 * 1024 * 1024) {
                          errorToast('File size must be less than 10MB', 4000);
                          return;
                        }
                        setCsvFile(file);
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            const text = e.target.result;
                            const rows = text.split('\n').filter(row => row.trim());
                            const headers = rows[0].split(',');
                            const data = rows.slice(1).map(row => {
                              const cols = row.split(',');
                              return Object.fromEntries(
                                headers.map((header, index) => [header.trim(), cols[index]?.trim() || ''])
                              );
                            });
                            setCsvPreview(data.slice(0, 5)); // Show first 5 rows
                          };
                          reader.readAsText(file);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  {/* CSV Preview */}
                  {csvPreview.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">🔍 Preview (First 5 Rows)</h3>
                      <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              {Object.keys(csvPreview[0] || {}).map(header => (
                                <th key={header} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {csvPreview.map((row, index) => (
                              <tr key={index}>
                                {Object.values(row).map((value, i) => (
                                  <td key={i} className="px-3 py-2 text-sm text-gray-900">
                                    {value}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Import Results */
                <div className="mb-6">
                  <div className={`p-6 rounded-xl shadow-lg border-2 ${
                    (importResults.success || 0) > 0 && (importResults.errors || 0) === 0
                      ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-300'
                      : (importResults.errors || 0) > 0
                      ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300'
                      : 'bg-gradient-to-br from-red-50 to-red-100 border-red-300'
                  }`}>
                    <div className="flex items-center mb-4">
                      <div className={`text-4xl mr-4 ${
                        (importResults.success || 0) > 0 && (importResults.errors || 0) === 0 ? 'animate-bounce' : ''
                      }`}>
                        {(importResults.success || 0) > 0 && (importResults.errors || 0) === 0 ? '🎉' : '⚠️'}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {(importResults.success || 0) > 0 && (importResults.errors || 0) === 0 ? '🎯 Import Successful!' : '⚠️ Import Completed with Issues'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {(importResults.success || 0) > 0 && (importResults.errors || 0) === 0 ? 'All students imported successfully!' : 'Some students may not have been imported'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-4">
                      {/* Success Stats */}
                      <div className="bg-white bg-opacity-70 p-4 rounded-lg border border-green-200">
                        <div className="flex items-center">
                          <div className="text-2xl mr-3">✅</div>
                          <div>
                            <div className="text-3xl font-bold text-green-600">
                              {importResults.success || importResults.success === 0 ? importResults.success.toLocaleString() : '–'}
                            </div>
                            <div className="text-sm font-medium text-gray-700">Students Imported</div>
                          </div>
                        </div>
                      </div>

                      {/* Error Stats */}
                      <div className="bg-white bg-opacity-70 p-4 rounded-lg border border-yellow-200">
                        <div className="flex items-center">
                          <div className={`text-2xl mr-3 ${importResults.errors > 0 ? 'animate-pulse' : ''}`}>⚠️</div>
                          <div>
                            <div className="text-3xl font-bold text-yellow-600">
                              {importResults.errors || importResults.errors === 0 ? importResults.errors.toLocaleString() : '–'}
                            </div>
                            <div className="text-sm font-medium text-gray-700">Errors Found</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {(importResults.errors || 0) > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-red-700 mb-3">🔍 Error Details:</h4>
                        <div className="bg-white bg-opacity-80 p-4 rounded-lg border border-red-200 max-h-48 overflow-y-auto">
                          <div className="text-xs text-red-800 font-mono space-y-1">
                            {Array.isArray(importResults.error_details) && importResults.error_details.length > 0 ? (
                              importResults.error_details.map((error, index) => (
                                <div key={index} className="bg-red-50 p-2 rounded border-l-2 border-red-300">
                                  <span className="font-medium">Row {error.row}:</span> {error.message}
                                </div>
                              ))
                            ) : (
                              <div className="text-gray-600 italic">
                                No detailed error information available. Please check your CSV format.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-6 text-center">
                      <p className="text-sm text-gray-600">
                        💡 <strong>Next Steps:</strong> The imported students are now available in your Student Management dashboard.
                        {(importResults.success || 0) > 0 ? ' You can start assigning them to exam rooms!' : ''}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Import Progress */}
              {isImporting && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">📤 Importing Students...</span>
                    <span className="text-sm text-gray-500">{importProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${importProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowBulkImportModal(false);
                  setCsvFile(null);
                  setCsvPreview([]);
                  setImportResults(null);
                  setImportProgress(0);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                disabled={isImporting}
              >
                {importResults ? 'Close' : 'Cancel'}
              </button>
              {!importResults && (
                <button
                  onClick={async () => {
                    if (!csvFile) {
                      errorToast('Please select a CSV file first', 3000);
                      return;
                    }

                    setIsImporting(true);
                    setImportProgress(0);

                    try {
                      const formData = new FormData();
                      formData.append('file', csvFile);

                      // Simulate progress updates
                      const progressInterval = setInterval(() => {
                        setImportProgress(prev => {
                          const newProgress = prev + Math.random() * 15;
                          return newProgress > 90 ? 90 : newProgress;
                        });
                      }, 200);

                      const response = await axios.post('/students/bulk-import', formData, {
                        withCredentials: true,
                        headers: { 'Content-Type': 'multipart/form-data' }
                      });

                      clearInterval(progressInterval);
                      setImportProgress(100);
                      setImportResults(response.data);
                      successToast(`Successfully imported ${response.data.success} students!`, 5000);
                      fetchStudents(); // Refresh the student list

                    } catch (err) {
                      setImportProgress(0);
                      const errorData = err.response?.data || {};
                      setImportResults(errorData);
                      errorToast('Bulk import failed. Check error details.', 5000);
                    } finally {
                      setIsImporting(false);
                    }
                  }}
                  disabled={!csvFile || isImporting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isImporting ? '📤 Importing...' : '📤 Start Import'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default StudentManagement;
