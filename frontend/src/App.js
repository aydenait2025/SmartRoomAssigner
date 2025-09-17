import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Login from './components/Login';
import RoomManagement from './components/admin/RoomManagement';
import StudentManagement from './components/admin/StudentManagement';
import AssignmentTab from './components/admin/AssignmentTab';
import Reports from './components/admin/Reports';
import StudentDashboard from './components/student/StudentDashboard';

function App() {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeAdminTab, setActiveAdminTab] = useState('rooms'); // 'rooms', 'students', 'assignment', 'reports'

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('http://localhost:5000/current_user', { withCredentials: true });
        setLoggedInUser(response.data);
      } catch (error) {
        setLoggedInUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.get('http://localhost:5000/logout', { withCredentials: true });
      setLoggedInUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-xl">Loading...</div>;
  }

  if (!loggedInUser) {
    return <Login setLoggedInUser={setLoggedInUser} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 p-4 text-white flex justify-between items-center">
        <h1 className="text-xl font-bold">SmartRoomAssign</h1>
        <div>
          <span>Welcome, {loggedInUser.username} ({loggedInUser.role})</span>
          <button onClick={handleLogout} className="ml-4 px-3 py-1 bg-red-500 rounded hover:bg-red-600">
            Logout
          </button>
        </div>
      </nav>
      <main className="p-4">
        <h2 className="text-2xl font-bold mb-4">
          {loggedInUser.role === 'admin' ? 'Admin Dashboard' : 'Student Portal'}
        </h2>
        
        {loggedInUser.role === 'admin' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="mb-4 border-b border-gray-200">
              <ul className="flex flex-wrap -mb-px text-sm font-medium text-center" id="admin-tabs" role="tablist">
                <li className="mr-2" role="presentation">
                  <button
                    className={`inline-block p-4 border-b-2 rounded-t-lg ${activeAdminTab === 'rooms' ? 'text-blue-600 border-blue-600' : 'hover:text-gray-600 hover:border-gray-300'}`}
                    onClick={() => setActiveAdminTab('rooms')}
                    type="button"
                    role="tab"
                  >
                    Room Management
                  </button>
                </li>
                <li className="mr-2" role="presentation">
                  <button
                    className={`inline-block p-4 border-b-2 rounded-t-lg ${activeAdminTab === 'students' ? 'text-blue-600 border-blue-600' : 'hover:text-gray-600 hover:border-gray-300'}`}
                    onClick={() => setActiveAdminTab('students')}
                    type="button"
                    role="tab"
                  >
                    Student Management
                  </button>
                </li>
                <li className="mr-2" role="presentation">
                  <button
                    className={`inline-block p-4 border-b-2 rounded-t-lg ${activeAdminTab === 'assignment' ? 'text-blue-600 border-blue-600' : 'hover:text-gray-600 hover:border-gray-300'}`}
                    onClick={() => setActiveAdminTab('assignment')}
                    type="button"
                    role="tab"
                  >
                    Assignment
                  </button>
                </li>
                <li role="presentation">
                  <button
                    className={`inline-block p-4 border-b-2 rounded-t-lg ${activeAdminTab === 'reports' ? 'text-blue-600 border-blue-600' : 'hover:text-gray-600 hover:border-gray-300'}`}
                    onClick={() => setActiveAdminTab('reports')}
                    type="button"
                    role="tab"
                  >
                    Reports
                  </button>
                </li>
              </ul>
            </div>
            <div id="admin-tab-content">
              {activeAdminTab === 'rooms' && <RoomManagement />}
              {activeAdminTab === 'students' && <StudentManagement />}
              {activeAdminTab === 'assignment' && <AssignmentTab />}
              {activeAdminTab === 'reports' && <Reports />}
            </div>
          </div>
        )}
        {loggedInUser.role === 'student' && (
          <StudentDashboard />
        )}
      </main>
    </div>
  );
}

export default App;
