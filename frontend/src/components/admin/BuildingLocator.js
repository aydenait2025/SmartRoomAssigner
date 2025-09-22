import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function BuildingLocator() {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);

  // University of Toronto coordinates (approximate center)
  const UOFT_CENTER = { lat: 43.6629, lng: -79.3957 };
  const DEFAULT_ZOOM = 15;

  useEffect(() => {
    fetchBuildings();
    loadGoogleMapsAPI();
  }, []);

  const fetchBuildings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/buildings', { withCredentials: true });
      setBuildings(response.data.buildings || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch buildings');
    } finally {
      setLoading(false);
    }
  };

  const loadGoogleMapsAPI = () => {
    if (window.google && window.google.maps) {
      setMapLoaded(true);
      initializeMap();
      return;
    }

    // Load Google Maps API
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyC1r1fMJnO1l6q2k8K3j8H9X4Y5Z6W7V8U&libraries=places`;
    script.async = true;
    script.onload = () => {
      setMapLoaded(true);
      initializeMap();
    };
    script.onerror = () => {
      setError('Failed to load Google Maps. Please check your API key.');
    };
    document.head.appendChild(script);
  };

  const initializeMap = () => {
    if (!window.google || !mapRef.current) return;

    googleMapRef.current = new window.google.maps.Map(mapRef.current, {
      center: UOFT_CENTER,
      zoom: DEFAULT_ZOOM,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      zoomControl: true,
    });

    // Add UofT campus boundary
    addUofTCampusBoundary();
  };

  const addUofTCampusBoundary = () => {
    if (!googleMapRef.current) return;

    // Approximate UofT St. George campus boundary
    const campusBoundary = [
      { lat: 43.6700, lng: -79.4100 },
      { lat: 43.6700, lng: -79.3800 },
      { lat: 43.6500, lng: -79.3800 },
      { lat: 43.6500, lng: -79.4100 },
    ];

    new window.google.maps.Polyline({
      path: campusBoundary,
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2,
      map: googleMapRef.current,
    });

    // Add campus label
    new window.google.maps.Marker({
      position: UOFT_CENTER,
      map: googleMapRef.current,
      title: 'University of Toronto - St. George Campus',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="#4285F4" stroke="#ffffff" stroke-width="2"/>
            <text x="20" y="25" text-anchor="middle" fill="white" font-family="Arial" font-size="12" font-weight="bold">UofT</text>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(40, 40),
        anchor: new window.google.maps.Point(20, 20)
      }
    });
  };

  const searchBuildings = (term) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setSelectedBuilding(null);
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
    }
  };

  const showBuildingOnMap = (building) => {
    if (!googleMapRef.current) return;

    // Clear existing markers
    if (window.buildingMarkers) {
      window.buildingMarkers.forEach(marker => marker.setMap(null));
    }
    window.buildingMarkers = [];

    // Get building coordinates (you may want to add lat/lng to your building data)
    const buildingCoords = getBuildingCoordinates(building);

    // Add marker for the building
    const marker = new window.google.maps.Marker({
      position: buildingCoords,
      map: googleMapRef.current,
      title: building.building_name,
      animation: window.google.maps.Animation.DROP,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
            <circle cx="15" cy="15" r="12" fill="#FF6B35" stroke="#ffffff" stroke-width="2"/>
            <text x="15" y="19" text-anchor="middle" fill="white" font-family="Arial" font-size="10" font-weight="bold">
              ${building.building_name.split(' - ')[0]}
            </text>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(30, 30),
        anchor: new window.google.maps.Point(15, 15)
      }
    });

    window.buildingMarkers = [marker];

    // Center map on building
    googleMapRef.current.setCenter(buildingCoords);
    googleMapRef.current.setZoom(17);

    // Add info window
    const infoWindow = new window.google.maps.InfoWindow({
      content: `
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
      `
    });

    marker.addListener('click', () => {
      infoWindow.open(googleMapRef.current, marker);
    });

    // Open info window by default
    setTimeout(() => {
      infoWindow.open(googleMapRef.current, marker);
    }, 500);
  };

  const getBuildingCoordinates = (building) => {
    // This is a mapping of building codes to approximate coordinates
    // In a real implementation, you would store lat/lng in your database
    const buildingCoordinates = {
      'AB': { lat: 43.6595, lng: -79.3972 }, // Astronomy & Astrophysics
      'BA': { lat: 43.6598, lng: -79.3960 }, // Bahen Centre
      'BN': { lat: 43.6650, lng: -79.4070 }, // Bloor - Dufferin area
      'BW': { lat: 43.6610, lng: -79.3950 }, // Wallberg Building
      'CR': { lat: 43.6605, lng: -79.3965 }, // Croft Chapter House
      'EA': { lat: 43.6600, lng: -79.3940 }, // Earth Sciences Centre
      'GB': { lat: 43.6615, lng: -79.3955 }, // Galbraith Building
      'HI': { lat: 43.6580, lng: -79.3980 }, // Haultain Building
      'KP': { lat: 43.6620, lng: -79.3945 }, // Northrop Frye Hall
      'LM': { lat: 43.6630, lng: -79.3930 }, // Lash Miller Chemical Laboratories
      'MP': { lat: 43.6590, lng: -79.3990 }, // McLennan Physical Laboratories
      'MS': { lat: 43.6625, lng: -79.3950 }, // Medical Sciences Building
      'NF': { lat: 43.6618, lng: -79.3948 }, // Northrop Frye Hall
      'OI': { lat: 43.6585, lng: -79.3975 }, // Ontario Institute for Studies in Education
      'PG': { lat: 43.6608, lng: -79.3958 }, // Sidney Smith Hall
      'RW': { lat: 43.6592, lng: -79.3968 }, // Rosebrugh Building
      'SS': { lat: 43.6608, lng: -79.3958 }, // Sidney Smith Hall
      'UC': { lat: 43.6628, lng: -79.3955 }, // University College
      'WE': { lat: 43.6612, lng: -79.3952 }, // Wetmore Hall
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
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-bold">🗺️ Building Locator</h3>
          <p className="text-gray-600">Find and locate campus buildings on the interactive map</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={fetchBuildings}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
          >
            🔄 Refresh Buildings
          </button>
        </div>
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
              {!mapLoaded && (
                <div className="flex items-center justify-center h-full bg-gray-100">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🗺️</div>
                    <div className="text-gray-600">Loading Google Maps...</div>
                  </div>
                </div>
              )}
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
    </div>
  );
}

export default BuildingLocator;
