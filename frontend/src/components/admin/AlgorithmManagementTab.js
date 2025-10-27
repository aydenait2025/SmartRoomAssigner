import React, { useState, useEffect } from "react";
import axios from "axios";

function AlgorithmManagementTab() {
  const [algorithms, setAlgorithms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    algorithm_logic: '',
    is_active: false
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Predefined algorithm templates
  const algorithmTemplates = {
    'Simple Round Robin': {
      description: 'Basic round-robin assignment. Students assigned sequentially to available rooms.',
      algorithm_logic: '{"type": "round_robin", "rules": ["single_assignment_per_room", "ignore_alphabetical_order"]}'
    },
    'Smart Alphabetical Grouping': {
      description: 'Advanced algorithm that groups students alphabetically. A-K in first room, L-S in second, etc.',
      algorithm_logic: '{"type": "alphabetical_grouping", "rules": ["alphabetical_sorting", "group_by_last_name", "maintain_name_clusters", "multi_room_distribution"]}'
    },
    'Capacity Optimized': {
      description: 'Focuses on maximizing room utilization while respecting capacity limits.',
      algorithm_logic: '{"type": "capacity_optimization", "rules": ["maximize_utilization", "respect_capacity_limits", "balance_load"]}'
    },
    'Department-based Grouping': {
      description: 'Groups students by academic department before alphabetical sorting.',
      algorithm_logic: '{"type": "department_grouping", "rules": ["group_by_department", "alphabetical_within_departments", "department_segregation"]}'
    }
  };

  const fetchAlgorithms = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/algorithms', { withCredentials: true });
      setAlgorithms(response.data.algorithms);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch algorithms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlgorithms();
  }, []);

  const handleCreateAlgorithm = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/algorithms', formData, { withCredentials: true });
      setMessage('Algorithm created successfully!');
      setShowCreateModal(false);
      setFormData({ name: '', description: '', algorithm_logic: '', is_active: false });
      fetchAlgorithms();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create algorithm');
    }
  };

  const handleUpdateAlgorithm = async (algorithmId, updates) => {
    try {
      const response = await axios.put(`/api/algorithms/${algorithmId}`, updates, { withCredentials: true });
      setMessage('Algorithm updated successfully!');
      fetchAlgorithms();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update algorithm');
    }
  };

  const handleDeleteAlgorithm = async (algorithmId, algorithmName) => {
    if (!window.confirm(`Are you sure you want to delete the algorithm "${algorithmName}"?`)) {
      return;
    }

    try {
      const response = await axios.delete(`/api/algorithms/${algorithmId}`, { withCredentials: true });
      setMessage('Algorithm deleted successfully!');
      fetchAlgorithms();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete algorithm');
    }
  };

  const handleActivateAlgorithm = async (algorithmId, algorithmName) => {
    try {
      const response = await axios.put(`/api/algorithms/activate/${algorithmId}`, {}, { withCredentials: true });
      setMessage(`"${algorithmName}" is now the active algorithm!`);
      fetchAlgorithms();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to activate algorithm');
    }
  };

  const handleSeedDefaultAlgorithms = async () => {
    if (!window.confirm('This will create the default assignment algorithms. Continue?')) {
      return;
    }

    try {
      const response = await axios.post('/api/algorithms/seed-default', {}, { withCredentials: true });
      setMessage('Default algorithms seeded successfully!');
      fetchAlgorithms();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to seed default algorithms');
    }
  };

  const handleTemplateSelect = (templateName) => {
    const template = algorithmTemplates[templateName];
    setFormData({
      ...formData,
      name: templateName,
      description: template.description,
      algorithm_logic: template.algorithm_logic
    });
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Algorithm Management
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>Create and manage different assignment algorithms for your institution's needs. Each algorithm defines how students are assigned to exam rooms.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Assignment Algorithms</h2>
          <p className="text-sm text-gray-600 mt-1">
            Configure how students are assigned to exam seating locations.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSeedDefaultAlgorithms}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            🎯 Seed Default Algorithms
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            ➕ Create New Algorithm
          </button>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
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
              <button onClick={() => setMessage('')} className="inline-flex text-green-800 hover:text-gray-600">
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 11-16 0 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button onClick={() => setError('')} className="inline-flex text-red-800 hover:text-gray-600">
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center space-x-3">
            <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-gray-600">Loading algorithms...</span>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Available Algorithms ({algorithms.length})
            </h3>
          </div>

          {/* Algorithms List */}
          <div className="divide-y divide-gray-200">
            {algorithms.length === 0 ? (
              <div className="py-16 px-6 text-center">
                <div className="text-6xl mb-4">⚙️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Algorithms Found</h3>
                <p className="text-gray-600 mb-6">
                  Click "Seed Default Algorithms" to create the basic assignment algorithms.
                </p>
              </div>
            ) : (
              algorithms.map((algo) => (
                <div key={algo.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-lg font-medium text-gray-900">{algo.name}</h4>
                        {algo.is_active && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            🟢 Active
                          </span>
                        )}
                        {algo.name === 'Smart Alphabetical Grouping' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            ⭐ Default
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{algo.description}</p>
                      <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
                        <span>Version: {algo.version}</span>
                        <span>Created: {new Date(algo.created_at).toLocaleDateString()}</span>
                        <span>By: {algo.creator_name}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {!algo.is_active && (
                        <button
                          onClick={() => handleActivateAlgorithm(algo.id, algo.name)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          ⚡ Activate
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAlgorithm(algo.id, algo.name)}
                        disabled={algo.name === 'Smart Alphabetical Grouping'}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>

                  {/* Algorithm Logic Preview */}
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-500">
                      View Algorithm Logic
                    </summary>
                    <pre className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono overflow-x-auto">
                      {algo.algorithm_logic}
                    </pre>
                  </details>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Create Algorithm Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Create New Algorithm</h3>
              <p className="mt-1 text-sm text-gray-600">
                Define a new assignment algorithm for your institution's needs.
              </p>
            </div>

            <form onSubmit={handleCreateAlgorithm} className="p-6 space-y-4">
              {/* Template Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start from Template (Optional)
                </label>
                <select
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a template or create custom...</option>
                  {Object.keys(algorithmTemplates).map(template => (
                    <option key={template} value={template}>{template}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Algorithm Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Smart Department Grouping"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe what this algorithm does..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Algorithm Logic (JSON) *
                </label>
                <textarea
                  required
                  rows={6}
                  value={formData.algorithm_logic}
                  onChange={(e) => setFormData({...formData, algorithm_logic: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder='{"type": "custom_algorithm", "rules": ["rule1", "rule2"]}'
                />
                <p className="text-xs text-gray-500 mt-1">
                  Algorithm logic should be valid JSON defining the assignment rules.
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Set as active algorithm
                </label>
              </div>
            </form>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAlgorithm}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Create Algorithm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AlgorithmManagementTab;
