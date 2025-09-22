import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Reports() {
  const [assignments, setAssignments] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const perPage = 10; // Number of items per page

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'free', 'good', 'full', 'over'
  const [sortBy, setSortBy] = useState('building'); // 'building', 'utilization', 'capacity'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc', 'desc'

  // Unassigned students pagination
  const [unassignedCurrentPage, setUnassignedCurrentPage] = useState(1);
  const [unassignedPerPage] = useState(5); // Show 5 unassigned students per page

  const fetchData = async (page = 1) => {
    try {
      const [assignmentsRes, roomsRes, studentsRes] = await Promise.all([
        axios.get(`http://localhost:5000/assignments?page=${page}&per_page=${perPage}`, { withCredentials: true }),
        axios.get('http://localhost:5000/rooms', { withCredentials: true }), // Fetch all rooms
        axios.get('http://localhost:5000/students', { withCredentials: true }), // Fetch all students
      ]);
      setAssignments(assignmentsRes.data.assignments);
      setCurrentPage(assignmentsRes.data.current_page);
      setTotalPages(assignmentsRes.data.total_pages);
      setTotalItems(assignmentsRes.data.total_items);
      setRooms(roomsRes.data.rooms);
      setStudents(studentsRes.data.students);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch report data');
    }
  };

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  const getStudentsPerRoom = () => {
    const roomStats = {};
    rooms.forEach(room => {
      roomStats[room.id] = {
        building_name: room.building_name,
        room_number: room.room_number,
        capacity: room.testing_capacity > 0 ? room.testing_capacity : room.room_capacity,
        assigned_count: 0,
        assigned_students: [],
      };
    });

    assignments.forEach(assignment => {
      if (roomStats[assignment.room_id]) {
        roomStats[assignment.room_id].assigned_count++;
        roomStats[assignment.room_id].assigned_students.push(assignment.student_name);
      }
    });

    let filteredRooms = Object.values(roomStats);

    // Apply search filter
    if (searchTerm) {
      filteredRooms = filteredRooms.filter(room =>
        room.building_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.room_number.includes(searchTerm)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filteredRooms = filteredRooms.filter(room => {
        const utilization = room.capacity > 0 ? (room.assigned_count / room.capacity) * 100 : 0;
        const isOverCapacity = room.assigned_count > room.capacity;

        switch (statusFilter) {
          case 'free':
            return room.assigned_count === 0;
          case 'good':
            return !isOverCapacity && utilization <= 90;
          case 'full':
            return !isOverCapacity && utilization > 90;
          case 'over':
            return isOverCapacity;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filteredRooms.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'building':
          aValue = a.building_name;
          bValue = b.building_name;
          break;
        case 'utilization':
          aValue = a.capacity > 0 ? (a.assigned_count / a.capacity) * 100 : 0;
          bValue = b.capacity > 0 ? (b.assigned_count / b.capacity) * 100 : 0;
          break;
        case 'capacity':
          aValue = a.capacity;
          bValue = b.capacity;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filteredRooms;
  };

  const getUnassignedStudents = () => {
    const assignedStudentIds = new Set(assignments.map(a => a.student_id));
    return students.filter(student => !assignedStudentIds.has(student.id));
  };

  const studentsPerRoom = getStudentsPerRoom();
  const allUnassignedStudents = getUnassignedStudents();

  // Paginate unassigned students
  const unassignedTotalPages = Math.ceil(allUnassignedStudents.length / unassignedPerPage);
  const unassignedStartIndex = (unassignedCurrentPage - 1) * unassignedPerPage;
  const unassignedStudents = allUnassignedStudents.slice(unassignedStartIndex, unassignedStartIndex + unassignedPerPage);

  const handleExportCSV = async () => {
    try {
      const response = await axios.get('http://localhost:5000/export-assignments-csv', {
        withCredentials: true,
        responseType: 'blob', // Important for downloading files
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'room_assignments.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to export CSV');
    }
  };

  const handleExportPDF = async () => {
    setError('PDF export is not yet implemented on the backend.');
    // try {
    //   const response = await axios.get('http://localhost:5000/export-assignments-pdf', {
    //     withCredentials: true,
    //     responseType: 'blob',
    //   });
    //   const url = window.URL.createObjectURL(new Blob([response.data]));
    //   const link = document.createElement('a');
    //   link.href = url;
    //   link.setAttribute('download', 'room_assignments.pdf');
    //   document.body.appendChild(link);
    //   link.click();
    //   link.remove();
    // } catch (err) {
    //   setError(err.response?.data?.error || 'Failed to export PDF');
    // }
  };

  return (
    <div className="p-4">
      <div className="mb-6">
        <h3 className="text-2xl font-bold">📊 Reports & Analytics</h3>
        <p className="text-gray-600">View room utilization, assignments, and export data</p>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Summary Stats */}
      <div className="mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{assignments.length}</div>
            <div className="text-sm text-gray-600">Total Assignments</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600">{studentsPerRoom.reduce((sum, room) => sum + room.assigned_count, 0)}</div>
            <div className="text-sm text-gray-600">Students Assigned</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-600">{unassignedStudents.length}</div>
            <div className="text-sm text-gray-600">Unassigned Students</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="text-2xl font-bold text-purple-600">
              {studentsPerRoom.length > 0 ? Math.round((studentsPerRoom.reduce((sum, room) => sum + room.assigned_count, 0) / studentsPerRoom.reduce((sum, room) => sum + room.capacity, 0)) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-600">Overall Utilization</div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Room Utilization Report (2/3 width) */}
        <div className="col-span-2 bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
          <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-800">🏢 Room Utilization Report</h4>
                <p className="text-sm text-gray-600">Current room assignments and capacity utilization</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm font-medium"
                >
                  📥 CSV
                </button>
                <button
                  onClick={handleExportPDF}
                  className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm font-medium"
                >
                  📄 PDF
                </button>
              </div>
            </div>

            {/* Search and Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  placeholder="Building or room..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Status Filter</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="free">🟢 Free Rooms</option>
                  <option value="good">🟢 Good (0-90%)</option>
                  <option value="full">🟡 Nearly Full (90%+)</option>
                  <option value="over">⚠️ Over Capacity</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="building">Building Name</option>
                  <option value="utilization">Utilization %</option>
                  <option value="capacity">Capacity</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Order</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="asc">↑ Ascending</option>
                  <option value="desc">↓ Descending</option>
                </select>
              </div>
            </div>
          </div>
          {studentsPerRoom.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Assignment Data</h3>
              <p className="text-gray-600 mb-4">Run the assignment algorithm to generate utilization reports.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Room</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Building</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Capacity</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Assigned</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Utilization</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {studentsPerRoom.map((roomStat, index) => {
                    const utilization = roomStat.capacity > 0 ? (roomStat.assigned_count / roomStat.capacity) * 100 : 0;
                    const isOverCapacity = roomStat.assigned_count > roomStat.capacity;

                    return (
                      <tr key={index} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded-full text-center w-12">
                            {roomStat.room_number}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{roomStat.building_name}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {roomStat.capacity}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {roomStat.assigned_count}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900 mr-2">
                              {utilization.toFixed(1)}%
                            </div>
                            <div className="w-12 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${isOverCapacity ? 'bg-red-500' : utilization > 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                style={{ width: `${Math.min(utilization, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            isOverCapacity
                              ? 'bg-red-100 text-red-800'
                              : roomStat.assigned_count === 0
                              ? 'bg-gray-100 text-gray-800'
                              : utilization > 90
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {isOverCapacity
                              ? '⚠️ Over'
                              : roomStat.assigned_count === 0
                              ? '🟢 Free'
                              : utilization > 90
                              ? '🟡 Full'
                              : '🟢 Good'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column - Unassigned Students */}
        <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
          <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800">⚠️ Unassigned Students</h4>
            <p className="text-sm text-gray-600">Students requiring room assignments</p>
          </div>
          {unassignedStudents.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">All Students Assigned!</h3>
              <p className="text-gray-600">No students are waiting for room assignments.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Student ID</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {unassignedStudents.map((student, index) => (
                    <tr key={student.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-yellow-50 transition-colors`}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {student.first_name} {student.last_name}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 bg-blue-100 px-2 py-1 rounded-full text-center font-mono">
                          {student.student_id}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Unassigned Students Pagination */}
          {allUnassignedStudents.length > unassignedPerPage && (
            <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-t border-gray-200">
              <div className="flex justify-center items-center space-x-4">
                <button
                  onClick={() => setUnassignedCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={unassignedCurrentPage === 1}
                  className="px-3 py-1.5 bg-orange-300 text-orange-800 rounded-md hover:bg-orange-400 disabled:opacity-50 text-sm"
                >
                  ← Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {unassignedCurrentPage} of {unassignedTotalPages} ({allUnassignedStudents.length} total unassigned students)
                </span>
                <button
                  onClick={() => setUnassignedCurrentPage(prev => Math.min(unassignedTotalPages, prev + 1))}
                  disabled={unassignedCurrentPage === unassignedTotalPages}
                  className="px-3 py-1.5 bg-orange-300 text-orange-800 rounded-md hover:bg-orange-400 disabled:opacity-50 text-sm"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {assignments.length > 0 && (
        <div className="mt-6 flex justify-center items-center space-x-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 disabled:opacity-50"
          >
            ← Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages} ({totalItems} total assignments)
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
    </div>
  );
}

export default Reports;
