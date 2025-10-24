import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css"; // Import Leaflet CSS
import AdminLayout from "./AdminLayout";

// Fix for default marker icon issue with Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

function BuildingLocator() {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [sortBy, setSortBy] = useState("building_name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const itemsPerPage = 10;

  const mapRef = useRef(null);
  const leafletMapRef = useRef(null); // Use a ref for the Leaflet map instance
  const markersRef = useRef([]); // To keep track of Leaflet markers

  // University of Toronto coordinates (approximate center)
  const UOFT_CENTER = [43.6629, -79.3957]; // Leaflet uses [lat, lng]
  const DEFAULT_ZOOM = 15;

  useEffect(() => {
    fetchBuildings();

    // Wait for DOM to be ready before initializing map
    const timer = setTimeout(() => {
      if (mapRef.current) {
        initializeMap();
      }
    }, 200);

    // Cleanup function for Leaflet map and timer
    return () => {
      clearTimeout(timer);
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchBuildings = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/buildings", { withCredentials: true });
      setBuildings(response.data.buildings || []);
    } catch (err) {
      setError(err.response?.data?.error || "");
    } finally {
      setLoading(false);
    }
  };

  const initializeMap = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.remove(); // Remove existing map if re-initializing
    }

    // Initialize Leaflet map
    leafletMapRef.current = L.map(mapRef.current).setView(
      UOFT_CENTER,
      DEFAULT_ZOOM,
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(leafletMapRef.current);

    // Add UofT campus boundary
    addUofTCampusBoundary();
  };

  const addUofTCampusBoundary = () => {
    if (!leafletMapRef.current) return;

    // Approximate UofT St. George campus boundary
    const campusBoundary = [
      [43.67, -79.41],
      [43.67, -79.38],
      [43.65, -79.38],
      [43.65, -79.41],
    ];

    L.polyline(campusBoundary, {
      color: "red",
      weight: 2,
      opacity: 1.0,
      dashArray: "5, 5", // Optional: dashed line
    }).addTo(leafletMapRef.current);

    // Add campus label marker
    const uoftIcon = L.divIcon({
      className: "custom-div-icon",
      html: `
        <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="18" fill="#4285F4" stroke="#ffffff" stroke-width="2"/>
          <text x="20" y="25" text-anchor="middle" fill="white" font-family="Arial" font-size="12" font-weight="bold">UofT</text>
        </svg>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    L.marker(UOFT_CENTER, {
      icon: uoftIcon,
      title: "University of Toronto - St. George Campus",
    }).addTo(leafletMapRef.current);
  };

  // Enhanced search and filter logic
  const filteredAndSortedBuildings = () => {
    let filtered = buildings.filter((building) => {
      const code = building.building_name.split(" - ")[0];
      const name = building.building_name.split(" - ")[1] || "";

      // Search filter
      const matchesSearch = !searchTerm ||
        code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        name.toLowerCase().includes(searchTerm.toLowerCase());

      // Type filter
      const matchesFilter = !filterType || building.type === filterType;

      return matchesSearch && matchesFilter;
    });

    // Sort buildings
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "building_name":
          aValue = a.building_name.toLowerCase();
          bValue = b.building_name.toLowerCase();
          break;
        case "total_rooms":
          aValue = a.total_rooms;
          bValue = b.total_rooms;
          break;
        case "total_capacity":
          aValue = a.total_capacity;
          bValue = b.total_capacity;
          break;
        case "available_rooms":
          aValue = a.available_rooms;
          bValue = b.available_rooms;
          break;
        default:
          aValue = a.building_name.toLowerCase();
          bValue = b.building_name.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  const paginatedBuildings = () => {
    const filtered = filteredAndSortedBuildings();
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  };

  const totalPages = () => {
    return Math.ceil(filteredAndSortedBuildings().length / itemsPerPage);
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handleBuildingSelect = (building) => {
    setSelectedBuilding(building);
    showBuildingOnMap(building);
    setCurrentPage(1); // Reset to first page when selecting a building
  };

  const searchBuildings = (term) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset pagination when searching
    if (!term.trim()) {
      setSelectedBuilding(null);
      clearBuildingMarkers();
      leafletMapRef.current?.setView(UOFT_CENTER, DEFAULT_ZOOM);
    }
  };

  const clearBuildingMarkers = () => {
    markersRef.current.forEach((marker) => {
      if (leafletMapRef.current) {
        leafletMapRef.current.removeLayer(marker);
      }
    });
    markersRef.current = [];
  };

  const showBuildingOnMap = (building) => {
    if (!leafletMapRef.current) return;

    clearBuildingMarkers(); // Clear existing markers

    const buildingCoords = getBuildingCoordinates(building);

    const buildingIcon = L.divIcon({
      className: "custom-div-icon",
      html: `
        <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
          <circle cx="15" cy="15" r="12" fill="#FF6B35" stroke="#ffffff" stroke-width="2"/>
          <text x="15" y="19" text-anchor="middle" fill="white" font-family="Arial" font-size="10" font-weight="bold">
            ${building.building_name.split(" - ")[0]}
          </text>
        </svg>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });

    const marker = L.marker(buildingCoords, {
      icon: buildingIcon,
      title: building.building_name,
    }).addTo(leafletMapRef.current);
    markersRef.current.push(marker);

    leafletMapRef.current.setView(buildingCoords, 17); // Center map on building

    const infoWindowContent = `
      <div style="font-family: Arial, sans-serif; max-width: 250px;">
        <h3 style="margin: 0 0 8px 0; color: #333; font-size: 16px;">
          ${building.building_name}
        </h3>
        <p style="margin: 4px 0; color: #666; font-size: 14px;">
          <strong>Total Rooms:</strong> ${building.total_rooms}
        </p>
        <p style="margin: 4px 0; color: #666; font-size: 14px;">
          <strong>Available Rooms:</strong> ${building.available_rooms}
        </p>
        <p style="margin: 4px 0; color: #666; font-size: 14px;">
          <strong>Total Capacity:</strong> ${building.total_capacity}
        </p>
        <p style="margin: 4px 0; color: #666; font-size: 14px;">
          <strong>Testing Capacity:</strong> ${building.total_testing_capacity}
        </p>
      </div>
    `;

    marker.bindPopup(infoWindowContent).openPopup();
  };

  const getBuildingCoordinates = (building) => {
    const buildingCoordinates = {
      AB: [43.6595, -79.3972], // Astronomy & Astrophysics
      BA: [43.6598, -79.396], // Bahen Centre
      BN: [43.665, -79.407], // Bloor - Dufferin area
      BW: [43.661, -79.395], // Wallberg Building
      CR: [43.6605, -79.3965], // Croft Chapter House
      EA: [43.66, -79.394], // Earth Sciences Centre
      GB: [43.6615, -79.3955], // Galbraith Building
      HI: [43.658, -79.398], // Haultain Building
      KP: [43.662, -79.3945], // Northrop Frye Hall
      LM: [43.663, -79.393], // Lash Miller Chemical Laboratories
      MP: [43.659, -79.399], // McLennan Physical Laboratories
      MS: [43.6625, -79.395], // Medical Sciences Building
      NF: [43.6618, -79.3948], // Northrop Frye Hall
      OI: [43.6585, -79.3975], // Ontario Institute for Studies in Education
      PG: [43.6608, -79.3958], // Sidney Smith Hall
      RW: [43.6592, -79.3968], // Rosebrugh Building
      SS: [43.6608, -79.3958], // Sidney Smith Hall
      UC: [43.6628, -79.3955], // University College
      WE: [43.6612, -79.3952], // Wetmore Hall
    };

    const code = building.building_name.split(" - ")[0];
    return buildingCoordinates[code] || UOFT_CENTER;
  };

  const filteredBuildings = buildings.filter((building) => {
    if (!searchTerm) return true;
    const code = building.building_name.split(" - ")[0];
    const name = building.building_name.split(" - ")[1] || "";
    return (
      code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-600">Loading building locator...</div>
      </div>
    );
  }

  const SortIcon = ({ column }) => {
    if (sortBy !== column) return null;
    return (
      <span className="ml-1">
        {sortOrder === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  return (
    <AdminLayout title="🗺️ Building Locator">
      {/* Header Controls */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="🔍 Search by name or code..."
            value={searchTerm}
            onChange={(e) => searchBuildings(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[250px]"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="Lecture">Lecture</option>
            <option value="Lab">Lab</option>
            <option value="Office">Office</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchBuildings}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Buildings Table */}
        <div className="bg-white shadow-lg rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-semibold">
                🏢 Buildings
                <span className="text-sm font-normal text-gray-600 ml-2">
                  ({filteredAndSortedBuildings().length} found)
                </span>
              </h4>
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages()}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Building
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("total_rooms")}
                  >
                    Rooms <SortIcon column="total_rooms" />
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("available_rooms")}
                  >
                    Available <SortIcon column="available_rooms" />
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("total_capacity")}
                  >
                    Capacity <SortIcon column="total_capacity" />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedBuildings().map((building, index) => {
                  const code = building.building_name.split(" - ")[0];
                  const name = building.building_name.split(" - ")[1] || "";
                  const isSelected = selectedBuilding && selectedBuilding.id === building.id;

                  return (
                    <tr
                      key={building.id || index}
                      onClick={() => handleBuildingSelect(building)}
                      className={`cursor-pointer hover:bg-blue-50 transition-colors ${
                        isSelected ? "bg-blue-100 border-l-4 border-blue-500" : ""
                      }`}
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                                {code}
                              </span>
                              {name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {building.total_rooms}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          building.available_rooms > 0
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {building.available_rooms}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {building.total_capacity?.toLocaleString() || "N/A"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBuildingSelect(building);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          🗺️ Map
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredAndSortedBuildings().length)} of{" "}
              {filteredAndSortedBuildings().length} buildings
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages(), currentPage + 1))}
                disabled={currentPage === totalPages()}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {buildings.length}
                </div>
                <div className="text-xs text-gray-600">Total Buildings</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {buildings.reduce((sum, b) => sum + (b.total_rooms || 0), 0)}
                </div>
                <div className="text-xs text-gray-600">Total Rooms</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {buildings.reduce((sum, b) => sum + (b.available_rooms || 0), 0)}
                </div>
                <div className="text-xs text-gray-600">Available Rooms</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {buildings.reduce((sum, b) => sum + (b.total_capacity || 0), 0).toLocaleString()}
                </div>
                <div className="text-xs text-gray-600">Total Capacity</div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Panel */}
        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h4 className="text-lg font-semibold">
              🗺️ Campus Map
              {selectedBuilding && (
                <span className="text-sm font-normal text-gray-600 ml-2">
                  - {selectedBuilding.building_name}
                </span>
              )}
            </h4>
          </div>
          <div
            ref={mapRef}
            className="w-full h-96 xl:h-[600px]"
            style={{ minHeight: "500px" }}
          >
            {/* Leaflet map will render here */}
          </div>
          <div className="p-4 bg-gray-50 text-xs text-gray-600">
            <p className="mb-2">
              <strong>Instructions:</strong> Click on any building in the table to see its location on the map.
              Building markers show the building code and provide detailed information when clicked.
            </p>
            <p>
              <strong>Legend:</strong> 🔵 Campus boundary | 🏛️ Buildings | 📍 Selected building
            </p>
          </div>
        </div>
      </div>

      {/* Building Details Modal */}
      {selectedBuilding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">
                  {selectedBuilding.building_name}
                </h3>
                <button
                  onClick={() => setSelectedBuilding(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedBuilding.total_rooms}
                    </div>
                    <div className="text-sm text-gray-600">Total Rooms</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedBuilding.available_rooms}
                    </div>
                    <div className="text-sm text-gray-600">Available Rooms</div>
                  </div>
                </div>

                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {selectedBuilding.total_capacity?.toLocaleString() || "N/A"}
                  </div>
                  <div className="text-sm text-gray-600">Total Capacity</div>
                </div>

                <div className="bg-orange-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {selectedBuilding.total_testing_capacity?.toLocaleString() || "N/A"}
                  </div>
                  <div className="text-sm text-gray-600">Testing Capacity</div>
                </div>

                <div className="pt-3 border-t border-gray-200 space-y-2">
                  <button
                    onClick={() => showBuildingOnMap(selectedBuilding)}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
                  >
                    🗺️ Center on Map
                  </button>
                  <button
                    onClick={() => setSelectedBuilding(null)}
                    className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium"
                  >
                    Close Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default BuildingLocator;
