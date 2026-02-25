import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";

function AssignmentTab() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [algorithms, setAlgorithms] = useState([]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(null);
  const perPage = 20;

  const fetchAlgorithms = async () => {
    try {
      const response = await axios.get('/api/algorithms', { withCredentials: true });
      const algos = response.data.algorithms || [];
      setAlgorithms(algos);
      // Set default algorithm (Smart Alphabetical Grouping)
      const defaultAlgo = algos.find(algo => algo.name === 'Smart Alphabetical Grouping' && algo.is_active) ||
                         algos.find(algo => algo.is_active) ||
                         algos[0];
      setSelectedAlgorithm(defaultAlgo);
    } catch (err) {
      console.error('Failed to fetch algorithms:', err);
    }
  };

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/assignments?page=${currentPage}&per_page=${perPage}`, {
        withCredentials: true,
      });
      setAssignments(response.data.assignments || []);
      setTotalPages(response.data.total_pages || 1);
      setTotalItems(response.data.total_items || 0);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch assignments");
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlgorithms();
    fetchAssignments();
  }, [currentPage]);

  useEffect(() => {
    fetchAssignments();
  }, [currentPage]);

  const handleSmartAssign = async () => {
    if (assigning) return;

    setMessage("");
    setError("");
    setAssigning(true);
    setProgress(0);
    setProgressMessage("Initializing smart assignment...");

    try {
      // Start progress simulation for advanced alphabetical algorithm
      const progressSteps = [
        { progress: 10, message: "Getting available rooms...", duration: 500 },
        { progress: 20, message: "Finding eligible students...", duration: 800 },
        { progress: 25, message: "Analyzing student data...", duration: 600 },
        { progress: 30, message: "Calculating optimal distribution...", duration: 800 },
        { progress: 40, message: "Sorting students alphabetically...", duration: 1000 },
        { progress: 45, message: "Creating alphabetical groups...", duration: 700 },
        { progress: 50, message: "Initializing room assignment...", duration: 500 },
        { progress: 90, message: "Assigning groups to rooms...", duration: 2000 },
        { progress: 95, message: "Saving assignments to database...", duration: 800 },
        { progress: 100, message: "Smart assignment complete! 🎯", duration: 300 },
      ];

      // Simulate progress steps
      for (const step of progressSteps) {
        await new Promise(resolve => setTimeout(resolve, step.duration));
        setProgress(step.progress);
        setProgressMessage(step.message);
      }

      // Make actual API call with selected algorithm
      const response = await axios.post(
        "/api/assignments/smart-assign",
        {
          algorithm_id: selectedAlgorithm?.id || null
        },
        { withCredentials: true },
      );

      setMessage(response.data.message || "Smart assignment completed successfully!");
      fetchAssignments(); // Refresh assignments after running algorithm

    } catch (err) {
      setError(err.response?.data?.error || "Smart assignment failed. Please try again.");
      setProgress(0);
      setProgressMessage("");
    } finally {
      setAssigning(false);
      // Clear progress after a delay
      setTimeout(() => {
        setProgress(0);
        setProgressMessage("");
      }, 2000);
    }
  };

  const handleAssignStudents = async () => {
    if (assigning) return;

    setMessage("");
    setError("");
    setAssigning(true);

    try {
      const response = await axios.post(
        "/assign-students",
        {},
        { withCredentials: true },
      );
      setMessage(response.data.message || "Students assigned successfully!");
      fetchAssignments(); // Refresh assignments after running algorithm
    } catch (err) {
      setError(err.response?.data?.error || "Assignment failed. Please try again.");
    } finally {
      setAssigning(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <AdminLayout title="📝 Exam Seating Assignments">
      {/* Header Section with Action Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Exam Room Assignments</h2>
          <p className="text-sm text-gray-600 mt-1">
            Assign students to exam seating locations so they know where to take their exams.
          </p>
          {/* Current Algorithm Info */}
          {selectedAlgorithm && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg max-w-md">
              <div className="flex items-center space-x-2">
                <span className="text-lg">🤖</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-blue-900 truncate">
                    Using: {selectedAlgorithm.name}
                  </p>
                  <p className="text-xs text-blue-700 truncate">
                    {selectedAlgorithm.description}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        <button
          onClick={handleSmartAssign}
          disabled={assigning || loading}
          className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {assigning ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Smart Assigning...
            </span>
          ) : (
            <>
              🎯 Smart Assign
            </>
          )}
        </button>
      </div>

      {/* Progress Bar - Only show when assigning */}
      {assigning && progress > 0 && (
        <div className="mb-6 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-gray-900">Smart Assignment Progress</h3>
            <span className="text-sm font-medium text-gray-600">{progress}% Complete</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Progress Message */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              progress < 30 ? 'bg-red-500' :
              progress < 60 ? 'bg-yellow-500' :
              progress < 90 ? 'bg-blue-500' : 'bg-green-500'
            }`}></div>
            <span className="text-sm text-gray-700 font-medium">{progressMessage}</span>
          </div>

          {/* ETA or additional info */}
          <div className="mt-2 text-xs text-gray-500">
            {progress < 30 && "Analyzing system data..."}
            {progress >= 30 && progress < 60 && "Processing constraints..."}
            {progress >= 60 && progress < 90 && "Optimizing assignments..."}
            {progress >= 90 && "Finalizing results..."}
          </div>
        </div>
      )}

      {/* Success/Error Messages */}
      {message && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{message}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setMessage("")}
                className="inline-flex text-green-800 hover:text-red-600"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError("")}
                className="inline-flex text-red-800 hover:text-red-600"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assignments Table */}
      <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center space-x-3">
              <svg className="animate-spin h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-gray-600">Loading assignments...</span>
            </div>
          </div>
        ) : assignments.length === 0 ? (
          <div className="py-16 px-6 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Assignments Yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Exam seating assignments haven't been created yet. Click below to run the assignment process so students know where to sit for their exams.
            </p>
            <button
              onClick={handleAssignStudents}
              disabled={assigning}
              className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
            >
              🎯 Start Assignment Process
            </button>
          </div>
        ) : (
          <>
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Current Assignment Results</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Showing {assignments.length} of {totalItems} total assignments
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Student Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Student ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Room
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Exam Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assignments.map((assignment, index) => (
                    <tr
                      key={assignment.assignment_id}
                      className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-colors`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {assignment.student_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-mono">
                          {assignment.student_id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {assignment.room_name}
                          </div>
                          <div className="text-xs text-gray-500 ml-2">
                            ({assignment.room_capacity || '?'} capacity)
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {assignment.course || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {assignment.exam_date ? new Date(assignment.exam_date).toLocaleDateString() : "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✅ Assigned
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing page <span className="font-medium">{currentPage}</span> of{" "}
                    <span className="font-medium">{totalPages}</span>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>

                    {/* Page numbers */}
                    {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + idx;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pageNum === currentPage
                              ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}

export default AssignmentTab;
