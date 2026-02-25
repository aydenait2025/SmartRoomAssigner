import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";

function ScheduleManagement() {
  const [schedules, setSchedules] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const perPage = 10;

  // Search and filter states - Default to exam focus
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("exam"); // Default to exam focus
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("asc");

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

  // File input ref for CSV import
  const fileInputRef = useRef(null);

  const [newSchedule, setNewSchedule] = useState({
    title: "",
    type: "exam", // 'exam', 'class', 'event'
    course_code: "",
    course_name: "",
    building_code: "",
    room_number: "",
    date: "",
    start_time: "09:00",
    end_time: "11:00",
    expected_students: 0,
    description: "",
    is_recurring: false,
    recurring_pattern: "none", // 'daily', 'weekly', 'monthly'
  });

  // Time slots for dropdowns
  const timeSlotsList = [
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
    "19:00",
    "19:30",
    "20:00",
    "20:30",
    "21:00",
    "21:30",
    "22:00",
  ];

  const fetchSchedules = async (page = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/schedules?page=${page}&per_page=${perPage}`,
        { withCredentials: true },
      );
      setSchedules(response.data.schedules);
      setCurrentPage(response.data.current_page);
      setTotalPages(response.data.total_pages);
      setTotalItems(response.data.total_items);
    } catch (err) {
      // Mock data when API is not available
      console.log("Using mock schedule data");
      const mockSchedules = [
        {
          id: 1,
          title: "CSC108 Final Exam",
          type: "exam",
          course_code: "CSC108",
          course_name: "Introduction to Computer Programming",
          building_code: "BA",
          room_number: "1190",
          date: "2025-11-15",
          start_time: "09:00",
          end_time: "11:30",
          expected_students: 245,
          description: "Final examination for CSC108",
        },
        {
          id: 2,
          title: "MAT137 Midterm Exam",
          type: "exam",
          course_code: "MAT137",
          course_name: "Calculus with Applications",
          building_code: "MP",
          room_number: "134",
          date: "2025-11-12",
          start_time: "14:00",
          end_time: "16:30",
          expected_students: 180,
          description: "Mid-term examination",
        },
        {
          id: 3,
          title: "STA237 Quiz - Lecture 1",
          type: "exam",
          course_code: "STA237",
          course_name: "Probability and Statistics",
          building_code: "SS",
          room_number: "1084",
          date: "2025-11-10",
          start_time: "10:00",
          end_time: "12:00",
          expected_students: 156,
          description: "Weekly quiz for STA237",
        },
        {
          id: 4,
          title: "PHY151 Lab Exam",
          type: "exam",
          course_code: "PHY151",
          course_name: "Physics for Life Sciences",
          building_code: "MY",
          room_number: "350",
          date: "2025-11-18",
          start_time: "13:30",
          end_time: "15:30",
          expected_students: 89,
          description: "Laboratory examination",
        },
        {
          id: 5,
          title: "PSY220 Research Study Session",
          type: "class",
          course_code: "PSY220",
          course_name: "Introduction to Social Psychology",
          building_code: "SY",
          room_number: "1005",
          date: "2025-11-08",
          start_time: "16:00",
          end_time: "18:00",
          expected_students: 134,
          description: "Research methodology session",
        },
        {
          id: 6,
          title: "CHM135 Tutorial Session",
          type: "class",
          course_code: "CHM135",
          course_name: "Chemistry for Engineering",
          building_code: "WB",
          room_number: "120",
          date: "2025-11-11",
          start_time: "11:00",
          end_time: "12:30",
          expected_students: 67,
          description: "Tutorial session for CHM135",
        },
        {
          id: 7,
          title: "CIV100 Career Fair",
          type: "event",
          course_code: "",
          course_name: "",
          building_code: "BA",
          room_number: "1170",
          date: "2025-11-20",
          start_time: "09:30",
          end_time: "16:00",
          expected_students: 300,
          description: "Engineering Career Fair - Meet employers",
        },
        {
          id: 8,
          title: "ESS105 Essay Writing Workshop",
          type: "class",
          course_code: "ESS105",
          course_name: "Academic Writing",
          building_code: "UC",
          room_number: "221",
          date: "2025-11-09",
          start_time: "15:00",
          end_time: "17:00",
          expected_students: 92,
          description: "Writing workshop for final essays",
        },
        {
          id: 9,
          title: "AER373 Project Presentation",
          type: "exam",
          course_code: "AER373",
          course_name: "Aircraft Flight Dynamics",
          building_code: "IB",
          room_number: "150",
          date: "2025-11-16",
          start_time: "10:30",
          end_time: "14:30",
          expected_students: 43,
          description: "Final project presentations",
        },
        {
          id: 10,
          title: "ECE220 Circuit Design Lab",
          type: "class",
          course_code: "ECE220",
          course_name: "Electrical and Computer Engineering",
          building_code: "GB",
          room_number: "236",
          date: "2025-11-13",
          start_time: "08:30",
          end_time: "11:30",
          expected_students: 78,
          description: "Laboratory work for circuit design",
        },
      ];

      setSchedules(mockSchedules);
      setCurrentPage(1);
      setTotalPages(1);
      setTotalItems(mockSchedules.length);

      // Remove error message since we're showing mock data
      setError("");
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeSlots = async () => {
    try {
      const response = await axios.get("/time-slots", {
        withCredentials: true,
      });
      setTimeSlots(response.data.time_slots || []);
    } catch (err) {
      console.log("Time slots not available yet");
    }
  };

  useEffect(() => {
    fetchSchedules();
    fetchTimeSlots();
  }, []);

  const handleAddSchedule = async () => {
    try {
      setError("");
      setMessage("");

      // Validate required fields
      if (
        !newSchedule.title ||
        !newSchedule.date ||
        !newSchedule.start_time ||
        !newSchedule.end_time
      ) {
        setError("Please fill in all required fields");
        return;
      }

      // Validate time logic
      if (newSchedule.start_time >= newSchedule.end_time) {
        setError("End time must be after start time");
        return;
      }

      const response = await axios.post("/schedules", newSchedule, {
        withCredentials: true,
      });
      setMessage("Schedule added successfully!");
      setShowAddModal(false);
      resetNewSchedule();
      fetchSchedules();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add schedule");
    }
  };

  const handleEditSchedule = async () => {
    try {
      setError("");
      setMessage("");

      const response = await axios.put(
        `/schedules/${editingSchedule.id}`,
        editingSchedule,
        { withCredentials: true },
      );
      setMessage("Schedule updated successfully!");
      setShowEditModal(false);
      setEditingSchedule(null);
      fetchSchedules();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update schedule");
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!window.confirm("Are you sure you want to delete this schedule?"))
      return;

    try {
      setError("");
      setMessage("");

      await axios.delete(`/schedules/${scheduleId}`, { withCredentials: true });
      setMessage("Schedule deleted successfully!");
      fetchSchedules();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete schedule");
    }
  };

  const resetNewSchedule = () => {
    setNewSchedule({
      title: "",
      type: "exam",
      course_code: "",
      course_name: "",
      building_code: "",
      room_number: "",
      date: "",
      start_time: "09:00",
      end_time: "11:00",
      expected_students: 0,
      description: "",
      is_recurring: false,
      recurring_pattern: "none",
    });
  };

  const openEditModal = (schedule) => {
    setEditingSchedule({ ...schedule });
    setShowEditModal(true);
  };

  const handleExportCSV = () => {
    try {
      const headers = [
        'Title',
        'Type',
        'Course Code',
        'Course Name',
        'Building Code',
        'Room Number',
        'Date',
        'Start Time',
        'End Time',
        'Expected Students',
        'Description'
      ];

      const csvContent = [
        headers.join(','),
        ...schedules.map(schedule => [
          `"${schedule.title.replace(/"/g, '""')}"`,
          schedule.type,
          schedule.course_code || '',
          `"${(schedule.course_name || '').replace(/"/g, '""')}"`,
          schedule.building_code,
          schedule.room_number,
          schedule.date,
          schedule.start_time,
          schedule.end_time,
          schedule.expected_students,
          `"${(schedule.description || '').replace(/"/g, '""')}"`
        ].join(','))
      ];

      const blob = new Blob([csvContent.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');

      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `exam_schedules_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      setMessage('Schedules exported successfully!');
    } catch (err) {
      setError('Failed to export schedules: ' + err.message);
    }
  };

  const handleImportCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
          setError('CSV file must contain at least a header and one data row');
          return;
        }

        // Parse header
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/^"|"$/g, ''));
        const expectedHeaders = ['title', 'type', 'course code', 'course name', 'building code', 'room number', 'date', 'start time', 'end time', 'expected students'];

        // Validate headers (at least some core ones should be present)
        const hasTitle = headers.includes('title');
        const hasDate = headers.includes('date');
        const hasBuildingCode = headers.includes('building code');
        const hasRoomNumber = headers.includes('room number');

        if (!hasTitle || !hasDate || !hasBuildingCode || !hasRoomNumber) {
          setError('CSV must include: Title, Date, Building Code, and Room Number columns');
          return;
        }

        // Parse data rows
        const importedSchedules = [];
        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i]);
          if (values.length === 0) continue;

          const schedule = {};

          // Map headers to values
          headers.forEach((header, index) => {
            const value = values[index]?.trim().replace(/^"|"$/g, '') || '';

            switch (header) {
              case 'title':
                schedule.title = value;
                break;
              case 'type':
                schedule.type = value || 'exam'; // default to exam
                break;
              case 'course code':
                schedule.course_code = value;
                break;
              case 'course name':
                schedule.course_name = value;
                break;
              case 'building code':
                schedule.building_code = value;
                break;
              case 'room number':
                schedule.room_number = value;
                break;
              case 'date':
                schedule.date = value;
                break;
              case 'start time':
                schedule.start_time = value || '09:00';
                break;
              case 'end time':
                schedule.end_time = value || '11:00';
                break;
              case 'expected students':
                schedule.expected_students = parseInt(value) || 0;
                break;
              case 'description':
                schedule.description = value;
                break;
            }
          });

          // Validate required fields
          if (!schedule.title || !schedule.date || !schedule.building_code || !schedule.room_number) {
            continue; // Skip invalid rows
          }

          // Generate temporary ID for frontend display
          schedule.id = `temp-${Date.now()}-${Math.random()}`;
          schedule.is_recurring = false;
          schedule.recurring_pattern = 'none';

          importedSchedules.push(schedule);
        }

        if (importedSchedules.length === 0) {
          setError('No valid schedules found in CSV file');
          return;
        }

        // Merge with existing schedules or replace
        setSchedules(prevSchedules => [...prevSchedules, ...importedSchedules]);

        setMessage(`${importedSchedules.length} schedules imported successfully from CSV!`);

        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

      } catch (err) {
        setError('Failed to parse CSV file: ' + err.message);
      }
    };

    reader.onerror = () => {
      setError('Error reading file');
    };

    reader.readAsText(file);
  };

  // Helper function to parse CSV lines properly (handles quoted fields with commas)
  const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result.filter(item => item !== undefined);
  };

  // Filter and sort schedules
  const getFilteredSchedules = () => {
    let filteredSchedules = [...schedules];

    // Apply search filter
    if (searchTerm) {
      filteredSchedules = filteredSchedules.filter(
        (schedule) =>
          schedule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          schedule.course_code
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          schedule.course_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          schedule.building_code
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          schedule.room_number.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Apply type filter
    if (typeFilter !== "all") {
      filteredSchedules = filteredSchedules.filter(
        (schedule) => schedule.type === typeFilter,
      );
    }

    // Apply date filter
    if (dateFilter !== "all") {
      const today = new Date();
      const filterDate = new Date();

      switch (dateFilter) {
        case "today":
          filterDate.setDate(today.getDate());
          break;
        case "week":
          filterDate.setDate(today.getDate() + 7);
          break;
        case "month":
          filterDate.setMonth(today.getMonth() + 1);
          break;
        default:
          break;
      }

      filteredSchedules = filteredSchedules.filter((schedule) => {
        const scheduleDate = new Date(schedule.date);
        return scheduleDate <= filterDate;
      });
    }

    // Apply sorting
    filteredSchedules.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "date":
          aValue = new Date(a.date + " " + a.start_time);
          bValue = new Date(b.date + " " + b.start_time);
          break;
        case "title":
          aValue = a.title;
          bValue = b.title;
          break;
        case "type":
          aValue = a.type;
          bValue = b.type;
          break;
        case "building":
          aValue = a.building_code;
          bValue = b.building_code;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filteredSchedules;
  };

  const filteredSchedules = getFilteredSchedules();

  // Get schedules for selected date (for calendar view)
  const getSchedulesForDate = (date) => {
    return schedules.filter((schedule) => schedule.date === date);
  };

  // Check for conflicts
  // eslint-disable-next-line no-unused-vars
  const checkScheduleConflict = (newSchedule) => {
    const conflicts = schedules.filter((schedule) => {
      if (schedule.date !== newSchedule.date) return false;

      const existingStart = schedule.start_time;
      const existingEnd = schedule.end_time;
      const newStart = newSchedule.start_time;
      const newEnd = newSchedule.end_time;

      // Check for room conflict
      if (
        schedule.building_code === newSchedule.building_code &&
        schedule.room_number === newSchedule.room_number
      ) {
        return newStart < existingEnd && newEnd > existingStart;
      }

      return false;
    });

    return conflicts;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-600">Loading schedules...</div>
      </div>
    );
  }

  return (
    <AdminLayout title="📝 Exam Schedule">

      {message && <p className="text-green-500 mb-4">{message}</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}


      {/* Search and Filter Controls */}
      <div className="mb-6 p-4 bg-white shadow-lg rounded-xl border border-gray-200">
        <div className="flex items-end gap-4">
          <div className="w-64">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Title, course, building..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          <div className="w-40">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="asc">↑ Ascending</option>
              <option value="desc">↓ Descending</option>
            </select>
          </div>

          <div className="flex gap-2 ml-auto">
            <input
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={handleImportCSV}
              ref={fileInputRef}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium transition-colors"
            >
              📥 Import Schedule
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium transition-colors"
            >
              📤 Export Schedule
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout - Table on Left, Calendar on Right */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Side - Schedules Table (2/3 width) */}
        <div className="xl:col-span-2">
          {/* Schedules Table */}
      <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
        {schedules.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Schedules Found
            </h3>
            <p className="text-gray-600 mb-4">
              Add a new schedule or import schedule data to get started.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Add First Schedule
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Students
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSchedules.map((schedule, index) => (
                  <tr
                    key={schedule.id}
                    className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-colors ${
                      schedule.date === selectedDate ? "ring-2 ring-blue-500 ring-inset" : ""
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {schedule.title}
                      </div>
                      {schedule.description && (
                        <div className="text-xs text-gray-500 mt-1">
                          {schedule.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {schedule.course_code && (
                          <div className="font-mono text-blue-600">
                            {schedule.course_code}
                          </div>
                        )}
                        {schedule.course_name && (
                          <div className="text-xs text-gray-600">
                            {schedule.course_name}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                          {schedule.building_code} {schedule.room_number}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="font-medium">{schedule.date}</div>
                        <div className="text-xs text-gray-600">
                          {schedule.start_time} - {schedule.end_time}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {schedule.expected_students}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(schedule)}
                          className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-xs hover:bg-gray-50 transition-colors"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSchedule(schedule.id)}
                          className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-xs hover:bg-gray-50 transition-colors"
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
      {schedules.length > 0 && (
        <div className="mt-6 flex justify-center items-center space-x-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 disabled:opacity-50"
          >
            ← Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} / {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 disabled:opacity-50"
          >
            Next →
          </button>
        </div>
      )}
        </div>

        {/* Right Side - Calendar View (1/3 width) */}
        <div className="xl:col-span-1">
          <div className="bg-white shadow-xl rounded-xl p-6 border border-gray-200 sticky top-6">
   

            {/* Calendar Header */}
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => {
                  if (calendarMonth === 0) {
                    setCalendarMonth(11);
                    setCalendarYear(calendarYear - 1);
                  } else {
                    setCalendarMonth(calendarMonth - 1);
                  }
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ←
              </button>
              <h5 className="text-lg font-semibold text-center">
                {new Date(calendarYear, calendarMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h5>
              <button
                onClick={() => {
                  if (calendarMonth === 11) {
                    setCalendarMonth(0);
                    setCalendarYear(calendarYear + 1);
                  } else {
                    setCalendarMonth(calendarMonth + 1);
                  }
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                →
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-700 bg-gray-50 rounded">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {(() => {
                const firstDay = new Date(calendarYear, calendarMonth, 1);
                const lastDay = new Date(calendarYear, calendarMonth + 1, 0);
                const daysInMonth = lastDay.getDate();
                const startingDayIndex = firstDay.getDay();
                const days = [];

                // Add empty cells for days before the 1st
                for (let i = 0; i < startingDayIndex; i++) {
                  days.push(
                    <div key={`empty-${i}`} className="p-2 h-12"></div>
                  );
                }

                // Add days of the month
                for (let day = 1; day <= daysInMonth; day++) {
                  const currentDate = new Date(calendarYear, calendarMonth, day).toISOString().split('T')[0];
                  const daySchedules = getSchedulesForDate(currentDate);
                  const today = new Date().toISOString().split('T')[0];
                  const isToday = currentDate === today;
                  const hasSchedules = daySchedules.length > 0;
                  const hasExams = daySchedules.some(schedule => schedule.type === 'exam');

                  days.push(
                    <div
                      key={day}
                      onClick={() => setSelectedDate(currentDate)}
                      className={`
                        p-2 h-12 cursor-pointer rounded-lg transition-colors relative
                        ${isToday ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}
                        ${selectedDate === currentDate ? 'ring-2 ring-blue-400' : ''}
                        ${hasExams && !isToday ? 'ring-2 ring-red-400 ring-opacity-75 bg-red-50' : ''}
                      `}
                    >
                      <span className="text-sm font-medium">{day}</span>
                      {hasSchedules && (
                        <div className="flex justify-center mt-0.5">
                          {daySchedules.slice(0, 3).map((schedule, index) => (
                            <div
                              key={index}
                              className={`
                                w-1 h-1 rounded-full mr-0.5
                                ${schedule.type === 'exam' ? 'bg-red-400' :
                                  schedule.type === 'class' ? 'bg-green-400' : 'bg-purple-400'}
                              `}
                              title={schedule.title}
                            />
                          ))}
                          {daySchedules.length > 3 && (
                            <span className="text-xs text-gray-400">...</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                }

                return days;
              })()}
            </div>

            {/* Selected Date Schedule Details */}
            <div className="mt-6 border-t pt-4">
              <h5 className="text-md font-semibold mb-3 flex items-center">
                <span className="mr-2">📋</span>
                Schedules for {new Date(selectedDate).toLocaleDateString()}
              </h5>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {getSchedulesForDate(selectedDate).length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No schedules for this date</p>
                ) : (
                  getSchedulesForDate(selectedDate).map((schedule, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h6 className="font-medium text-sm text-gray-900 truncate">
                          {schedule.title}
                        </h6>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            schedule.type === 'exam'
                              ? 'bg-red-100 text-red-800'
                              : schedule.type === 'class'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {schedule.type === 'exam' ? '📝' : schedule.type === 'class' ? '📚' : '🎪'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">
                        {schedule.start_time} - {schedule.end_time}
                      </p>
                      <p className="text-xs text-gray-600 flex items-center">
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded text-xs mr-1">
                          {schedule.building_code} {schedule.room_number}
                        </span>
                        {schedule.expected_students} students
                      </p>
                      {schedule.course_code && (
                        <p className="text-xs text-blue-600 mt-1 font-mono">
                          {schedule.course_code}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Schedule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Add New Schedule</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newSchedule.title}
                    onChange={(e) =>
                      setNewSchedule({ ...newSchedule, title: e.target.value })
                    }
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., CSC108 Final Exam"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    value={newSchedule.type}
                    onChange={(e) =>
                      setNewSchedule({ ...newSchedule, type: e.target.value })
                    }
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="exam">📝 Exam</option>
                    <option value="class">📚 Class</option>
                    <option value="event">🎪 Event</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Code
                  </label>
                  <input
                    type="text"
                    value={newSchedule.course_code}
                    onChange={(e) =>
                      setNewSchedule({
                        ...newSchedule,
                        course_code: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., CSC108"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Name
                  </label>
                  <input
                    type="text"
                    value={newSchedule.course_name}
                    onChange={(e) =>
                      setNewSchedule({
                        ...newSchedule,
                        course_name: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Introduction to Computer Science"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Building Code *
                  </label>
                  <input
                    type="text"
                    value={newSchedule.building_code}
                    onChange={(e) =>
                      setNewSchedule({
                        ...newSchedule,
                        building_code: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., BA"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room Number *
                  </label>
                  <input
                    type="text"
                    value={newSchedule.room_number}
                    onChange={(e) =>
                      setNewSchedule({
                        ...newSchedule,
                        room_number: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 101"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={newSchedule.date}
                    onChange={(e) =>
                      setNewSchedule({ ...newSchedule, date: e.target.value })
                    }
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Students
                  </label>
                  <input
                    type="number"
                    value={newSchedule.expected_students}
                    onChange={(e) =>
                      setNewSchedule({
                        ...newSchedule,
                        expected_students: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time *
                  </label>
                  <select
                    value={newSchedule.start_time}
                    onChange={(e) =>
                      setNewSchedule({
                        ...newSchedule,
                        start_time: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {timeSlotsList.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time *
                  </label>
                  <select
                    value={newSchedule.end_time}
                    onChange={(e) =>
                      setNewSchedule({
                        ...newSchedule,
                        end_time: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {timeSlotsList.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newSchedule.description}
                    onChange={(e) =>
                      setNewSchedule({
                        ...newSchedule,
                        description: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Additional notes or special instructions..."
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
                  onClick={handleAddSchedule}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Add Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Schedule Modal */}
      {showEditModal && editingSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Edit Schedule</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={editingSchedule.title}
                    onChange={(e) =>
                      setEditingSchedule({
                        ...editingSchedule,
                        title: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    value={editingSchedule.type}
                    onChange={(e) =>
                      setEditingSchedule({
                        ...editingSchedule,
                        type: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="exam">📝 Exam</option>
                    <option value="class">📚 Class</option>
                    <option value="event">🎪 Event</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Code
                  </label>
                  <input
                    type="text"
                    value={editingSchedule.course_code}
                    onChange={(e) =>
                      setEditingSchedule({
                        ...editingSchedule,
                        course_code: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Name
                  </label>
                  <input
                    type="text"
                    value={editingSchedule.course_name}
                    onChange={(e) =>
                      setEditingSchedule({
                        ...editingSchedule,
                        course_name: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Building Code *
                  </label>
                  <input
                    type="text"
                    value={editingSchedule.building_code}
                    onChange={(e) =>
                      setEditingSchedule({
                        ...editingSchedule,
                        building_code: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room Number *
                  </label>
                  <input
                    type="text"
                    value={editingSchedule.room_number}
                    onChange={(e) =>
                      setEditingSchedule({
                        ...editingSchedule,
                        room_number: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={editingSchedule.date}
                    onChange={(e) =>
                      setEditingSchedule({
                        ...editingSchedule,
                        date: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Students
                  </label>
                  <input
                    type="number"
                    value={editingSchedule.expected_students}
                    onChange={(e) =>
                      setEditingSchedule({
                        ...editingSchedule,
                        expected_students: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time *
                  </label>
                  <select
                    value={editingSchedule.start_time}
                    onChange={(e) =>
                      setEditingSchedule({
                        ...editingSchedule,
                        start_time: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {timeSlotsList.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time *
                  </label>
                  <select
                    value={editingSchedule.end_time}
                    onChange={(e) =>
                      setEditingSchedule({
                        ...editingSchedule,
                        end_time: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {timeSlotsList.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editingSchedule.description}
                    onChange={(e) =>
                      setEditingSchedule({
                        ...editingSchedule,
                        description: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
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
                  onClick={handleEditSchedule}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Update Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default ScheduleManagement;
