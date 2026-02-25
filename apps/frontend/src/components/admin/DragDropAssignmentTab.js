import React, { useState, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import axios from "axios";
import AdminLayout from "./AdminLayout";

const ItemTypes = {
  COURSE: 'course'
};

// ExamBlock Component - Draggable exam blocks
function ExamBlock({ exam }) {
  // Show remaining enrollment if partially assigned, otherwise show total
  const displayCount = exam.enrollment_remaining !== undefined ? exam.enrollment_remaining : (exam.student_count || 0);
  const isPartiallyAssigned = exam.enrollment_remaining !== undefined && exam.enrollment_remaining !== exam.student_count;

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.COURSE,
    item: {
      courseId: exam.id,
      courseName: `${exam.course_code} - ${exam.course_name}`,
      studentCount: displayCount, // Use remaining count for drag operations
      students: [] // Exams don't have direct students
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`bg-white rounded-lg p-2 border-2 cursor-move hover:shadow-md transition-all duration-200 min-h-[60px] flex items-center justify-center ${
        isPartiallyAssigned
          ? 'border-orange-400 bg-orange-50' // Partially assigned - orange
          : isDragging
          ? 'opacity-50 scale-95 border-purple-500'
          : 'border-purple-200 hover:border-purple-400'
      }`}
    >
      <div className="text-center">
        <div className="font-bold text-purple-900 text-xs">{exam.course_code}</div>
        <div className="text-gray-700 text-xs truncate max-w-[100px]">{exam.course_name}</div>
        <div className={`text-xs font-medium ${isPartiallyAssigned ? 'text-orange-700' : 'text-gray-600'}`}>
          {displayCount} {isPartiallyAssigned ? 'remaining' : 'students'}
        </div>
        {isPartiallyAssigned && (
          <div className="text-xs text-orange-600 mt-0.5">
            (partially assigned)
          </div>
        )}
      </div>
    </div>
  );
}

// RoomDropZone Component - Drop Target
function RoomDropZone({
  room,
  assignments,
  pendingAssignment,
  pendingRoom,
  onCourseDropped,
  onConfirmAssignment,
  onCancelAssignment
}) {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.COURSE,
    canDrop: (item) => {
      // Prevent dropping if room already has a course
      const assignedCourses = assignments[room.id] || [];
      if (assignedCourses.length > 0) return false;

      // Prevent dropping if there's a pending assignment for this room
      if (pendingRoom && pendingRoom.id === room.id) return false;

      // Note: We allow course enrollment to exceed room capacity
      // This is OK because a course can span multiple rooms
      return true;
    },
    drop: (item) => onCourseDropped(item, room),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }));

  const assignedCourses = assignments[room.id] || [];
  const totalAssignedStudents = assignedCourses.reduce((sum, course) => sum + (course.student_count || course.studentCount || 0), 0);
  const remainingCapacity = Math.max(0, room.capacity - totalAssignedStudents);

  const isThisRoomPending = pendingRoom && pendingRoom.id === room.id;
  const isRoomFull = assignedCourses.length > 0;

  return (
    <div className="bg-gray-50 rounded-lg p-2 h-full">
      <div
        ref={drop}
        className={`border-2 border-dashed rounded-lg p-3 min-h-[140px] transition-all duration-200 relative ${
          isThisRoomPending
            ? 'border-yellow-400 bg-yellow-50 shadow-lg'
            : isRoomFull
            ? 'border-blue-400 bg-blue-50 cursor-not-allowed'
            : isOver && canDrop
            ? 'border-green-400 bg-green-50 shadow-lg scale-[1.02]'
            : isOver && !canDrop
            ? 'border-red-400 bg-red-50 cursor-not-allowed'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-100'
        }`}
      >
        {/* Room Header */}
        <div className="mb-3 text-center">
          <h3 className="font-bold text-gray-900 text-sm">Room {room.room_number}</h3>
          <div className="text-xs text-gray-600">
            Total capacity: {room.capacity} seats
          </div>
          <div className="text-xs text-gray-600">
            Assigned: {totalAssignedStudents} • Remaining: {remainingCapacity}
          </div>
          <div className={`text-xs font-medium ${
            remainingCapacity === 0 && totalAssignedStudents > 0
              ? 'text-red-600'
              : remainingCapacity < room.capacity * 0.3 && totalAssignedStudents > 0
              ? 'text-orange-600'
              : 'text-green-600'
          }`}>
            {isRoomFull ? 'ASSIGNED' : remainingCapacity === 0 ? 'FULL' :
             remainingCapacity < room.capacity * 0.3 ? 'ALMOST FULL' : 'AVAILABLE'}
          </div>

          {isThisRoomPending && pendingAssignment && (
            <div className="mt-2 text-yellow-700 font-medium">
              ⏳ PENDING: {pendingAssignment.courseName}
            </div>
          )}

          {isOver && canDrop && (
            <div className="mt-2 text-green-600 font-medium animate-bounce">
              🎯 DROP HERE!
            </div>
          )}

          {isOver && !canDrop && (
            <div className="mt-2 text-red-600 font-medium">
              🚫 CANNOT DROP
            </div>
          )}
        </div>

        {/* Pending Assignment Controls */}
        {isThisRoomPending && (
          <div className="flex space-x-2 mb-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onConfirmAssignment(pendingAssignment, room);
              }}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs font-medium"
            >
              ✓ Confirm
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCancelAssignment();
              }}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-medium"
            >
              ✕ Cancel
            </button>
          </div>
        )}

        {/* Assigned Courses in this Room */}
        <div className="space-y-2">
          {assignedCourses.map((course) => (
            <AssignedCourseItem
              key={course.id}
              course={course}
              roomId={room.id}
            />
          ))}

          {/* Show pending course */}
          {isThisRoomPending && pendingAssignment && (
            <div className="bg-yellow-100 border border-yellow-300 rounded p-2">
              <div className="font-medium text-yellow-800 text-xs">{pendingAssignment.courseName}</div>
              <div className="text-xs text-yellow-700">{pendingAssignment.studentCount} students - PENDING CONFIRMATION</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// AssignedCourseItem Component - Shows course assigned to room
function AssignedCourseItem({ course, roomId }) {
  const handleRemove = async () => {
    if (!window.confirm(`Remove ${course.name} from this room?`)) return;

    try {
      // Clear assignments for this course from this room
      await axios.delete(`/api/assignments/remove-course/${roomId}/${course.id}`, {
        withCredentials: true
      });
      // Refresh would be handled by parent component
      window.location.reload(); // Simple refresh for now
    } catch (error) {
      console.error('Failed to remove course assignment:', error);
      alert('Failed to remove course assignment');
    }
  };

  return (
    <div className="bg-green-100 border border-green-300 rounded p-2 flex items-center justify-between">
      <div className="flex-1">
        <div className="font-medium text-green-900 text-xs">{course.name}</div>
        <div className="text-xs text-green-700">{course.student_count} students assigned</div>
      </div>
      <button
        onClick={handleRemove}
        className="text-red-500 hover:text-red-700 ml-2 p-1"
        title="Remove assignment"
      >
        ✕
      </button>
    </div>
  );
}

// Main DragDropAssignmentTab Component
function DragDropAssignmentTab() {
  const [courses, setCourses] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [pendingAssignment, setPendingAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [courseEnrollmentData, setCourseEnrollmentData] = useState({}); // Track total/remaining enrollment

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);

      // Get user info to check department
      const userResponse = await axios.get('/api/auth/me', {
        withCredentials: true
      });

      const userInfo = userResponse.data.user;
      const departmentId = userInfo.department_id;

      // Fetch upcoming exams with student counts
      const coursesResponse = await axios.get('/api/exams?upcoming_only=true&limit=10', {
        withCredentials: true
      });

      // Fetch rooms for user's department or all active rooms if no department
      const roomsParams = new URLSearchParams({
        status: 'active'
      });

      // If user has a department, filter by department
      if (departmentId) {
        roomsParams.append('department_id', departmentId);
        roomsParams.append('per_page', '100'); // Get more rooms for department
      } else {
        roomsParams.append('per_page', '50'); // Get fewer rooms if showing all
      }

      const roomsResponse = await axios.get(`/api/rooms?${roomsParams}`, {
        withCredentials: true
      });

      setCourses(coursesResponse.data.exams || []);
      setRooms(roomsResponse.data.rooms || []);

      // Generate current assignments by room
      const currentAssignments = {};
      roomsResponse.data.rooms?.forEach(room => {
        currentAssignments[room.id] = [];
      });

      // If there are existing assignments, map them back
      // This would need to be implemented based on your assignment structure
      setAssignments(currentAssignments);

    } catch (err) {
      console.error('Detailed error loading data:', err);
      console.error('Response:', err.response?.data);
      console.error('Status:', err.response?.status);
      setError(`Failed to load courses and rooms: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseDropped = (courseItem, room) => {
    // Set pending assignment - don't assign to database yet
    setPendingAssignment({
      courseId: courseItem.courseId,
      courseName: courseItem.courseName,
      studentCount: courseItem.studentCount,
      roomId: room.id
    });

    setMessage(`📌 ${courseItem.courseName} staged for room ${room.room_number} - press "Confirm" to assign to database`);
    setError(""); // Clear any existing error
  };

  const handleConfirmAssignment = async (pendingItem, room) => {
    try {
      setMessage(`🔄 Assigning ${pendingItem.courseName} to room ${room.room_number}...`);

      // Now actually assign to database
      const response = await axios.post('/api/assignments/assign-course-to-room', {
        course_id: pendingItem.courseId,
        room_id: room.id,
        algorithm_id: 1 // Use smart alphabetical by default
      }, { withCredentials: true });

      const assignmentData = response.data;
      const assignmentType = assignmentData.assignment_type; // "partial" or "full"
      const studentsAssigned = assignmentData.student_count;
      const remainingStudents = assignmentData.remaining_students;

      setMessage(`✅ ${pendingItem.courseName}: ${studentsAssigned} students assigned to room ${room.room_number}! ${remainingStudents > 0 ? `(${remainingStudents} remaining to assign)` : ''}`);

      // Update local state - ensure only ONE course per room
      setAssignments(prev => ({
        ...prev,
        [room.id]: [{
          id: pendingItem.courseId,
          name: pendingItem.courseName,
          student_count: studentsAssigned, // Use actual assigned count
          course_code: pendingItem.courseName.split(' - ')[0] || pendingItem.courseName,
          course_name: pendingItem.courseName.split(' - ')[1] || pendingItem.courseName,
          roomId: room.id
        }]
      }));

      // Update course list: only remove if fully assigned
      if (assignmentType === 'full') {
        // Remove course completely - fully assigned
        setCourses(prev => prev.filter(c => c.id !== pendingItem.courseId));
      } else {
        // Partial assignment: update remaining enrollment
        setCourses(prev => prev.map(c =>
          c.id === pendingItem.courseId
            ? { ...c, student_count: remainingStudents, enrollment_remaining: remainingStudents }
            : c
        ));
      }

      // Clear pending assignment
      setPendingAssignment(null);

    } catch (error) {
      console.error('Assignment error details:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Unknown error';
      setError(`Failed to assign ${pendingItem.courseName}: ${errorMsg}`);
      setMessage("");
    }
  };

  const handleCancelAssignment = () => {
    setMessage("❌ Assignment cancelled");
    setPendingAssignment(null);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleClearAllAssignments = async () => {
    if (!window.confirm('Clear all assignments? This will remove all student-to-room assignments.')) return;

    try {
      await axios.delete('/api/assignments/clear-all', { withCredentials: true });
      setMessage('All assignments cleared successfully!');
      setAssignments({});
      fetchData(); // Refresh data
    } catch (error) {
      setError('Failed to clear assignments');
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-3">
          <svg className="animate-spin h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-gray-600">Loading courses and rooms...</span>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout title="📝 Exam Seating Assignments">
      <DndProvider backend={HTML5Backend}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">📝 Exam Seating Assignments</h1>
          <p className="text-gray-600">
            Drag upcoming exams from the left panel to assign students to room seating.
            Students are automatically sorted alphabetically by last name.
          </p>
        </div>

        {/* Messages */}
        {message && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{message}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 11-16 0 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Bar */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-600">
            {courses.length} upcoming exams · {rooms.length} rooms ready
          </div>
          <button
            onClick={handleClearAllAssignments}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
          >
            🗑️ Clear All Assignments
          </button>
        </div>

        {/* Main Drag-Drop Area */}
        <div className="grid grid-cols-12 gap-4 min-h-[600px] items-start">
          {/* Left Panel - Exams */}
          <div className="col-span-3 bg-white rounded-lg shadow-lg p-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              📝 Coming Exams
              <span className="ml-2 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                {courses.length}
              </span>
            </h2>

            <div className="grid grid-cols-1 gap-3">
              {courses.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <div className="text-3xl mb-2">📅</div>
                  <p>No upcoming exams to assign!</p>
                </div>
              ) : (
                courses.map((exam) => (
                  <ExamBlock key={exam.id} exam={exam} />
                ))
              )}
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="flex items-center justify-center">
            <div className="h-full w-px bg-gradient-to-b from-blue-300 via-purple-300 to-green-300"></div>
          </div>

          {/* Right Panel - Rooms */}
          <div className="col-span-8">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 h-full">
              {rooms.map((room) => (
                <RoomDropZone
                  key={room.id}
                  room={room}
                  assignments={assignments}
                  pendingAssignment={pendingAssignment}
                  pendingRoom={pendingAssignment ? rooms.find(r => r.id === pendingAssignment.roomId) : null}
                  onCourseDropped={handleCourseDropped}
                  onConfirmAssignment={handleConfirmAssignment}
                  onCancelAssignment={handleCancelAssignment}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
    </AdminLayout>
  );
}

export default DragDropAssignmentTab;
