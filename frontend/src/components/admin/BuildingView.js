import React, { useState, useEffect } from 'react';
import axios from 'axios';

function BuildingView() {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [seedLoading, setSeedLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const perPage = 10; // Number of items per page
  const [uploadMessage, setUploadMessage] = useState('');
  const fileInputRef = React.useRef(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'available', 'unavailable'
  const [sortBy, setSortBy] = useState('name'); // 'name', 'rooms', 'capacity', 'available'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc', 'desc'


  const fetchBuildings = async (page = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(`/buildings?page=${page}&per_page=${perPage}`, { withCredentials: true });
      setBuildings(response.data.buildings);
      setCurrentPage(response.data.current_page);
      setTotalPages(response.data.total_pages);
      setTotalItems(response.data.total_items);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch buildings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuildings();
  }, [currentPage]); // Added currentPage to dependency array

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }

    setUploadMessage('');
    setError('');
    setSeedLoading(true); // Use seedLoading to indicate upload in progress

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:5000/import-buildings', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });
      setUploadMessage(response.data.message);
      fetchBuildings(); // Refresh the building list after import
    } catch (err) {
      setError(err.response?.data?.error || 'File import failed');
    } finally {
      setSeedLoading(false);
      e.target.value = null; // Clear the file input
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Filter and sort buildings
  const getFilteredBuildings = () => {
    let filteredBuildings = [...buildings];

    // Apply search filter
    if (searchTerm) {
      filteredBuildings = filteredBuildings.filter(building => {
        const code = building.building_name.split(' - ')[0];
        const name = building.building_name.split(' - ')[1] || '';
        return code.toLowerCase().includes(searchTerm.toLowerCase()) ||
               name.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filteredBuildings = filteredBuildings.filter(building => {
        switch (statusFilter) {
          case 'available':
            return building.available_rooms > 0;
          case 'unavailable':
            return building.available_rooms === 0;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filteredBuildings.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'name':
          aValue = a.building_name.split(' - ')[1] || a.building_name;
          bValue = b.building_name.split(' - ')[1] || b.building_name;
          break;
        case 'rooms':
          aValue = a.total_rooms;
          bValue = b.total_rooms;
          break;
        case 'capacity':
          aValue = a.total_capacity;
          bValue = b.total_capacity;
          break;
        case 'available':
          aValue = a.available_rooms;
          bValue = b.available_rooms;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filteredBuildings;
  };

  const filteredBuildings = getFilteredBuildings();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-600">Loading buildings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchBuildings}
          className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-bold">🏢 Building Management</h3>
          <p className="text-gray-600">Manage all campus buildings, view details, and import building data</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={triggerFileInput}
            disabled={seedLoading}
            className={`px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium ${
              seedLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {seedLoading ? '📤 Uploading...' : '📥 Import Buildings'}
          </button>
          <button
            onClick={() => {/* TODO: Export functionality */}}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
          >
            📊 Export Data
          </button>
        </div>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          ref={fileInputRef}
          style={{ display: 'none' }}
        />
      </div>

      {uploadMessage && <p className="text-green-500 mb-4">{uploadMessage}</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Summary Stats */}
      <div className="mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Total Buildings Card */}
          <div className="group relative bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-102 cursor-pointer">
            <div className="absolute inset-0 bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="text-2xl font-bold mb-1 group-hover:scale-105 transition-transform duration-300">{totalItems}</div>
              <div className="text-xs font-medium opacity-90">Total Buildings</div>
              <div className="absolute top-1 right-1 opacity-20 group-hover:opacity-40 transition-opacity duration-300">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Rooms Card */}
          <div className="group relative bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-102 cursor-pointer">
            <div className="absolute inset-0 bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="text-2xl font-bold mb-1 group-hover:scale-105 transition-transform duration-300">{buildings.reduce((sum, b) => sum + b.total_rooms, 0)}</div>
              <div className="text-xs font-medium opacity-90">Total Rooms</div>
              <div className="absolute top-1 right-1 opacity-20 group-hover:opacity-40 transition-opacity duration-300">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Capacity Card */}
          <div className="group relative bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-102 cursor-pointer">
            <div className="absolute inset-0 bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="text-2xl font-bold mb-1 group-hover:scale-105 transition-transform duration-300">{buildings.reduce((sum, b) => sum + b.total_capacity, 0).toLocaleString()}</div>
              <div className="text-xs font-medium opacity-90">Total Capacity</div>
              <div className="absolute top-1 right-1 opacity-20 group-hover:opacity-40 transition-opacity duration-300">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  <path d="M6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Students Card */}
          <div className="group relative bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-102 cursor-pointer">
            <div className="absolute inset-0 bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="text-2xl font-bold mb-1 group-hover:scale-105 transition-transform duration-300">0</div>
              <div className="text-xs font-medium opacity-90">Total Students</div>
              <div className="absolute top-1 right-1 opacity-20 group-hover:opacity-40 transition-opacity duration-300">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 p-4 bg-white shadow-lg rounded-xl border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Buildings</label>
            <input
              type="text"
              placeholder="Building code or name..."
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
              <option value="all">All Buildings</option>
              <option value="available">🟢 Available</option>
              <option value="unavailable">🔴 Unavailable</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="name">Building Name</option>
              <option value="rooms">Total Rooms</option>
              <option value="capacity">Total Capacity</option>
              <option value="available">Available Rooms</option>
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

      {/* Buildings Table */}
      <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
        {buildings.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">🏢</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Buildings Found</h3>
            <p className="text-gray-600 mb-4">Click the "Upload Buildings" button to import building data from a CSV file.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Building Code</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Building Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Rooms</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Room Capacity</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Testing Capacity</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Available Rooms</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBuildings.map((building, index) => {
                  const code = building.building_name.split(' - ')[0];
                  const name = building.building_name.split(' - ')[1];

                  return (
                    <tr key={building.building_name} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900 bg-blue-100 px-3 py-1 rounded-full font-mono">
                            {code}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {building.total_rooms}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          {building.total_capacity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                          {building.total_testing_capacity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          building.available_rooms === building.total_rooms
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {building.available_rooms}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          building.available_rooms > 0
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {building.available_rooms > 0 ? '🟢 Available' : '🔴 Unavailable'}
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

      {/* Footer Info */}
      {buildings.length > 0 && (
        <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">
            <strong>Note:</strong> Each building is automatically equipped with multiple rooms. You can modify room details, capacities, and availability through the "Room Management" tab. Use the "Upload Buildings" button to import building data from a CSV file.
          </p>
          <div className="flex justify-center items-center mt-4 space-x-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 disabled:opacity-50 flex items-center"
            >
              &larr; Previous
            </button>
            <span>
              Page {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 disabled:opacity-50 flex items-center"
            >
              Next &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BuildingView;
