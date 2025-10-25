import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";

function RoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalActive, setTotalActive] = useState(0);
  const perPage = 10;

  // New: Department-focused view
  const [currentView, setCurrentView] = useState("departmental"); // 'departmental', 'all'
  const [departmentalRooms, setDepartmentalRooms] = useState([]);
  const [allRooms, setAllRooms] = useState([]);
  const [departmentId, setDepartmentId] = useState(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'active', 'inactive'
  const [buildingFilter, setBuildingFilter] = useState("all"); // 'all', specific building
  const [typeFilter, setTypeFilter] = useState("all"); // 'all', specific room type
  const [sortBy, setSortBy] = useState("building"); // 'building', 'capacity', 'exam'

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [showAssignConfirm, setShowAssignConfirm] = useState(false);
  const [roomToAssign, setRoomToAssign] = useState(null);
  const [newRoom, setNewRoom] = useState({
    building_id: "",
    room_number: "",
    room_name: "",
    floor_number: 1,
    capacity: 30,
    exam_capacity: 30,
    seating_arrangement: "",
    room_type: "Lecture",
    is_active: true,
    is_bookable: true,
  });

  // File input refs
  const csvImportRef = React.useRef(null);

  // Fetch buildings only (user/department ID is fetched separately)
  const fetchData = async () => {
    try {
      const [buildingsResponse, userResponse] = await Promise.all([
        axios.get(`/buildings?per_page=1000`, { withCredentials: true }),
        axios.get('/auth/user', { withCredentials: true })
      ]);

      setBuildings(buildingsResponse.data.buildings || []);

      // Set department ID from user data
      if (userResponse.data.user?.department_id) {
        setDepartmentId(userResponse.data.user.department_id);
      }
    } catch (err) {
      console.error("Failed to load initial data:", err);
      setBuildings([]);
      setDepartmentId(null);
    }
  };

  // Initialize component
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Combined initial data fetch
  const fetchInitialData = async () => {
    try {
      setLoading(true);

      // Fetch buildings and user data first
      const [buildingsResponse, userResponse] = await Promise.all([
        axios.get(`/buildings?per_page=1000`, { withCredentials: true }),
        axios.get('/auth/user', { withCredentials: true })
      ]);

      setBuildings(buildingsResponse.data.buildings || []);

      // Set department ID from user data
      const newDepartmentId = userResponse.data.user?.department_id || null;
      setDepartmentId(newDepartmentId);

      // Now fetch rooms with the department ID
      await fetchRoomsData(newDepartmentId);

    } catch (err) {
      console.error("Failed to load initial data:", err);
      setBuildings([]);
      setDepartmentId(null);
      setAllRooms([]);
      setDepartmentalRooms([]);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomsData = async (deptId = departmentId) => {
    try {
      // Fetch all rooms without pagination
      const allResponse = await axios.get(`/rooms?per_page=10000`, { withCredentials: true });
      const allRoomsData = allResponse.data.rooms || [];
      setAllRooms(allRoomsData);

      // Fetch departmental rooms if we have department ID
      let departmentalData = [];
      if (deptId) {
        try {
          const departmentalResponse = await axios.get(`/rooms?department_id=${deptId}&per_page=10000`, { withCredentials: true });
          departmentalData = departmentalResponse.data.rooms || [];
        } catch (deptErr) {
          console.warn("Failed to fetch departmental rooms:", deptErr);
          departmentalData = [];
        }
      }
      setDepartmentalRooms(departmentalData);

      // Set current rooms based on view
      if (currentView === 'departmental') {
        setRooms(departmentalData);
        setTotalItems(departmentalData.length);
      } else {
        setRooms(allRoomsData);
        setTotalItems(allRoomsData.length);
      }

      // Calculate active rooms
      const activeCount = allRoomsData.filter(room => room.is_active && room.is_bookable).length;
      setTotalActive(activeCount);

    } catch (err) {
      console.error("Failed to fetch room data:", err);
      setAllRooms([]);
      setDepartmentalRooms([]);
      setRooms([]);
      setTotalItems(0);
      setTotalActive(0);
    }
  };

  // Update rooms when view changes
  useEffect(() => {
    if (allRooms.length > 0) {
      if (currentView === 'departmental') {
        setRooms(departmentalRooms);
        setTotalItems(departmentalRooms.length);
      } else {
        setRooms(allRooms);
        setTotalItems(allRooms.length);
      }
    }
  }, [currentView, departmentalRooms, allRooms]);

  const handleAddRoom = async () => {
    try {
      setError("");
      setMessage("");

      if (!newRoom.building_id || !newRoom.room_number || !newRoom.capacity) {
        setError("Building, room number, and capacity are required");
        return;
      }

      await axios.post("/rooms", newRoom, { withCredentials: true });
      setMessage(`Room ${newRoom.room_number} added successfully!`);

      setShowAddModal(false);
      setNewRoom({
        building_id: "",
        room_number: "",
        room_name: "",
        floor_number: 1,
        capacity: 30,
        exam_capacity: 30,
        seating_arrangement: "",
        room_type: "Lecture",
        is_active: true,
        is_bookable: true,
      });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add room");
    }
  };

  const handleEditRoom = async () => {
    try {
      setError("");
      setMessage("");

      await axios.put(`/rooms/${editingRoom.id}`, {
        room_number: editingRoom.room_number,
        room_name: editingRoom.room_name,
        floor_number: editingRoom.floor_number,
        capacity: editingRoom.capacity,
        exam_capacity: editingRoom.exam_capacity,
        room_type: editingRoom.room_type,
        seating_arrangement: editingRoom.seating_arrangement,
        is_active: editingRoom.is_active,
        is_bookable: editingRoom.is_bookable,
      }, { withCredentials: true });

      setMessage("Room updated successfully!");
      setShowEditModal(false);
      setEditingRoom(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update room");
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;

    try {
      setError("");
      setMessage("");

      await axios.delete(`/rooms/${roomId}`, { withCredentials: true });
      setMessage("Room deleted successfully!");
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete room");
    }
  };

  const handleImportCSV = () => {
    csvImportRef.current?.click();
  };

  const handleDownloadTemplate = () => {
    const csvHeaders = "building_code,room_number,floor_number,capacity,exam_capacity,room_type,can_book_exams\n";
    const csvContent = csvHeaders + "BA,101,1,50,40,Lecture,yes\n";

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'rooms_template.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleExportCSV = () => {
    window.open('/rooms/export-csv', '_blank');
  };

  const handleFileUpload = async (event) => {
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
      setMessage("Uploading CSV...");
      setLoading(true);

      const response = await axios.post('/rooms/import-csv', formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage(`Successfully imported ${response.data.success} rooms!`);

      // Clear file input
      if (csvImportRef.current) {
        csvImportRef.current.value = '';
      }

      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to import CSV");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (room) => {
    setEditingRoom(room);
    setShowEditModal(true);
  };

  const handleAssignToDepartment = (room) => {
    setRoomToAssign(room);
    setShowAssignConfirm(true);
  };

  const confirmAssignToDepartment = async () => {
    if (!roomToAssign || !departmentId) {
      setError("Room or department information not available");
      return;
    }

    try {
      setError("");
      setMessage("");

      await axios.post(`/rooms/departments/${departmentId}/assign-room`, {
        room_id: roomToAssign.id,
        room_number: roomToAssign.room_number
      }, { withCredentials: true });

      setMessage(`Room ${roomToAssign.room_number} assigned to Computer Science department`);
      setShowAssignConfirm(false);
      setRoomToAssign(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to assign room to department");
    }
  };

  // Get unique buildings for filter dropdown
  const getUniqueBuildings = () => {
    const unique = [...new Set(rooms.map((room) => room.building_name))].filter(name => name);
    return unique.sort();
  };

  // Filter and sort rooms with useMemo for proper reactivity
  const filteredRooms = useMemo(() => {
    let filteredRooms = [...rooms];

    // Apply search filter
    if (searchTerm) {
      filteredRooms = filteredRooms.filter(
        (room) =>
          room.building_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          room.room_number?.includes(searchTerm) ||
          room.display_name?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filteredRooms = filteredRooms.filter((room) => {
        switch (statusFilter) {
          case "active":
            return room.is_active && room.is_bookable;
          case "inactive":
            return !room.is_active || !room.is_bookable;
          default:
            return true;
        }
      });
    }

    // Apply building filter
    if (buildingFilter !== "all") {
      filteredRooms = filteredRooms.filter(
        (room) => room.building_name === buildingFilter,
      );
    }

    // Apply type filter
    if (typeFilter !== "all") {
      filteredRooms = filteredRooms.filter(
        (room) => room.room_type === typeFilter,
      );
    }

    // Apply sorting (always ascending)
    filteredRooms.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "building":
          aValue = a.building_name || "";
          bValue = b.building_name || "";
          break;
        case "capacity":
          aValue = a.capacity || 0;
          bValue = b.capacity || 0;
          break;
        case "exam":
          aValue = a.exam_capacity || 0;
          bValue = b.exam_capacity || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return -1;
      if (aValue > bValue) return 1;
      return 0;
    });

    return filteredRooms;
  }, [rooms, searchTerm, statusFilter, buildingFilter, typeFilter, sortBy]);

  const uniqueBuildings = getUniqueBuildings();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-600">Loading rooms...</div>
      </div>
    );
  }

  return (
    <AdminLayout title="🚪 Room Management">
      {/* Tabbed Interface */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setCurrentView("departmental")}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                currentView === "departmental"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              🏢 My Departmental Rooms ({departmentalRooms.length})
            </button>
            <button
              onClick={() => setCurrentView("all")}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                currentView === "all"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              🏫 All University Rooms ({allRooms.length})
            </button>
          </nav>
        </div>

        {/* View Description */}
        <div className="mt-2 text-sm text-gray-600">
          {currentView === "departmental" ? (
            <p>🔔 Focus on your assigned departmental rooms. Use this view for course and student assignments.</p>
          ) : (
            <p>📋 Browse all university rooms. Switch to departmental view to focus on your assigned rooms.</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end mb-6">
        <div className="flex space-x-3">
          <button
            onClick={handleDownloadTemplate}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            📋 Download Template
          </button>
          <button
            onClick={handleImportCSV}
            disabled={loading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            📥 Upload CSV
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            📊 Export CSV
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            ➕ Add Room
          </button>
        </div>
      </div>

      {/* Hidden CSV input */}
      <input
        ref={csvImportRef}
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="hidden"
      />

      {message && <p className="text-green-500 mb-4">{message}</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Summary Stats */}
      <div className="mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div
            className="bg-blue-50 p-4 rounded-lg border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors"
            onClick={() => setStatusFilter('all')}
          >
            <div className="text-2xl font-bold text-blue-600">{totalItems}</div>
            <div className="text-sm text-gray-600">Total Rooms</div>
          </div>
    <div
      className="bg-green-50 p-4 rounded-lg border border-green-200 cursor-pointer hover:bg-green-100 transition-colors"
      onClick={() => setStatusFilter('active')}
    >
      <div className="text-2xl font-bold text-green-600">
        {totalActive}
      </div>
      <div className="text-sm text-gray-600">Active Rooms</div>
    </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="text-2xl font-bold text-purple-600">
              {rooms.reduce((sum, r) => sum + (r.capacity || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">Total Capacity</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="text-2xl font-bold text-orange-600">
              {rooms.reduce((sum, r) => sum + (r.exam_capacity || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">Exam Capacity</div>
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
              placeholder="Room number or building code..."
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
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full h-10 px-4 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors duration-200"
            >
              <option value="all">All Types</option>
              <option value="classroom">Classroom</option>
              <option value="seminar">Seminar</option>
              <option value="auditorium">Auditorium</option>
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
              <option value="building">Building</option>
              <option value="capacity">Capacity</option>
              <option value="exam">Exam Capacity</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rooms Table - Compact Design */}
      <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
        {filteredRooms.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">🚪</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' ? 'No Matching Rooms' : 'No Rooms Found'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' ? 'Try adjusting your search filters.' : 'Add rooms to get started with room management.'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Add First Room
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Building
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Room
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Exam Cap
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                  {currentView === 'all' && (
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Department
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRooms.map((room, index) => (
                  <tr
                    key={room.id}
                    className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-colors`}
                  >
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {room.building_name}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {room.room_number}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-center">
                      <span className="text-sm font-medium text-gray-900">
                        {room.capacity}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-center">
                      <span className="text-sm font-medium text-gray-900">
                        {room.exam_capacity}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-center">
                      <span className="text-sm font-medium text-gray-900">
                        {room.room_type || 'Lecture'}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-center">
                      <span className="text-sm font-medium text-gray-900">
                        {room.is_active && room.is_bookable ? "✓" : "⏸"}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-center">
                      <div className="flex space-x-1">
                        <button
                          onClick={() => openEditModal(room)}
                          className="px-2 py-1 text-sm"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteRoom(room.id)}
                          className="px-2 py-1 text-sm"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                    {currentView === 'all' && (
                      <td className="px-4 py-2 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleAssignToDepartment(room)}
                          className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                          🎯 Assign
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination - Simple pagination for current view */}
      {Math.ceil(filteredRooms.length / perPage) > 1 && (
        <div className="mt-6 flex justify-center items-center space-x-4">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 disabled:opacity-50"
          >
            ← Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {Math.ceil(filteredRooms.length / perPage)} ({filteredRooms.length} filtered rooms)
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(Math.ceil(filteredRooms.length / perPage), currentPage + 1))}
            disabled={currentPage === Math.ceil(filteredRooms.length / perPage)}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 disabled:opacity-50"
          >
            Next →
          </button>
        </div>
      )}

      {/* Add Room Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-6 text-gray-900">➕ Add New Room</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Building *
                </label>
                <select
                  value={newRoom.building_id}
                  onChange={(e) =>
                    setNewRoom({ ...newRoom, building_id: e.target.value })
                  }
                  className="w-full h-11 px-4 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors"
                  required
                >
                  <option value="">Select Building</option>
                  {buildings?.map((building) => (
                    <option key={building.id} value={building.id}>
                      {building.building_code} - {building.building_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Room Number *
                  </label>
                  <input
                    type="text"
                    value={newRoom.room_number}
                    onChange={(e) =>
                      setNewRoom({ ...newRoom, room_number: e.target.value })
                    }
                    className="w-full h-11 px-4 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors"
                    placeholder="e.g., 101"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Floor
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newRoom.floor_number}
                    onChange={(e) =>
                      setNewRoom({ ...newRoom, floor_number: parseInt(e.target.value) || 1 })
                    }
                    className="w-full h-11 px-4 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors"
                    placeholder="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Room Capacity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newRoom.capacity}
                    onChange={(e) =>
                      setNewRoom({ ...newRoom, capacity: parseInt(e.target.value) || 0 })
                    }
                    className="w-full h-11 px-4 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors"
                    placeholder="30"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Exam Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newRoom.exam_capacity}
                    onChange={(e) =>
                      setNewRoom({ ...newRoom, exam_capacity: parseInt(e.target.value) || newRoom.capacity })
                    }
                    className="w-full h-11 px-4 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors"
                    placeholder="Same as capacity"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Room Type
                  </label>
                  <select
                    value={newRoom.room_type}
                    onChange={(e) => setNewRoom({ ...newRoom, room_type: e.target.value })}
                    className="w-full h-11 px-4 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors"
                  >
                    <option value="Lecture">Lecture</option>
                    <option value="Tutorial">Tutorial</option>
                    <option value="Lab">Lab</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Room Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={newRoom.room_name}
                    onChange={(e) =>
                      setNewRoom({ ...newRoom, room_name: e.target.value })
                    }
                    className="w-full h-11 px-4 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors"
                    placeholder="e.g., Main Hall 101"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newRoom.is_active}
                    onChange={(e) =>
                      setNewRoom({ ...newRoom, is_active: e.target.checked })
                    }
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Active Room
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newRoom.is_bookable}
                    onChange={(e) =>
                      setNewRoom({ ...newRoom, is_bookable: e.target.checked })
                    }
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Available for Booking
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-8">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddRoom}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              >
                ➕ Add Room
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Room Modal */}
      {showEditModal && editingRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-6 text-gray-900">✏️ Edit Room</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Building *
                </label>
                <select
                  value={editingRoom.building_id}
                  disabled
                  className="w-full h-11 px-4 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                >
                  {buildings?.map((building) => (
                    <option key={building.id} value={building.id}>
                      {building.building_code} - {building.building_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Room Number *
                  </label>
                  <input
                    type="text"
                    value={editingRoom.room_number}
                    onChange={(e) =>
                      setEditingRoom({ ...editingRoom, room_number: e.target.value })
                    }
                    className="w-full h-11 px-4 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Floor
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editingRoom.floor_number}
                    onChange={(e) =>
                      setEditingRoom({ ...editingRoom, floor_number: parseInt(e.target.value) || 1 })
                    }
                    className="w-full h-11 px-4 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Room Capacity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editingRoom.capacity}
                    onChange={(e) =>
                      setEditingRoom({ ...editingRoom, capacity: parseInt(e.target.value) || 0 })
                    }
                    className="w-full h-11 px-4 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Exam Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editingRoom.exam_capacity}
                    onChange={(e) =>
                      setEditingRoom({ ...editingRoom, exam_capacity: parseInt(e.target.value) || editingRoom.capacity })
                    }
                    className="w-full h-11 px-4 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Room Type
                  </label>
                  <select
                    value={editingRoom.room_type}
                    onChange={(e) => setEditingRoom({ ...editingRoom, room_type: e.target.value })}
                    className="w-full h-11 px-4 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors"
                  >
                    <option value="Lecture">Lecture</option>
                    <option value="Tutorial">Tutorial</option>
                    <option value="Lab">Lab</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Room Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={editingRoom.room_name || ''}
                    onChange={(e) =>
                      setEditingRoom({ ...editingRoom, room_name: e.target.value })
                    }
                    className="w-full h-11 px-4 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingRoom.is_active}
                    onChange={(e) =>
                      setEditingRoom({ ...editingRoom, is_active: e.target.checked })
                    }
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Active Room
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingRoom.is_bookable}
                    onChange={(e) =>
                      setEditingRoom({ ...editingRoom, is_bookable: e.target.checked })
                    }
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Available for Booking
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-8">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEditRoom}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                💾 Update Room
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Department Assignment Confirmation Modal */}
      {showAssignConfirm && roomToAssign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4 text-gray-900">🎯 Confirm Room Assignment</h3>
            <p className="text-gray-700 mb-4">
              Are you sure you want to assign room <strong>{roomToAssign.room_number}</strong> in <strong>{roomToAssign.building_name}</strong> to the Computer Science department?
            </p>
            <p className="text-sm text-gray-600 mb-6">
              This will create a reservation for the department to use this room for academic purposes.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAssignConfirm(false);
                  setRoomToAssign(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmAssignToDepartment}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                🎯 Assign Room
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default RoomManagement;
