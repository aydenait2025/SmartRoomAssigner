import React, { useState, useEffect } from 'react';
import axios from 'axios';

function StudentDashboard() {
  const [assignment, setAssignment] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const response = await axios.get('http://localhost:5000/student-assignment', { withCredentials: true });
        setAssignment(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch assignment');
      } finally {
        setLoading(false);
      }
    };
    fetchAssignment();
  }, []);

  if (loading) {
    return <div className="text-center py-4">Loading assignment...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  return (
    <div className="p-4">
      <h3 className="text-xl font-bold mb-4">Your Exam Room Assignment</h3>
      {assignment && assignment.room ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="mb-2"><strong>Student Name:</strong> {assignment.student_name}</p>
          <p className="mb-2"><strong>Student ID:</strong> {assignment.student_id}</p>
          <p className="mb-2"><strong>Course:</strong> {assignment.course || 'N/A'}</p>
          <p className="mb-2"><strong>Exam Date:</strong> {assignment.exam_date || 'N/A'}</p>
          <p className="mb-2"><strong>Building:</strong> {assignment.room.building_name}</p>
          <p className="mb-2"><strong>Room Number:</strong> {assignment.room.room_number}</p>
          
          <div className="mt-4">
            <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 mr-2">
              Download PDF (Placeholder)
            </button>
            <button className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">
              Print (Placeholder)
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p>No exam room assignment found for you yet.</p>
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;
