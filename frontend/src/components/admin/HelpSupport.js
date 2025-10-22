import React, { useState } from 'react';
import { useToast } from '../../hooks/useToast';
import AdminLayout from './AdminLayout';

function HelpSupport() {
  const { successToast, infoToast } = useToast();
  const [activeTab, setActiveTab] = useState('faq');
  const [searchTerm, setSearchTerm] = useState('');
  const [supportForm, setSupportForm] = useState({
    subject: '',
    category: 'general',
    priority: 'medium',
    message: ''
  });

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would send the support request to the backend
    successToast(`Support request submitted: ${supportForm.subject}`);
    setSupportForm({
      subject: '',
      category: 'general',
      priority: 'medium',
      message: ''
    });
  };

  const faqData = [
    {
      id: 1,
      question: 'How do I assign students to rooms?',
      answer: 'Navigate to Assignments tab, select an exam, and use the "Smart Assign" button for automatic assignment or "Manual Assign" for custom assignments.',
      category: 'assignments'
    },
    {
      id: 2,
      question: 'How do I add new buildings and rooms?',
      answer: 'Go to Room Management, use the "Import Rooms" feature to upload a CSV file with building and room data, or add them manually.',
      category: 'rooms'
    },
    {
      id: 3,
      question: 'How do I import student data?',
      answer: 'Use the Student Management tab and click "Import Students" to upload a CSV file with student information including names, IDs, and departments.',
      category: 'students'
    },
    {
      id: 4,
      question: 'How do I resolve room conflicts?',
      answer: 'The system will highlight conflicts in red. Go to Assignments tab, review the conflicts, and manually reassign students to available rooms.',
      category: 'assignments'
    },
    {
      id: 5,
      question: 'How do I generate reports?',
      answer: 'Visit the Reports tab to generate various reports including assignment summaries, room utilization, and student statistics.',
      category: 'reports'
    },
    {
      id: 6,
      question: 'How do I use the building locator?',
      answer: 'Click on Buildings in the sidebar, search for a building by code or name, and click on buildings to see their location on the interactive map.',
      category: 'buildings'
    }
  ];

  const filteredFAQs = faqData.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const quickActions = [
    {
      title: '📚 User Guide',
      description: 'Complete step-by-step guide',
      action: () => infoToast('User guide would open here')
    },
    {
      title: '🎥 Video Tutorials',
      description: 'Video walkthroughs',
      action: () => infoToast('Video tutorials would open here')
    },
    {
      title: '💬 Live Chat',
      description: 'Chat with support team',
      action: () => infoToast('Live chat would open here')
    },
    {
      title: '📞 Contact Support',
      description: 'Get phone support',
      action: () => infoToast('Phone support would connect here')
    }
  ];

  return (
    <AdminLayout title="❓ Help & Support">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Help & Support Center</h2>
        <p className="text-gray-600">Find answers, get help, and contact support</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
        {[
          { id: 'faq', label: '❓ FAQ', icon: '❓' },
          { id: 'support', label: '🎫 Support', icon: '🎫' },
          { id: 'guides', label: '📚 Guides', icon: '📚' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* FAQ Tab */}
      {activeTab === 'faq' && (
        <div className="space-y-6">
          {/* Search */}
          <div className="max-w-md">
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* FAQ List */}
          <div className="space-y-4">
            {filteredFAQs.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🔍</div>
                <p className="text-gray-600">No FAQs found matching your search.</p>
              </div>
            ) : (
              filteredFAQs.map((faq) => (
                <div key={faq.id} className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-medium text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-600 text-sm">{faq.answer}</p>
                  <div className="mt-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {faq.category}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Support Tab */}
      {activeTab === 'support' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Support Form */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">🎫 Submit Support Request</h3>
            <form onSubmit={handleSupportSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={supportForm.subject}
                  onChange={(e) => setSupportForm({...supportForm, subject: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description of your issue"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={supportForm.category}
                    onChange={(e) => setSupportForm({...supportForm, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="general">General</option>
                    <option value="technical">Technical Issue</option>
                    <option value="assignments">Room Assignments</option>
                    <option value="data">Data Import/Export</option>
                    <option value="reports">Reports</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={supportForm.priority}
                    onChange={(e) => setSupportForm({...supportForm, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  rows={4}
                  required
                  value={supportForm.message}
                  onChange={(e) => setSupportForm({...supportForm, message: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your issue in detail..."
                />
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                Submit Support Request
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">📞 Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600">📧</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Email Support</p>
                    <p className="text-sm text-gray-600">support@smartroomassigner.com</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600">📞</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Phone Support</p>
                    <p className="text-sm text-gray-600">1-800-ROOM-ASSIGN</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600">💬</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Live Chat</p>
                    <p className="text-sm text-gray-600">Available 9 AM - 6 PM EST</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">⏰ Response Times</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• <strong>Urgent:</strong> Within 2 hours</p>
                <p>• <strong>High:</strong> Within 4 hours</p>
                <p>• <strong>Medium:</strong> Within 24 hours</p>
                <p>• <strong>Low:</strong> Within 48 hours</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guides Tab */}
      {activeTab === 'guides' && (
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors duration-200 text-left"
              >
                <div className="text-2xl mb-2">{action.title.split(' ')[0]}</div>
                <h3 className="font-medium text-gray-900 mb-1">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </button>
            ))}
          </div>

          {/* Getting Started Guide */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">🚀 Getting Started Guide</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <h4 className="font-medium text-gray-900">Import Your Data</h4>
                  <p className="text-sm text-gray-600">Start by importing buildings, rooms, and student data using CSV files.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <h4 className="font-medium text-gray-900">Schedule Exams</h4>
                  <p className="text-sm text-gray-600">Create exam schedules in the Course Management section.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <h4 className="font-medium text-gray-900">Assign Rooms</h4>
                  <p className="text-sm text-gray-600">Use Smart Assign for automatic assignment or Manual Assign for custom control.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                <div>
                  <h4 className="font-medium text-gray-900">Generate Reports</h4>
                  <p className="text-sm text-gray-600">Export assignments and generate utilization reports.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Video Tutorials */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">🎥 Video Tutorials</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer" onClick={() => infoToast('Video tutorial would play here')}>
                <div className="aspect-video bg-gray-200 rounded mb-3 flex items-center justify-center">
                  <span className="text-4xl">▶️</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Complete System Overview</h4>
                <p className="text-sm text-gray-600">15 minutes • Learn all features</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer" onClick={() => infoToast('Video tutorial would play here')}>
                <div className="aspect-video bg-gray-200 rounded mb-3 flex items-center justify-center">
                  <span className="text-4xl">▶️</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Room Assignment Best Practices</h4>
                <p className="text-sm text-gray-600">8 minutes • Tips and tricks</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default HelpSupport;
