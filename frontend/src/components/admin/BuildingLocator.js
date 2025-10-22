import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS
import AdminLayout from './AdminLayout';

// Fix for default marker icon issue with Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function BuildingLocator() {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState(null);
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
      const response = await axios.get('/buildings', { withCredentials: true });
      setBuildings(response.data.buildings || []);
    } catch (err) {
      setError(err.response?.data?.error || '');
    } finally {
      setLoading(false);
    }
  };

  const initializeMap = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.remove(); // Remove existing map if re-initializing
    }

    // Initialize Leaflet map
    leafletMapRef.current = L.map(mapRef.current).setView(UOFT_CENTER, DEFAULT_ZOOM);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(leafletMapRef.current);

    // Add UofT campus boundary
    addUofTCampusBoundary();
  };

  const addUofTCampusBoundary = () => {
    if (!leafletMapRef.current) return;

    // Approximate UofT St. George campus boundary
    const campusBoundary = [
      [43.6700, -79.4100],
      [43.6700, -79.3800],
      [43.6500, -79.3800],
      [43.6500, -79.4100],
    ];

    L.polyline(campusBoundary, {
      color: 'red',
      weight: 2,
      opacity: 1.0,
      dashArray: '5, 5' // Optional: dashed line
    }).addTo(leafletMapRef.current);

    // Add campus label marker
    const uoftIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `
        <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="18" fill="#4285F4" stroke="#ffffff" stroke-width="2"/>
          <text x="20" y="25" text-anchor="middle" fill="white" font-family="Arial" font-size="12" font-weight="bold">UofT</text>
        </svg>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    L.marker(UOFT_CENTER, { icon: uoftIcon, title: 'University of Toronto - St. George Campus' }).addTo(leafletMapRef.current);
  };

  const searchBuildings = (term) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setSelectedBuilding(null);
      // Optionally reset map view or clear markers
      clearBuildingMarkers();
      leafletMapRef.current.setView(UOFT_CENTER, DEFAULT_ZOOM);
      return;
    }

    const found = buildings.find(building => {
      const code = building.building_name.split(' - ')[0];
      const name = building.building_name.split(' - ')[1] || '';
      return code.toLowerCase().includes(term.toLowerCase()) ||
             name.toLowerCase().includes(term.toLowerCase());
    });

    setSelectedBuilding(found || null);
    if (found) {
      showBuildingOnMap(found);
    } else {
      clearBuildingMarkers();
    }
  };

  const clearBuildingMarkers = () => {
    markersRef.current.forEach(marker => {
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
      className: 'custom-div-icon',
      html: `
        <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
          <circle cx="15" cy="15" r="12" fill="#FF6B35" stroke="#ffffff" stroke-width="2"/>
          <text x="15" y="19" text-anchor="middle" fill="white" font-family="Arial" font-size="10" font-weight="bold">
            ${building.building_name.split(' - ')[0]}
          </text>
        </svg>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    const marker = L.marker(buildingCoords, { icon: buildingIcon, title: building.building_name }).addTo(leafletMapRef.current);
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
      'AB': [43.6595, -79.3972], // Astronomy & Astrophysics
      'BA': [43.6598, -79.3960], // Bahen Centre
      'BN': [43.6650, -79.4070], // Bloor - Dufferin area
      'BW': [43.6610, -79.3950], // Wallberg Building
      'CR': [43.6605, -79.3965], // Croft Chapter House
      'EA': [43.6600, -79.3940], // Earth Sciences Centre
      'GB': [43.6615, -79.3955], // Galbraith Building
      'HI': [43.6580, -79.3980], // Haultain Building
      'KP': [43.6620, -79.3945], // Northrop Frye Hall
      'LM': [43.6630, -79.3930], // Lash Miller Chemical Laboratories
      'MP': [43.6590, -79.3990], // McLennan Physical Laboratories
      'MS': [43.6625, -79.3950], // Medical Sciences Building
      'NF': [43.6618, -79.3948], // Northrop Frye Hall
      'OI': [43.6585, -79.3975], // Ontario Institute for Studies in Education
      'PG': [43.6608, -79.3958], // Sidney Smith Hall
      'RW': [43.6592, -79.3968], // Rosebrugh Building
      'SS': [43.6608, -79.3958], // Sidney Smith Hall
      'UC': [43.6628, -79.3955], // University College
      'WE': [43.6612, -79.3952], // Wetmore Hall
    };

    const code = building.building_name.split(' - ')[0];
    return buildingCoordinates[code] || UOFT_CENTER;
  };

  const filteredBuildings = buildings.filter(building => {
    if (!searchTerm) return true;
    const code = building.building_name.split(' - ')[0];
    const name = building.building_name.split(' - ')[1] || '';
    return code.toLowerCase().includes(searchTerm.toLowerCase()) ||
           name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-600">Loading building locator...</div>
      </div>
    );
  }

  return (
    <AdminLayout title="🗺️ Building Locator">
      <div className="flex justify-end space-x-2 mb-6">
        <button
          onClick={fetchBuildings}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
        >
          🔄 Refresh Buildings
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
            <h4 className="text-lg font-semibold mb-4">🔍 Search Buildings</h4>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Building Name or Code
              </label>
              <input
                type="text"
                placeholder="e.g., AB, Bahen, or Astronomy..."
                value={searchTerm}
                onChange={(e) => searchBuildings(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Building List */}
            <div className="max-h-96 overflow-y-auto">
              <h5 className="text-sm font-medium text-gray-700 mb-2">
                Available Buildings ({filteredBuildings.length})
              </h5>
              <div className="space-y-2">
                {filteredBuildings.map((building, index) => {
                  const code = building.building_name.split(' - ')[0];
                  const name = building.building_name.split(' - ')[1] || '';
                  const isSelected = selectedBuilding && selectedBuilding.id === building.id;

                  return (
                    <div
                      key={building.id || index}
                      onClick={() => {
                        setSelectedBuilding(building);
                        showBuildingOnMap(building);
                      }}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-100 border-2 border-blue-500'
                          : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono mr-2">
                              {code}
                            </span>
                            {name}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            Rooms: {building.total_rooms} | Available: {building.available_rooms}
                          </div>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${isSelected ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h5 className="text-sm font-medium text-gray-700 mb-2">📊 Campus Overview</h5>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-blue-50 p-2 rounded">
                  <div className="font-medium text-blue-600">{buildings.length}</div>
                  <div className="text-gray-600">Total Buildings</div>
                </div>
                <div className="bg-green-50 p-2 rounded">
                  <div className="font-medium text-green-600">
                    {buildings.reduce((sum, b) => sum + b.total_rooms, 0)}
                  </div>
                  <div className="text-gray-600">Total Rooms</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Panel */}
        <div className="lg:col-span-2">
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
              className="w-full h-96 lg:h-[500px]"
              style={{ minHeight: '400px' }}
            >
              {/* Leaflet map will render here */}
            </div>
            <div className="p-4 bg-gray-50 text-xs text-gray-600">
              <p>
                <strong>Instructions:</strong> Search for a building by name or code in the search box,
                or click on any building in the list to see its location on the map.
                Building markers show the building code and provide detailed information when clicked.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Building Details Modal */}
      {selectedBuilding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">{selectedBuilding.building_name}</h3>
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
                    <div className="text-2xl font-bold text-blue-600">{selectedBuilding.total_rooms}</div>
                    <div className="text-sm text-gray-600">Total Rooms</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{selectedBuilding.available_rooms}</div>
                    <div className="text-sm text-gray-600">Available Rooms</div>
                  </div>
                </div>

                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{selectedBuilding.total_capacity}</div>
                  <div className="text-sm text-gray-600">Total Capacity</div>
                </div>

                <div className="bg-orange-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{selectedBuilding.total_testing_capacity}</div>
                  <div className="text-sm text-gray-600">Testing Capacity</div>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setSelectedBuilding(null);
                      // Could navigate to Building Management tab
                    }}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
                  >
                    View in Building Management
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
