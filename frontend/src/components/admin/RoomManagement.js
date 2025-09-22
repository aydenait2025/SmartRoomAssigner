import React, { useState, useEffect } from 'react';
import axios from 'axios';

function RoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const perPage = 10;

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'available', 'disabled'
  const [buildingFilter, setBuildingFilter] = useState('all'); // 'all', specific building
  const [sortBy, setSortBy] = useState('building'); // 'building', 'room', 'capacity', 'testing'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc', 'desc'

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [newRoom, setNewRoom] = useState({
    building_name: '',
    room_number: '',
    room_capacity: 30,
    testing_capacity: 60,
    allowed: true
  });

  const fetchRooms = async (page = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(`/rooms?page=${page}&per_page=${perPage}`, { withCredentials: true });
      setRooms(response.data.rooms);
      setCurrentPage(response.data.current_page);
      setTotalPages(response.data.total_pages);
      setTotalItems(response.data.total_items);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleAddRoom = async () => {
    try {
      setError('');
      setMessage('');

      // Add room via API
      const response = await axios.post('/rooms', newRoom, { withCredentials: true });
      setMessage('Room added successfully!');
      setShowAddModal(false);
      setNewRoom({ building_name: '', room_number: '', room_capacity: 30, testing_capacity: 60, allowed: true });
      fetchRooms();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add room');
    }
  };

  const handleEditRoom = async () => {
    try {
      setError('');
      setMessage('');

      // Update room via API
      const response = await axios.put(`/rooms/${editingRoom.id}`, editingRoom, { withCredentials: true });
      setMessage('Room updated successfully!');
      setShowEditModal(false);
      setEditingRoom(null);
      fetchRooms();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update room');
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;

    try {
      setError('');
      setMessage('');

      await axios.delete(`/rooms/${roomId}`, { withCredentials: true });
      setMessage('Room deleted successfully!');
      fetchRooms();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete room');
    }
  };

  const openEditModal = (room) => {
    setEditingRoom({ ...room });
    setShowEditModal(true);
  };

  // Get unique buildings for filter dropdown
  const getUniqueBuildings = () => {
    const buildings = [...new Set(rooms.map(room => room.building_name))];
    return buildings.sort();
  };

  // Filter and sort rooms
  const getFilteredRooms = () => {
    let filteredRooms = [...rooms];

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
        switch (statusFilter) {
          case 'available':
            return room.allowed;
          case 'disabled':
            return !room.allowed;
          default:
            return true;
        }
      });
    }

    // Apply building filter
    if (buildingFilter !== 'all') {
      filteredRooms = filteredRooms.filter(room => room.building_name === buildingFilter);
    }

    // Apply sorting
    filteredRooms.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'building':
          aValue = a.building_name;
          bValue = b.building_name;
          break;
        case 'room':
          aValue = a.room_number;
          bValue = b.room_number;
          break;
        case 'capacity':
          aValue = a.room_capacity;
          bValue = b.room_capacity;
          break;
        case 'testing':
          aValue = a.testing_capacity;
          bValue = b.testing_capacity;
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

  const filteredRooms = getFilteredRooms();
  const uniqueBuildings = getUniqueBuildings();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-600">Loading rooms...</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-bold">🚪 Room Management</h3>
          <p className="text-gray-600">Manage all rooms, view details, and modify room information</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
          >
            ➕ Add New Room
          </button>
          <button
            onClick={() => {/* TODO: Export functionality */}}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
          >
            📊 Export Data
          </button>
        </div>
      </div>

      {message && <p className="text-green-500 mb-4">{message}</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Summary Stats */}
      <div className="mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{totalItems}</div>
            <div className="text-sm text-gray-600">Total Rooms</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600">{rooms.filter(r => r.allowed).length}</div>
            <div className="text-sm text-gray-600">Available Rooms</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="text-2xl font-bold text-purple-600">{rooms.reduce((sum, r) => sum + r.room_capacity, 0)}</div>
            <div className="text-sm text-gray-600">Total Capacity</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="text-2xl font-bold text-orange-600">{rooms.reduce((sum, r) => sum + r.testing_capacity, 0)}</div>
            <div className="text-sm text-gray-600">Testing Capacity</div>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 p-4 bg-white shadow-lg rounded-xl border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Rooms</label>
            <input
              type="text"
              placeholder="Building or room number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="available">✅ Available</option>
              <option value="disabled">❌ Disabled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Building Filter</label>
            <select
              value={buildingFilter}
              onChange={(e) => setBuildingFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Buildings</option>
              {uniqueBuildings.map(building => (
                <option key={building} value={building}>{building}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="building">Building Name</option>
              <option value="room">Room Number</option>
              <option value="capacity">Room Capacity</option>
              <option value="testing">Testing Capacity</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="asc">↑ Ascending</option>
              <option value="desc">↓ Descending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rooms Table */}
      <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
        {rooms.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">🚪</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Rooms Found</h3>
            <p className="text-gray-600 mb-4">Add a new room or import room data to get started.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Add First Room
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Building</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Room Number</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Capacity</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Testing Capacity</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRooms.map((room, index) => (
                  <tr key={room.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{room.building_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 bg-gray-100 px-3 py-1 rounded-full text-center w-16">
                        {room.room_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {room.room_capacity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        {room.testing_capacity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        room.allowed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {room.allowed ? '✅ Available' : '❌ Disabled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(room)}
                          className="px-3 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteRoom(room.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                        >
                          🗑️ Delete
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
      {rooms.length > 0 && (
        <div className="mt-6 flex justify-center items-center space-x-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 disabled:opacity-50"
          >
            ← Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages} ({totalItems} total rooms)
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

      {/* Add Room Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-bold mb-4">Add New Room</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Building Name</label>
                <input
                  type="text"
                  value={newRoom.building_name}
                  onChange={(e) => setNewRoom({...newRoom, building_name: e.target.value})}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., AB - Astronomy and Astrophysics"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
                <input
                  type="text"
                  value={newRoom.room_number}
                  onChange={(e) => setNewRoom({...newRoom, room_number: e.target.value})}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 101"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Capacity</label>
                <input
                  type="number"
                  value={newRoom.room_capacity}
                  onChange={(e) => setNewRoom({...newRoom, room_capacity: parseInt(e.target.value)})}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Testing Capacity</label>
                <input
                  type="number"
                  value={newRoom.testing_capacity}
                  onChange={(e) => setNewRoom({...newRoom, testing_capacity: parseInt(e.target.value)})}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={newRoom.allowed}
                  onChange={(e) => setNewRoom({...newRoom, allowed: e.target.checked})}
                  className="mr-2"
                />
                <label className="text-sm text-gray-700">Room is available for assignments</label>
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
                onClick={handleAddRoom}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Add Room
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Room Modal */}
      {showEditModal && editingRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-bold mb-4">Edit Room</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Building Name</label>
                <input
                  type="text"
                  value={editingRoom.building_name}
                  onChange={(e) => setEditingRoom({...editingRoom, building_name: e.target.value})}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
                <input
                  type="text"
                  value={editingRoom.room_number}
                  onChange={(e) => setEditingRoom({...editingRoom, room_number: e.target.value})}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Capacity</label>
                <input
                  type="number"
                  value={editingRoom.room_capacity}
                  onChange={(e) => setEditingRoom({...editingRoom, room_capacity: parseInt(e.target.value)})}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Testing Capacity</label>
                <input
                  type="number"
                  value={editingRoom.testing_capacity}
                  onChange={(e) => setEditingRoom({...editingRoom, testing_capacity: parseInt(e.target.value)})}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={editingRoom.allowed}
                  onChange={(e) => setEditingRoom({...editingRoom, allowed: e.target.checked})}
                  className="mr-2"
                />
                <label className="text-sm text-gray-700">Room is available for assignments</label>
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
                onClick={handleEditRoom}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Update Room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoomManagement;
