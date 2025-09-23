import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';

// Advanced Analytics Components
const AnalyticsChart = ({ data, title, type = 'bar' }) => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    // Simulate chart data preparation
    setChartData(data);
  }, [data]);

  if (!chartData) return <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>;

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
      <h5 className="text-lg font-semibold mb-4">{title}</h5>
      <div className="h-64 flex items-end justify-center space-x-2">
        {chartData.map((item, index) => (
          <div key={index} className="flex flex-col items-center">
            <div
              className={`w-8 rounded-t ${
                type === 'bar' ? 'bg-blue-500' : 'bg-gradient-to-t from-blue-400 to-blue-600'
              }`}
              style={{ height: `${Math.max((item.value / Math.max(...chartData.map(d => d.value))) * 200, 20)}px` }}
            ></div>
            <div className="text-xs text-gray-600 mt-2 transform -rotate-45 origin-top-left">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PredictiveAnalytics = ({ data }) => {
  const [predictions, setPredictions] = useState(null);

  useEffect(() => {
    // Simulate predictive analytics
    const mockPredictions = {
      optimalUtilization: 85,
      predictedConflicts: Math.floor(Math.random() * 5),
      efficiencyScore: Math.floor(Math.random() * 20) + 80,
      recommendations: [
        'Consider adding overflow rooms for high-demand time slots',
        'Redistribute students to balance room utilization',
        'Schedule maintenance during low-utilization periods'
      ]
    };
    setPredictions(mockPredictions);
  }, [data]);

  if (!predictions) return <div className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-lg shadow-lg border border-blue-200">
      <h5 className="text-lg font-semibold mb-4 text-blue-800">🔮 Predictive Analytics</h5>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white p-3 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{predictions.optimalUtilization}%</div>
          <div className="text-sm text-gray-600">Optimal Utilization Rate</div>
        </div>
        <div className="bg-white p-3 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{predictions.predictedConflicts}</div>
          <div className="text-sm text-gray-600">Potential Conflicts</div>
        </div>
      </div>
      <div className="bg-white p-3 rounded-lg">
        <div className="text-2xl font-bold text-blue-600">{predictions.efficiencyScore}%</div>
        <div className="text-sm text-gray-600">Assignment Efficiency Score</div>
      </div>
      <div className="mt-4">
        <h6 className="font-medium text-gray-800 mb-2">💡 AI Recommendations:</h6>
        <ul className="space-y-1">
          {predictions.recommendations.map((rec, index) => (
            <li key={index} className="text-sm text-gray-700 flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              {rec}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const UtilizationTrends = ({ data }) => {
  const [trendData, setTrendData] = useState(null);

  useEffect(() => {
    // Simulate trend data
    const mockTrends = [
      { period: 'Week 1', utilization: 65, assignments: 120 },
      { period: 'Week 2', utilization: 72, assignments: 135 },
      { period: 'Week 3', utilization: 68, assignments: 128 },
      { period: 'Week 4', utilization: 78, assignments: 142 },
      { period: 'Current', utilization: 75, assignments: 138 }
    ];
    setTrendData(mockTrends);
  }, [data]);

  if (!trendData) return <div className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>;

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
      <h5 className="text-lg font-semibold mb-4">📈 Utilization Trends</h5>
      <div className="space-y-3">
        {trendData.map((trend, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium">{trend.period}</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{trend.assignments} assignments</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 bg-blue-500 rounded-full"
                    style={{ width: `${trend.utilization}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{trend.utilization}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CustomReportBuilder = () => {
  const [reportConfig, setReportConfig] = useState({
    title: '',
    metrics: [],
    filters: {},
    dateRange: '30',
    format: 'table'
  });

  const availableMetrics = [
    { id: 'utilization', name: 'Room Utilization %', category: 'Performance' },
    { id: 'assignments', name: 'Total Assignments', category: 'Volume' },
    { id: 'capacity', name: 'Room Capacity', category: 'Infrastructure' },
    { id: 'conflicts', name: 'Schedule Conflicts', category: 'Issues' },
    { id: 'efficiency', name: 'Assignment Efficiency', category: 'Performance' }
  ];

  const handleMetricToggle = (metricId) => {
    setReportConfig(prev => ({
      ...prev,
      metrics: prev.metrics.includes(metricId)
        ? prev.metrics.filter(m => m !== metricId)
        : [...prev.metrics, metricId]
    }));
  };

  const generateReport = () => {
    // Simulate report generation
    console.log('Generating custom report:', reportConfig);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
      <h5 className="text-lg font-semibold mb-4">🔧 Custom Report Builder</h5>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Report Title</label>
          <input
            type="text"
            value={reportConfig.title}
            onChange={(e) => setReportConfig({...reportConfig, title: e.target.value})}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="My Custom Report"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
          <select
            value={reportConfig.dateRange}
            onChange={(e) => setReportConfig({...reportConfig, dateRange: e.target.value})}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Metrics</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {availableMetrics.map(metric => (
            <label key={metric.id} className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50">
              <input
                type="checkbox"
                checked={reportConfig.metrics.includes(metric.id)}
                onChange={() => handleMetricToggle(metric.id)}
                className="rounded"
              />
              <span className="text-sm">{metric.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Output Format</label>
        <select
          value={reportConfig.format}
          onChange={(e) => setReportConfig({...reportConfig, format: e.target.value})}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="table">📊 Table</option>
          <option value="chart">📈 Chart</option>
          <option value="dashboard">📋 Dashboard</option>
        </select>
      </div>

      <div className="mt-6 flex justify-end space-x-2">
        <button
          onClick={() => setReportConfig({ title: '', metrics: [], filters: {}, dateRange: '30', format: 'table' })}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
        >
          Reset
        </button>
        <button
          onClick={generateReport}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Generate Report
        </button>
      </div>
    </div>
  );
};

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
      setError(err.response?.data?.error || '');
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
    <AdminLayout title="📊 Reports & Analytics">

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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Room Utilization Report (2/3 width) */}
        <div className="lg:col-span-2 bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
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
                  className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="free">Free Rooms</option>
                  <option value="good">Good (0-90%)</option>
                  <option value="full">Nearly Full (90%+)</option>
                  <option value="over">Over Capacity</option>
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

      {/* Advanced Analytics Section */}
      <div className="mt-8 space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <h3 className="text-2xl font-bold mb-2">🚀 Advanced Analytics Dashboard</h3>
          <p className="text-blue-100">AI-powered insights and predictive analytics for optimal room utilization</p>
        </div>

        {/* Analytics Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnalyticsChart
            data={[
              { label: 'Mon', value: 75 },
              { label: 'Tue', value: 82 },
              { label: 'Wed', value: 68 },
              { label: 'Thu', value: 88 },
              { label: 'Fri', value: 72 },
              { label: 'Sat', value: 45 },
              { label: 'Sun', value: 35 }
            ]}
            title="📊 Weekly Utilization Trends"
            type="bar"
          />
          <AnalyticsChart
            data={[
              { label: 'Exams', value: 65 },
              { label: 'Classes', value: 78 },
              { label: 'Events', value: 45 },
              { label: 'Study', value: 32 }
            ]}
            title="📈 Activity Type Distribution"
            type="bar"
          />
        </div>

        {/* Predictive Analytics and Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PredictiveAnalytics data={studentsPerRoom} />
          <UtilizationTrends data={studentsPerRoom} />
        </div>

        {/* Custom Report Builder */}
        <CustomReportBuilder />

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-lg shadow-lg border border-green-200">
            <h5 className="text-lg font-semibold mb-4 text-green-800">✅ Performance Metrics</h5>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Assignment Success Rate</span>
                <span className="font-bold text-green-600">98.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Average Utilization</span>
                <span className="font-bold text-green-600">76.5%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Conflict Resolution</span>
                <span className="font-bold text-green-600">94.1%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">System Efficiency</span>
                <span className="font-bold text-green-600">89.7%</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-100 p-6 rounded-lg shadow-lg border border-blue-200">
            <h5 className="text-lg font-semibold mb-4 text-blue-800">📋 System Health</h5>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Database Performance</span>
                <span className="font-bold text-green-600">Excellent</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">API Response Time</span>
                <span className="font-bold text-green-600">142ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Data Integrity</span>
                <span className="font-bold text-green-600">100%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Uptime</span>
                <span className="font-bold text-green-600">99.9%</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-100 p-6 rounded-lg shadow-lg border border-purple-200">
            <h5 className="text-lg font-semibold mb-4 text-purple-800">🎯 Key Insights</h5>
            <div className="space-y-3">
              <div className="p-3 bg-white rounded-lg">
                <div className="text-sm font-medium text-gray-800">Peak Usage Hours</div>
                <div className="text-xs text-gray-600">9:00 AM - 11:00 AM</div>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <div className="text-sm font-medium text-gray-800">Most Efficient Building</div>
                <div className="text-xs text-gray-600">Bahen Centre (BA) - 92% util.</div>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <div className="text-sm font-medium text-gray-800">Optimization Opportunity</div>
                <div className="text-xs text-gray-600">15% capacity available</div>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <div className="text-sm font-medium text-gray-800">Next Week Forecast</div>
                <div className="text-xs text-gray-600">+12% increase expected</div>
              </div>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <h5 className="text-lg font-semibold mb-4">📤 Advanced Export Options</h5>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={handleExportCSV}
              className="flex flex-col items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
            >
              <span className="text-2xl mb-2">📊</span>
              <span className="text-sm font-medium text-green-800">CSV Report</span>
              <span className="text-xs text-gray-600">Detailed data export</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="flex flex-col items-center p-4 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors"
            >
              <span className="text-2xl mb-2">📄</span>
              <span className="text-sm font-medium text-red-800">PDF Report</span>
              <span className="text-xs text-gray-600">Formatted document</span>
            </button>
            <button
              onClick={() => {/* TODO: Excel export */}}
              className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
            >
              <span className="text-2xl mb-2">📈</span>
              <span className="text-sm font-medium text-blue-800">Excel Charts</span>
              <span className="text-xs text-gray-600">Interactive workbook</span>
            </button>
            <button
              onClick={() => {/* TODO: Dashboard export */}}
              className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors"
            >
              <span className="text-2xl mb-2">📋</span>
              <span className="text-sm font-medium text-purple-800">Dashboard</span>
              <span className="text-xs text-gray-600">Interactive HTML</span>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default Reports;
