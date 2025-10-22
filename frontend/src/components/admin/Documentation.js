import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { useToast } from '../../hooks/useToast';

function Documentation() {
  const { infoToast } = useToast();
  const [activeView, setActiveView] = useState('hub'); // 'hub' or 'viewer'
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const documentationStructure = [
    {
      category: '📖 Documentation Hub',
      icon: '📚',
      color: 'blue',
      documents: [
        {
          id: 'documentation-analysis',
          title: 'Documentation Analysis & Plan',
          description: 'Current documentation status and improvement roadmap',
          file: 'documentation-analysis.md',
          tags: ['analysis', 'planning', 'improvement', 'strategy'],
          available: true
        },
        {
          id: 'product-overview',
          title: 'Product Overview',
          description: 'Complete product strategy and market positioning',
          file: 'product-overview.md',
          tags: ['product', 'strategy', 'market', 'business'],
          available: true
        }
      ]
    },
    {
      category: '🚀 Getting Started',
      icon: '🚀',
      color: 'green',
      documents: [
        {
          id: 'getting-started',
          title: 'Quick Start Guide',
          description: 'Get up and running in 5 minutes',
          file: 'getting-started.md',
          tags: ['beginner', 'setup', 'installation', 'quick-start'],
          available: true
        }
      ]
    },
    {
      category: '👥 User Guides',
      icon: '👥',
      color: 'purple',
      documents: [
        {
          id: 'admin-guide',
          title: 'Administrator Guide',
          description: 'Complete guide for system administrators',
          file: 'user-guides/admin-guide.md',
          tags: ['admin', 'management', 'comprehensive', 'operations'],
          available: true
        },
        {
          id: 'student-guide',
          title: 'Student Portal Guide',
          description: 'How to use the student interface',
          file: 'user-guides/student-guide.md',
          tags: ['student', 'portal', 'usage', 'interface'],
          available: true
        }
      ]
    },
    {
      category: '🔧 Technical Documentation',
      icon: '🔧',
      color: 'orange',
      documents: [
        {
          id: 'ux-flow-diagrams',
          title: 'UX Flow Diagrams',
          description: 'User experience flow diagrams and workflow optimization',
          file: 'technical-docs/ux-flow-diagrams.md',
          tags: ['ux', 'flows', 'diagrams', 'workflows', 'optimization'],
          available: true
        },
        {
          id: 'api-reference',
          title: 'API Reference',
          description: 'Complete REST API documentation',
          file: 'technical-docs/api-reference.md',
          tags: ['api', 'rest', 'endpoints', 'integration', 'development'],
          available: true
        },
        {
          id: 'ai-enhancement-plan',
          title: 'AI Enhancement Plan',
          description: 'Future AI and machine learning enhancements',
          file: 'technical-docs/ai-enhancement-plan.md',
          tags: ['ai', 'ml', 'future', 'enhancements', 'roadmap'],
          available: true
        }
      ]
    },
    {
      category: '📊 System Administration',
      icon: '📊',
      color: 'red',
      documents: [
        {
          id: 'troubleshooting',
          title: 'Troubleshooting Guide',
          description: 'Common issues and solutions',
          file: 'admin-docs/troubleshooting.md',
          tags: ['troubleshooting', 'issues', 'solutions', 'debugging', 'support'],
          available: true
        }
      ]
    },
    {
      category: '🚢 Deployment',
      icon: '🚢',
      color: 'teal',
      documents: [
        {
          id: 'enterprise-setup',
          title: 'Enterprise Setup Guide',
          description: 'Complete enterprise deployment and configuration',
          file: 'deployment/enterprise-setup.md',
          tags: ['enterprise', 'deployment', 'production', 'scaling', 'infrastructure'],
          available: true
        }
      ]
    }
  ];

  const loadDocument = async (doc) => {
    setLoading(true);
    setSelectedDoc(doc);

    try {
      // In a real app, this would fetch from the backend
      // For demo, we'll simulate loading content
      const mockContent = await fetchMockDocument(doc.file);
      setContent(mockContent);
      setActiveView('viewer');
    } catch (error) {
      infoToast('Document not found or still being created');
    } finally {
      setLoading(false);
    }
  };

  const fetchMockDocument = async (file) => {
    // Mock document content based on file path
    const mockContent = {
      'getting-started.md': `# 🚀 Getting Started with SmartRoomAssigner

## Welcome!

This guide will help you get started with the SmartRoomAssigner system in just 5 minutes.

## Prerequisites

- Windows 10/11, macOS, or Linux
- Node.js 16+ and npm
- Python 3.8+ and pip
- Git

## Quick Installation

1. Clone the repository
2. Install backend dependencies
3. Install frontend dependencies
4. Configure the database
5. Start the application

## Next Steps

- [Read the Admin Guide](../user-guides/admin-guide.md) for detailed administration
- [Check the API Reference](../technical-docs/api-reference.md) for integration
- [View the Troubleshooting Guide](../admin-docs/troubleshooting.md) for common issues

Happy assigning! 🎯`,

      'user-guides/admin-guide.md': `# 👥 Administrator Guide

## Overview

This comprehensive guide covers all aspects of administering the SmartRoomAssigner system.

## Core Features

### Room Management
- Add, edit, and delete rooms
- Set capacity limits
- Configure room types and features

### Student Management
- Import student data via CSV
- Manage student profiles
- Handle special accommodations

### Assignment Engine
- Smart automatic assignment
- Manual override capabilities
- Conflict detection and resolution

## Best Practices

1. **Regular Backups**: Schedule daily backups of the database
2. **Data Validation**: Always validate imported data
3. **Conflict Resolution**: Address conflicts before exam day
4. **Communication**: Keep all stakeholders informed

## Troubleshooting

Common issues and their solutions are covered in the [Troubleshooting Guide](../admin-docs/troubleshooting.md).`,

      'technical-docs/api-reference.md': `# 🔧 API Reference

## Overview

Complete REST API documentation for SmartRoomAssigner.

## Authentication

All API endpoints require authentication via JWT tokens or session cookies.

## Endpoints

### Students
- \`GET /api/students\` - List all students
- \`POST /api/students\` - Create new student
- \`PUT /api/students/{id}\` - Update student
- \`DELETE /api/students/{id}\` - Delete student

### Rooms
- \`GET /api/rooms\` - List all rooms
- \`POST /api/rooms\` - Create new room
- \`PUT /api/rooms/{id}\` - Update room
- \`DELETE /api/rooms/{id}\` - Delete room

### Assignments
- \`POST /api/assign-students\` - Run smart assignment algorithm
- \`GET /api/assignments\` - Get current assignments
- \`POST /api/assignments/manual\` - Create manual assignment

## Error Codes

- \`200\`: Success
- \`400\`: Bad Request
- \`401\`: Unauthorized
- \`403\`: Forbidden
- \`404\`: Not Found
- \`500\`: Internal Server Error`
    };

    return mockContent[file] || `# 📄 Document Not Found

The requested document is currently being created or doesn't exist yet.

## Available Documents

Please check the documentation hub for available documents, or contact your system administrator.`;
  };

  const filteredStructure = documentationStructure.map(category => ({
    ...category,
    documents: category.documents.filter(doc =>
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  })).filter(category => category.documents.length > 0);

  if (activeView === 'viewer' && selectedDoc) {
    return (
      <AdminLayout title="📚 Documentation">
        {/* Viewer Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveView('hub')}
              className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Hub</span>
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Reading:</span>
              <span className="font-medium">{selectedDoc.title}</span>
            </div>
          </div>
        </div>

        {/* Document Content */}
        <div className="bg-white border border-gray-200 rounded-lg">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading document...</p>
              </div>
            </div>
          ) : (
            <div className="p-8">
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
                  {content}
                </pre>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="📚 Documentation Hub">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Documentation Center</h2>
        <p className="text-gray-600">Comprehensive guides, tutorials, and reference materials</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="max-w-md">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Documentation Categories */}
      <div className="space-y-8">
        {filteredStructure.map((category) => (
          <div key={category.category} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {/* Category Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{category.icon}</span>
                <h3 className="text-lg font-semibold text-gray-900">{category.category}</h3>
                <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
                  {category.documents.length} docs
                </span>
              </div>
            </div>

            {/* Documents Grid */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.documents.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => loadDocument(doc)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md cursor-pointer transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 text-lg">📄</span>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                        Available
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">{doc.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">{doc.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {doc.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {documentationStructure.reduce((sum, cat) => sum + cat.documents.length, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Documents</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {documentationStructure.length}
          </div>
          <div className="text-sm text-gray-600">Categories</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">v2.1.0</div>
          <div className="text-sm text-gray-600">Latest Version</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">24/7</div>
          <div className="text-sm text-gray-600">Support Available</div>
        </div>
      </div>

      {/* Coming Soon Notice */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">🚧</span>
          <div>
            <h4 className="font-medium text-blue-900">Documentation in Progress</h4>
            <p className="text-sm text-blue-800">
              Some documents are still being created. Check back soon for complete coverage of all features!
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default Documentation;
