import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";

function BuildingLocator() {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [buildingTypeFilter, setBuildingTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
const defaultItemsPerPage = 10;
const [showAllMode, setShowAllMode] = useState(false);

  const [newBuilding, setNewBuilding] = useState({
    building_code: "",
    building_name: "",
    campus: "",
    full_address: "",
    latitude: "",
    longitude: "",
    building_type: "",
  });

  useEffect(() => {
    fetchBuildings();
  }, []);

  const fetchBuildings = async () => {
    try {
      setLoading(true);
      setError("");
      // Fetch all buildings without pagination limit
      const response = await axios.get("/buildings?per_page=1000", { withCredentials: true });
      setBuildings(response.data.buildings || []);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load buildings");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBuilding = async () => {
    try {
      setError("");
      setMessage("");
      await axios.post("/buildings", newBuilding, { withCredentials: true });
      setMessage("Building created successfully!");
      setShowCreateModal(false);
      setNewBuilding({
        building_code: "",
        building_name: "",
        campus: "",
        full_address: "",
        latitude: "",
        longitude: "",
        building_type: "",
      });
      fetchBuildings();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create building");
    }
  };

  const handleEditBuilding = async () => {
    try {
      setError("");
      setMessage("");
      await axios.put(`/buildings/${editingBuilding.id}`, editingBuilding, { withCredentials: true });
      setMessage("Building updated successfully!");
      setShowEditModal(false);
      setEditingBuilding(null);
      fetchBuildings();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update building");
    }
  };

  const handleDeleteBuilding = async (buildingId, displayName) => {
    if (!window.confirm(`Are you sure you want to delete "${displayName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setError("");
      setMessage("");
      await axios.delete(`/buildings/${buildingId}`, { withCredentials: true });
      setMessage("Building deleted successfully!");
      fetchBuildings();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete building");
    }
  };

  const openEditModal = (building) => {
    setEditingBuilding({ ...building });
    setShowEditModal(true);
  };

  const filteredBuildings = buildings.filter((building) => {
    // Check search term filter
    const searchMatch = !searchTerm ||
      building.building_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      building.building_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (building.campus && building.campus.toLowerCase().includes(searchTerm.toLowerCase()));

    // Check building type filter
    const typeMatch = !buildingTypeFilter || building.building_type === buildingTypeFilter;

    // Check status filter
    const statusMatch = !statusFilter ||
      (statusFilter === "active" && building.is_active) ||
      (statusFilter === "inactive" && !building.is_active);

    return searchMatch && typeMatch && statusMatch;
  });

  const paginatedBuildings = filteredBuildings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredBuildings.length / itemsPerPage);

  // Reset currentPage if it exceeds totalPages (happens after search/filter changes)
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const toggleShowAll = () => {
    if (showAllMode) {
      // Switch back to paginated view
      setShowAllMode(false);
      setItemsPerPage(defaultItemsPerPage);
      setCurrentPage(1);
    } else {
      // Switch to show all view
      setShowAllMode(true);
      setItemsPerPage(filteredBuildings.length > 0 ? filteredBuildings.length : 1000);
      setCurrentPage(1);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="🗺️ Buildings Info">
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-600">Loading building locations...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="🗺️ Buildings Info">
      {message && <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg"><p className="text-green-800">{message}</p></div>}
      {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg"><p className="text-red-800">{error}</p></div>}

      {/* Controls Bar */}
      <div className="mb-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Search Row */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between gap-4">
              {/* Search & Filters */}
              <div className="flex gap-2">
                {/* Search */}
                <div className="w-64">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 hover:bg-white transition-colors text-sm"
                    />
                  </div>
                </div>

                {/* Type Filter */}
                <div className="w-32">
                  <div className="relative">
                    <select
                      value={buildingTypeFilter}
                      onChange={(e) => {
                        setBuildingTypeFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="block w-full pl-8 pr-6 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 hover:bg-white transition-colors text-xs appearance-none"
                    >
                      <option value="">All Types</option>
                      <option value="academic">Academic</option>
                      <option value="laboratory">Lab</option>
                      <option value="residence">Residence</option>
                    </select>
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                      </svg>
                    </div>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Status Filter */}
                <div className="w-32">
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="block w-full pl-8 pr-6 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 hover:bg-white transition-colors text-xs appearance-none"
                    >
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchBuildings}
                  disabled={loading}
                  className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-xs font-medium ${
                    loading
                      ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                      : 'text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  } transition-colors`}
                >
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>

                <button
                  onClick={toggleShowAll}
                  disabled={loading}
                  className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-xs font-medium ${showAllMode ? 'text-orange-700' : 'text-gray-700'} bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
                >
                  {showAllMode ? (
                    <>
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                      Show Less
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      Show All
                    </>
                  )}
                </button>

                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-3 py-2 border border-transparent rounded-lg text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
                >
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Buildings Table */}
      <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200"></div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Building Code & Name
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Map
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedBuildings.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center">
                    <div className="text-4xl mb-2">🏢</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {searchTerm ? "No buildings found" : "No buildings registered"}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {searchTerm
                        ? "Try adjusting your search terms."
                        : "Add a building to start tracking locations."
                      }
                    </p>
                    {!searchTerm && (
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 mt-2"
                      >
                        ➕ Add First Building
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedBuildings.map((building, index) => (
                  <tr
                    key={building.id}
                    className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-colors`}
                  >
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-xs font-medium text-gray-900 bg-blue-100 px-2 py-1 rounded-full font-mono mb-1">
                            {building.building_code}
                          </div>
                          <div className="text-sm text-gray-900 font-medium">
                            {building.building_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="text-sm text-gray-900">
                        {building.full_address && (
                          <div className="text-xs text-gray-600 max-w-xs leading-tight">
                            {building.full_address}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-center">
                      {building.full_address ? (
                        <button
                          onClick={() => {
                            const url = `https://maps.google.com/?q=${encodeURIComponent(building.full_address)}`;
                            window.open(url, '_blank');
                          }}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                          title="Open in Google Maps"
                        >
                          📍
                        </button>
                      ) : building.latitude && building.longitude ? (
                        <button
                          onClick={() => {
                            const url = `https://maps.google.com/?q=${building.latitude},${building.longitude}`;
                            window.open(url, '_blank');
                          }}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                          title="Open in Google Maps"
                        >
                          📍
                        </button>
                      ) : (
                        <span className="text-gray-400 text-lg">-</span>
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {building.building_type && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {building.building_type}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        building.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {building.is_active ? "✓" : "✗"}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium space-x-1">
                      <button
                        onClick={() => openEditModal(building)}
                        className="px-2 py-1 text-xs hover:text-yellow-600 transition-colors"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteBuilding(building.id, building.display_name)}
                        className="px-2 py-1 text-xs hover:text-red-600 transition-colors"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center items-center space-x-4">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 disabled:opacity-50"
            >
              ← Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 disabled:opacity-50"
            >
              Next →
            </button>
          </div>
        )}


      </div>

      {/* Create Building Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Add New Building</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Building Code *
                    </label>
                    <input
                      type="text"
                      value={newBuilding.building_code}
                      onChange={(e) => setNewBuilding({...newBuilding, building_code: e.target.value.toUpperCase()})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., BA, BAH, ENG"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Building Name *
                    </label>
                    <input
                      type="text"
                      value={newBuilding.building_name}
                      onChange={(e) => setNewBuilding({...newBuilding, building_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Bahen Centre"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campus
                  </label>
                  <select
                    value={newBuilding.campus}
                    onChange={(e) => setNewBuilding({...newBuilding, campus: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Campus</option>
                    <option value="St. George">St. George</option>
                    <option value="UTSC">UTSC (Scarborough)</option>
                    <option value="UTM">UTM (Mississauga)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Address
                  </label>
                  <textarea
                    value={newBuilding.full_address}
                    onChange={(e) => setNewBuilding({...newBuilding, full_address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Complete building address"
                    rows="2"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={newBuilding.latitude}
                      onChange={(e) => setNewBuilding({...newBuilding, latitude: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="43.6629"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={newBuilding.longitude}
                      onChange={(e) => setNewBuilding({...newBuilding, longitude: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="-79.3957"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Building Type
                    </label>
                    <select
                      value={newBuilding.building_type}
                      onChange={(e) => setNewBuilding({...newBuilding, building_type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Type</option>
                      <option value="Academic">Academic</option>
                      <option value="Administrative">Administrative</option>
                      <option value="Residential">Residential</option>
                      <option value="Library">Library</option>
                      <option value="Gym">Gym</option>
                      <option value="Research">Research</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateBuilding}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
                >
                  Add Building
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Building Modal */}
      {showEditModal && editingBuilding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Edit Building</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Building Code *
                    </label>
                    <input
                      type="text"
                      value={editingBuilding.building_code}
                      onChange={(e) => setEditingBuilding({...editingBuilding, building_code: e.target.value.toUpperCase()})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Building Name *
                    </label>
                    <input
                      type="text"
                      value={editingBuilding.building_name}
                      onChange={(e) => setEditingBuilding({...editingBuilding, building_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campus
                  </label>
                  <select
                    value={editingBuilding.campus || ""}
                    onChange={(e) => setEditingBuilding({...editingBuilding, campus: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Campus</option>
                    <option value="St. George">St. George</option>
                    <option value="UTSC">UTSC (Scarborough)</option>
                    <option value="UTM">UTM (Mississauga)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Address
                  </label>
                  <textarea
                    value={editingBuilding.full_address || ""}
                    onChange={(e) => setEditingBuilding({...editingBuilding, full_address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="2"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={editingBuilding.latitude || ""}
                      onChange={(e) => setEditingBuilding({...editingBuilding, latitude: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={editingBuilding.longitude || ""}
                      onChange={(e) => setEditingBuilding({...editingBuilding, longitude: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Building Type
                    </label>
                    <select
                      value={editingBuilding.building_type || ""}
                      onChange={(e) => setEditingBuilding({...editingBuilding, building_type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Type</option>
                      <option value="Academic">Academic</option>
                      <option value="Administrative">Administrative</option>
                      <option value="Residential">Residential</option>
                      <option value="Library">Library</option>
                      <option value="Gym">Gym</option>
                      <option value="Research">Research</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingBuilding.is_active}
                      onChange={(e) => setEditingBuilding({...editingBuilding, is_active: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Building is active</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditBuilding}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
                >
                  Update Building
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default BuildingLocator;
