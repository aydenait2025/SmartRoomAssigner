import React, { useState, useEffect } from "react";
import axios from "axios";

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

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all"); // 'exam', 'class', 'event'
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("asc");

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );

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
      setError(err.response?.data?.error || "Failed to fetch schedules");
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
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-bold">📅 Schedule Management</h3>
          <p className="text-gray-600">
            Manage exam schedules, class times, and room assignments
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className={`px-4 py-2 rounded-lg font-medium ${
              showCalendar
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            📅 Calendar View
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
          >
            ➕ Add Schedule
          </button>
          <button
            onClick={() => {
              /* TODO: Export functionality */
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
          >
            📊 Export
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
            <div className="text-sm text-gray-600">Total Schedules</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600">
              {schedules.filter((s) => s.type === "exam").length}
            </div>
            <div className="text-sm text-gray-600">Exams Scheduled</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="text-2xl font-bold text-purple-600">
              {schedules.filter((s) => s.type === "class").length}
            </div>
            <div className="text-sm text-gray-600">Classes Scheduled</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="text-2xl font-bold text-orange-600">
              {schedules.filter((s) => new Date(s.date) >= new Date()).length}
            </div>
            <div className="text-sm text-gray-600">Upcoming Events</div>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 p-4 bg-white shadow-lg rounded-xl border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="exam">📝 Exam</option>
              <option value="class">📚 Class</option>
              <option value="event">🎪 Event</option>
            </select>
          </div>
          <div>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Date & Time</option>
              <option value="title">Title</option>
              <option value="type">Type</option>
              <option value="building">Building</option>
            </select>
          </div>
          <div>
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
        </div>
      </div>

      {/* Calendar View Toggle */}
      {showCalendar && (
        <div className="mb-6 bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h4 className="text-lg font-semibold">📅 Calendar View</h4>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="p-4">
            <div className="space-y-2">
              {getSchedulesForDate(selectedDate).map((schedule, index) => (
                <div
                  key={index}
                  className="p-3 bg-blue-50 rounded-lg border border-blue-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-medium text-gray-900">
                        {schedule.title}
                      </h5>
                      <p className="text-sm text-gray-600">
                        {schedule.start_time} - {schedule.end_time} |
                        {schedule.building_code} {schedule.room_number}
                      </p>
                      {schedule.course_name && (
                        <p className="text-sm text-blue-600">
                          {schedule.course_name}
                        </p>
                      )}
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        schedule.type === "exam"
                          ? "bg-red-100 text-red-800"
                          : schedule.type === "class"
                            ? "bg-green-100 text-green-800"
                            : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {schedule.type.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
              {getSchedulesForDate(selectedDate).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No schedules for {selectedDate}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
                    Type
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
                    className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-colors`}
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
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          schedule.type === "exam"
                            ? "bg-red-100 text-red-800"
                            : schedule.type === "class"
                              ? "bg-green-100 text-green-800"
                              : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {schedule.type === "exam"
                          ? "📝 Exam"
                          : schedule.type === "class"
                            ? "📚 Class"
                            : "🎪 Event"}
                      </span>
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
                          className="px-3 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSchedule(schedule.id)}
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
            Page {currentPage} of {totalPages} ({totalItems} total schedules)
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
    </div>
  );
}

export default ScheduleManagement;
