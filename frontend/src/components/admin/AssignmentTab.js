import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AssignmentTab() {
  const [assignments, setAssignments] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchAssignments = async () => {
    try {
      const response = await axios.get('http://localhost:5000/assignments', { withCredentials: true });
      setAssignments(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch assignments');
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleAssignStudents = async () => {
    setMessage('');
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/assign-students', {}, { withCredentials: true });
      setMessage(response.data.message);
      fetchAssignments(); // Refresh assignments after running algorithm
    } catch (err) {
      setError(err.response?.data?.error || 'Assignment failed');
    }
  };

  return (
    <div className="p-4">
      <h3 className="text-xl font-bold mb-4">Student Assignment</h3>
      {message && <p className="text-green-500 mb-4">{message}</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="mb-6 p-4 border rounded-lg bg-white shadow-sm">
        <h4 className="text-lg font-semibold mb-2">Run Assignment Algorithm</h4>
        <button onClick={handleAssignStudents} className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600">
          Assign Students to Rooms
        </button>
      </div>

      {assignments.length > 0 && (
        <div className="mb-6 p-4 border rounded-lg bg-white shadow-sm">
          <h4 className="text-lg font-semibold mb-2">Current Assignments</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Student Name</th>
                  <th className="py-2 px-4 border-b">Student ID</th>
                  <th className="py-2 px-4 border-b">Room</th>
                  <th className="py-2 px-4 border-b">Course</th>
                  <th className="py-2 px-4 border-b">Exam Date</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment) => (
                  <tr key={assignment.assignment_id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{assignment.student_name}</td>
                    <td className="py-2 px-4 border-b">{assignment.student_id}</td>
                    <td className="py-2 px-4 border-b">{assignment.room_name}</td>
                    <td className="py-2 px-4 border-b">{assignment.course || 'N/A'}</td>
                    <td className="py-2 px-4 border-b">{assignment.exam_date || 'N/A'}</td>
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

export default AssignmentTab;
