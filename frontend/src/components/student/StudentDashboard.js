import React, { useState, useEffect } from 'react';
import { useToast } from '../../hooks/useToast';

function StudentDashboard() {
  const { successToast, infoToast, warningToast } = useToast();
  const [assignments, setAssignments] = useState([]);
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportIssue, setReportIssue] = useState(false);
  const [issueType, setIssueType] = useState('');
  const [issueMessage, setIssueMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for demonstration - in real app this would come from API
  useEffect(() => {
    // Simulate API call delay
    setTimeout(() => {
      setAssignments([
        {
          id: 1,
          course_code: 'CS301',
          course_name: 'Computer Science III',
          room_number: 'MB-101',
          building_name: 'Main Building',
          seat_number: 'A5',
          exam_date: '2025-12-10',
          exam_time: '09:00',
          duration: '3 hours',
          instructor: 'Dr. Smith',
          status: 'confirmed',
          room_capacity: 50,
          current_students: 48
        },
        {
          id: 2,
          course_code: 'MATH201',
          course_name: 'Advanced Calculus',
          room_number: 'SH-201',
          building_name: 'Science Hall',
          seat_number: 'B12',
          exam_date: '2025-12-15',
          exam_time: '14:00',
          duration: '2 hours',
          instructor: 'Prof. Johnson',
          status: 'confirmed',
          room_capacity: 30,
          current_students: 28
        }
      ]);

      setUpcomingExams([
        {
          id: 1,
          title: 'Final Exam Reminder',
          message: 'CS301 Final Exam tomorrow at 9:00 AM in MB-101, Seat A5',
          urgency: 'high',
          days_until: 1,
          time: '09:00 AM'
        },
        {
          id: 2,
          title: 'Exam Check-in',
          message: 'MATH201 exam starts in 3 days. Don\'t forget your ID!',
          urgency: 'medium',
          days_until: 3,
          time: '02:00 PM'
        }
      ]);

      // Show welcome message for returning students
      infoToast('Welcome back! You have 2 upcoming exams. Check your assignments below.', 5000);

      setLoading(false);
    }, 1000);

    // Clean up any timers on unmount
    return () => {};
  }, [infoToast]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-gray-100">Loading assignment...</div>;
  }

  // Helper functions
  const getTimeUntilExam = (examDate, examTime) => {
    const examDateTime = new Date(`${examDate}T${examTime}`);
    const now = new Date();
    const diffMs = examDateTime - now;

    if (diffMs <= 0) return "Exam started";

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const handleReportIssue = () => {
    if (!issueType || !issueMessage) {
      warningToast('Please select issue type and provide details', 3000);
      return;
    }

    successToast('Issue reported successfully. Our team will respond within 24 hours.', 4000);
    setReportIssue(false);
    setIssueType('');
    setIssueMessage('');
  };

  const addToCalendar = (assignment) => {
    // Parse duration safely without using eval
    const durationMatch = assignment.duration.match(/(\d+)/);
    const durationHours = durationMatch ? parseInt(durationMatch[1], 10) : 0;
    const durationMs = durationHours * 60 * 60 * 1000;

    // In a real app, this would integrate with calendar APIs
    successToast('Exam added to your calendar! 📅', 3000);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">SR</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">SmartRoom Assignments</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setReportIssue(true)}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100"
              >
                📢 Report Issue
              </button>
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">JS</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Upcoming Exam Alerts */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📅 Upcoming Exams</h2>
          <div className="space-y-3">
            {upcomingExams.map((exam) => (
              <div key={exam.id} className={`p-4 rounded-lg border-l-4 shadow-sm ${
                exam.urgency === 'high' ? 'bg-red-50 border-red-500' :
                exam.urgency === 'medium' ? 'bg-yellow-50 border-yellow-500' :
                'bg-blue-50 border-blue-500'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`text-lg font-bold px-3 py-1 rounded ${
                      exam.urgency === 'high' ? 'bg-red-100 text-red-800' :
                      exam.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {exam.days_until === 1 ? '⏰' : '📅'}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{exam.title}</h3>
                      <p className="text-sm text-gray-600">{exam.message}</p>
                      {exam.days_until <= 1 && (
                        <span className="inline-flex items-center px-2 py-1 mt-2 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Time Critical - {exam.days_until} day remaining
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{exam.time}</div>
                      <div className="text-xs text-gray-500">
                        {exam.days_until === 0 ? 'Today' : `${exam.days_until} days`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search exams by course code, name, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Exam Assignments */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Your Exam Assignments</h3>
            <p className="text-sm text-gray-600">Click on any assignment for detailed information and navigation help</p>
          </div>

          <div className="divide-y divide-gray-200">
            {assignments.filter(assignment =>
              assignment.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
              assignment.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              assignment.building_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              assignment.room_number.includes(searchTerm)
            ).map((assignment) => (
              <div key={assignment.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{assignment.course_code}</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-semibold text-gray-900">{assignment.course_name}</h4>
                        <p className="text-sm text-gray-600">Taught by {assignment.instructor}</p>

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">🏫</span>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{assignment.room_number}</div>
                              <div className="text-sm text-gray-600">{assignment.building_name}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">💺</span>
                            <div>
                              <div className="text-sm font-medium text-gray-900">Seat {assignment.seat_number}</div>
                              <div className="text-sm text-gray-600">
                                {assignment.current_students}/{assignment.room_capacity} students
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">⏰</span>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {new Date(assignment.exam_date).toLocaleDateString()}
                              </div>
                              <div className="text-sm text-gray-600">
                                {assignment.exam_time} ({assignment.duration})
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Time until exam */}
                        <div className="mt-3">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            getTimeUntilExam(assignment.exam_date, assignment.exam_time).includes('Exam started') ?
                            'bg-gray-100 text-gray-800' :
                            getTimeUntilExam(assignment.exam_date, assignment.exam_time).includes('m') && !getTimeUntilExam(assignment.exam_date, assignment.exam_time).includes('d') ?
                            'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            ⏰ {getTimeUntilExam(assignment.exam_date, assignment.exam_time)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="ml-6 flex flex-col space-y-2">
                    <button
                      onClick={() => addToCalendar(assignment)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      📅 Add to Calendar
                    </button>
                    <button className="inline-flex items-center px-3 py-2 border border-indigo-300 rounded-md text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100">
                      🗺️ Directions
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {assignments.filter(assignment =>
              assignment.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
              assignment.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              assignment.building_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              assignment.room_number.includes(searchTerm)
            ).length === 0 && (
              <div className="px-6 py-8 text-center">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
                <p className="text-gray-600">Try adjusting your search terms or check with your instructor.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Footer */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">🎯 Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => window.open('https://campus-map.university.edu', '_blank')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🗺️</div>
                <div className="font-medium text-gray-900">Campus Map</div>
                <div className="text-sm text-gray-600">Find your exam locations</div>
              </div>
            </button>

            <button
              onClick={() => infoToast('📧 Support contact: exams@university.edu - Response within 24 hours', 5000)}
              className="p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">💬</div>
                <div className="font-medium text-gray-900">Contact Support</div>
                <div className="text-sm text-gray-600">Need help with assignments?</div>
              </div>
            </button>

            <button
              onClick={() => setReportIssue(true)}
              className="p-4 border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🚨</div>
                <div className="font-medium text-gray-900">Report Issue</div>
                <div className="text-sm text-gray-600">Problem with your seat?</div>
              </div>
            </button>
          </div>
        </div>
      </main>

      {/* Issue Reporting Modal */}
      {reportIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">🚨 Report an Issue</h2>
              <button
                onClick={() => setReportIssue(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Issue Type</label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select an issue type...</option>
                  <option value="wrong_room">Wrong room assignment</option>
                  <option value="wrong_seat">Wrong seat assignment</option>
                  <option value="time_conflict">Exam time conflict</option>
                  <option value="facility_issue">Room/facility problem</option>
                  <option value="accessibility">Accessibility concern</option>
                  <option value="other">Other issue</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Details</label>
                <textarea
                  value={issueMessage}
                  onChange={(e) => setIssueMessage(e.target.value)}
                  placeholder="Please provide details about your issue..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setReportIssue(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleReportIssue}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;
