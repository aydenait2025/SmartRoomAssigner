import React, { useState, useEffect } from 'react';
import axios from 'axios';

function RoomManagement() {
  const [roomData, setRoomData] = useState([]);
  const [file, setFile] = useState(null);
  const [textData, setTextData] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchRooms = async () => {
    try {
      const response = await axios.get('http://localhost:5000/rooms', { withCredentials: true });
      setRoomData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch rooms');
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleTextChange = (e) => {
    setTextData(e.target.value);
  };

  const handleUpload = async () => {
    setMessage('');
    setError('');
    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    } else if (textData) {
      formData.append('text', textData);
    } else {
      setError('Please provide a file or paste CSV data.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/upload-rooms', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });
      setRoomData(response.data);
      setMessage('Data uploaded for preview. Remember to save!');
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    }
  };

  const handleSave = async () => {
    setMessage('');
    setError('');
    try {
      await axios.post('http://localhost:5000/save-rooms', roomData, { withCredentials: true });
      setMessage('Rooms saved successfully!');
      fetchRooms(); // Refresh data after saving
    } catch (err) {
      setError(err.response?.data?.error || 'Save failed');
    }
  };

  const handleRoomChange = (index, field, value) => {
    const newRoomData = [...roomData];
    newRoomData[index][field] = value;
    setRoomData(newRoomData);
  };

  return (
    <div className="p-4">
      <h3 className="text-xl font-bold mb-4">Room Management</h3>
      {message && <p className="text-green-500 mb-4">{message}</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="mb-6 p-4 border rounded-lg bg-white shadow-sm">
        <h4 className="text-lg font-semibold mb-2">Upload Room Data</h4>
        <input type="file" accept=".csv,.txt" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
        <p className="my-2 text-gray-600">OR</p>
        <textarea
          placeholder="Paste CSV/text data here"
          value={textData}
          onChange={handleTextChange}
          rows="5"
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        ></textarea>
        <button onClick={handleUpload} className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
          Preview Data
        </button>
      </div>

      {roomData.length > 0 && (
        <div className="mb-6 p-4 border rounded-lg bg-white shadow-sm">
          <h4 className="text-lg font-semibold mb-2">Preview & Edit Rooms</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Building Name</th>
                  <th className="py-2 px-4 border-b">Room Number</th>
                  <th className="py-2 px-4 border-b">Room Capacity</th>
                  <th className="py-2 px-4 border-b">Testing Capacity</th>
                  <th className="py-2 px-4 border-b">Allowed</th>
                </tr>
              </thead>
              <tbody>
                {roomData.map((room, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">
                      <input
                        type="text"
                        value={room.building_name}
                        onChange={(e) => handleRoomChange(index, 'building_name', e.target.value)}
                        className="w-full p-1 border rounded-md"
                      />
                    </td>
                    <td className="py-2 px-4 border-b">
                      <input
                        type="text"
                        value={room.room_number}
                        onChange={(e) => handleRoomChange(index, 'room_number', e.target.value)}
                        className="w-full p-1 border rounded-md"
                      />
                    </td>
                    <td className="py-2 px-4 border-b">
                      <input
                        type="number"
                        value={room.room_capacity}
                        onChange={(e) => handleRoomChange(index, 'room_capacity', parseInt(e.target.value))}
                        className="w-full p-1 border rounded-md"
                      />
                    </td>
                    <td className="py-2 px-4 border-b">
                      <input
                        type="number"
                        value={room.testing_capacity}
                        onChange={(e) => handleRoomChange(index, 'testing_capacity', parseInt(e.target.value))}
                        className="w-full p-1 border rounded-md"
                      />
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      <input
                        type="checkbox"
                        checked={room.allowed}
                        onChange={(e) => handleRoomChange(index, 'allowed', e.target.checked)}
                        className="form-checkbox h-5 w-5 text-blue-600"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={handleSave} className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
            Save Rooms to Database
          </button>
        </div>
      )}
    </div>
  );
}

export default RoomManagement;
