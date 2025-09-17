import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Reports() {
  const [assignments, setAssignments] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [assignmentsRes, roomsRes, studentsRes] = await Promise.all([
        axios.get('http://localhost:5000/assignments', { withCredentials: true }),
        axios.get('http://localhost:5000/rooms', { withCredentials: true }),
        axios.get('http://localhost:5000/students', { withCredentials: true }),
      ]);
      setAssignments(assignmentsRes.data);
      setRooms(roomsRes.data);
      setStudents(studentsRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch report data');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

    return Object.values(roomStats);
  };

  const getUnassignedStudents = () => {
    const assignedStudentIds = new Set(assignments.map(a => a.student_id));
    return students.filter(student => !assignedStudentIds.has(student.id));
  };

  const studentsPerRoom = getStudentsPerRoom();
  const unassignedStudents = getUnassignedStudents();

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
    <div className="p-4">
      <h3 className="text-xl font-bold mb-4">Reports & Export</h3>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="mb-6 p-4 border rounded-lg bg-white shadow-sm">
        <h4 className="text-lg font-semibold mb-2">Export Options</h4>
        <button onClick={handleExportCSV} className="mr-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
          Download CSV
        </button>
        <button onClick={handleExportPDF} className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">
          Download PDF (Placeholder)
        </button>
      </div>

      <div className="mb-6 p-4 border rounded-lg bg-white shadow-sm">
        <h4 className="text-lg font-semibold mb-2">Students Per Room</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Room</th>
                <th className="py-2 px-4 border-b">Assigned Students</th>
                <th className="py-2 px-4 border-b">Capacity</th>
                <th className="py-2 px-4 border-b">Remaining Capacity</th>
              </tr>
            </thead>
            <tbody>
              {studentsPerRoom.map((roomStat, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{roomStat.building_name}-{roomStat.room_number}</td>
                  <td className="py-2 px-4 border-b">{roomStat.assigned_count}</td>
                  <td className="py-2 px-4 border-b">{roomStat.capacity}</td>
                  <td className="py-2 px-4 border-b">{roomStat.capacity - roomStat.assigned_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {unassignedStudents.length > 0 && (
        <div className="mb-6 p-4 border rounded-lg bg-white shadow-sm">
          <h4 className="text-lg font-semibold mb-2">Unassigned Students</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">First Name</th>
                  <th className="py-2 px-4 border-b">Last Name</th>
                  <th className="py-2 px-4 border-b">Student ID</th>
                </tr>
              </thead>
              <tbody>
                {unassignedStudents.map((student, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{student.first_name}</td>
                    <td className="py-2 px-4 border-b">{student.last_name}</td>
                    <td className="py-2 px-4 border-b">{student.student_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;
