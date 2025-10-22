import React, { useState } from 'react';
import { useToast } from '../../hooks/useToast';
import AdminLayout from './AdminLayout';

function Settings() {
  const { successToast, infoToast } = useToast();
  const [activeTab, setActiveTab] = useState('general');

  // Settings state
  const [settings, setSettings] = useState({
    // General Settings
    siteName: 'SmartRoomAssigner',
    adminEmail: 'admin@university.edu',
    timezone: 'America/New_York',
    language: 'en',

    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    notificationFrequency: 'immediate',

    // System Settings
    autoAssignment: true,
    conflictDetection: true,
    backupFrequency: 'daily',
    sessionTimeout: '30',

    // Appearance Settings
    theme: 'light',
    sidebarCollapsed: false,
    itemsPerPage: '10',
    dateFormat: 'MM/DD/YYYY',

    // Security Settings
    passwordExpiry: '90',
    twoFactorAuth: false,
    loginAttempts: '5',
    ipWhitelist: ''
  });

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    successToast(`${key} updated successfully`);
  };

  const handleSaveSettings = () => {
    // In a real app, this would save to backend
    successToast('Settings saved successfully');
  };

  const handleResetSettings = () => {
    // Reset to defaults
    setSettings({
      siteName: 'SmartRoomAssigner',
      adminEmail: 'admin@university.edu',
      timezone: 'America/New_York',
      language: 'en',
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      notificationFrequency: 'immediate',
      autoAssignment: true,
      conflictDetection: true,
      backupFrequency: 'daily',
      sessionTimeout: '30',
      theme: 'light',
      sidebarCollapsed: false,
      itemsPerPage: '10',
      dateFormat: 'MM/DD/YYYY',
      passwordExpiry: '90',
      twoFactorAuth: false,
      loginAttempts: '5',
      ipWhitelist: ''
    });
    successToast('Settings reset to defaults');
  };

  const generalSettings = [
    { key: 'siteName', label: 'Site Name', type: 'text', value: settings.siteName },
    { key: 'adminEmail', label: 'Admin Email', type: 'email', value: settings.adminEmail },
    { key: 'timezone', label: 'Timezone', type: 'select', value: settings.timezone, options: [
      { value: 'America/New_York', label: 'Eastern Time' },
      { value: 'America/Chicago', label: 'Central Time' },
      { value: 'America/Denver', label: 'Mountain Time' },
      { value: 'America/Los_Angeles', label: 'Pacific Time' }
    ]},
    { key: 'language', label: 'Language', type: 'select', value: settings.language, options: [
      { value: 'en', label: 'English' },
      { value: 'es', label: 'Spanish' },
      { value: 'fr', label: 'French' }
    ]}
  ];

  const notificationSettings = [
    { key: 'emailNotifications', label: 'Email Notifications', type: 'checkbox', value: settings.emailNotifications },
    { key: 'pushNotifications', label: 'Push Notifications', type: 'checkbox', value: settings.pushNotifications },
    { key: 'smsNotifications', label: 'SMS Notifications', type: 'checkbox', value: settings.smsNotifications },
    { key: 'notificationFrequency', label: 'Notification Frequency', type: 'select', value: settings.notificationFrequency, options: [
      { value: 'immediate', label: 'Immediate' },
      { value: 'hourly', label: 'Hourly Digest' },
      { value: 'daily', label: 'Daily Digest' }
    ]}
  ];

  const systemSettings = [
    { key: 'autoAssignment', label: 'Enable Auto Assignment', type: 'checkbox', value: settings.autoAssignment },
    { key: 'conflictDetection', label: 'Enable Conflict Detection', type: 'checkbox', value: settings.conflictDetection },
    { key: 'backupFrequency', label: 'Backup Frequency', type: 'select', value: settings.backupFrequency, options: [
      { value: 'hourly', label: 'Hourly' },
      { value: 'daily', label: 'Daily' },
      { value: 'weekly', label: 'Weekly' }
    ]},
    { key: 'sessionTimeout', label: 'Session Timeout (minutes)', type: 'select', value: settings.sessionTimeout, options: [
      { value: '15', label: '15 minutes' },
      { value: '30', label: '30 minutes' },
      { value: '60', label: '1 hour' },
      { value: '120', label: '2 hours' }
    ]}
  ];

  const appearanceSettings = [
    { key: 'theme', label: 'Theme', type: 'select', value: settings.theme, options: [
      { value: 'light', label: 'Light' },
      { value: 'dark', label: 'Dark' },
      { value: 'auto', label: 'Auto' }
    ]},
    { key: 'sidebarCollapsed', label: 'Collapse Sidebar by Default', type: 'checkbox', value: settings.sidebarCollapsed },
    { key: 'itemsPerPage', label: 'Items per Page', type: 'select', value: settings.itemsPerPage, options: [
      { value: '10', label: '10' },
      { value: '25', label: '25' },
      { value: '50', label: '50' },
      { value: '100', label: '100' }
    ]},
    { key: 'dateFormat', label: 'Date Format', type: 'select', value: settings.dateFormat, options: [
      { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
      { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
      { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }
    ]}
  ];

  const securitySettings = [
    { key: 'passwordExpiry', label: 'Password Expiry (days)', type: 'select', value: settings.passwordExpiry, options: [
      { value: '30', label: '30 days' },
      { value: '60', label: '60 days' },
      { value: '90', label: '90 days' },
      { value: 'never', label: 'Never' }
    ]},
    { key: 'twoFactorAuth', label: 'Enable Two-Factor Authentication', type: 'checkbox', value: settings.twoFactorAuth },
    { key: 'loginAttempts', label: 'Max Login Attempts', type: 'select', value: settings.loginAttempts, options: [
      { value: '3', label: '3 attempts' },
      { value: '5', label: '5 attempts' },
      { value: '10', label: '10 attempts' }
    ]},
    { key: 'ipWhitelist', label: 'IP Whitelist (comma-separated)', type: 'textarea', value: settings.ipWhitelist, placeholder: '192.168.1.1, 10.0.0.1' }
  ];

  const renderSettingInput = (setting) => {
    switch (setting.type) {
      case 'text':
      case 'email':
        return (
          <input
            type={setting.type}
            value={setting.value}
            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );
      case 'select':
        return (
          <select
            value={setting.value}
            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {setting.options.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        );
      case 'checkbox':
        return (
          <input
            type="checkbox"
            checked={setting.value}
            onChange={(e) => handleSettingChange(setting.key, e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        );
      case 'textarea':
        return (
          <textarea
            value={setting.value}
            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
            placeholder={setting.placeholder}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );
      default:
        return null;
    }
  };

  const tabs = [
    { id: 'general', label: '⚙️ General', icon: '⚙️' },
    { id: 'notifications', label: '🔔 Notifications', icon: '🔔' },
    { id: 'system', label: '🔧 System', icon: '🔧' },
    { id: 'appearance', label: '🎨 Appearance', icon: '🎨' },
    { id: 'security', label: '🔒 Security', icon: '🔒' }
  ];

  return (
    <AdminLayout title="⚙️ Settings">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">System Settings</h2>
        <p className="text-gray-600">Configure application preferences and system behavior</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-lg mb-6">
        {tabs.map((tab) => (
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

      {/* Settings Content */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">General Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {generalSettings.map((setting) => (
                <div key={setting.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {setting.label}
                  </label>
                  {renderSettingInput(setting)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notification Settings */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {notificationSettings.map((setting) => (
                <div key={setting.key} className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      {setting.label}
                    </label>
                  </div>
                  {renderSettingInput(setting)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* System Settings */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">System Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {systemSettings.map((setting) => (
                <div key={setting.key} className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      {setting.label}
                    </label>
                  </div>
                  {renderSettingInput(setting)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Appearance Settings */}
        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Appearance Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {appearanceSettings.map((setting) => (
                <div key={setting.key} className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      {setting.label}
                    </label>
                  </div>
                  {renderSettingInput(setting)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {securitySettings.map((setting) => (
                <div key={setting.key} className={setting.type === 'textarea' ? '' : 'flex items-center justify-between'}>
                  <div className={setting.type === 'textarea' ? 'md:col-span-2' : ''}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {setting.label}
                    </label>
                    {renderSettingInput(setting)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between">
          <button
            onClick={handleResetSettings}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            Reset to Defaults
          </button>
          <div className="space-x-3">
            <button
              onClick={() => infoToast('Settings preview would show here')}
              className="px-4 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200"
            >
              Preview Changes
            </button>
            <button
              onClick={handleSaveSettings}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">📊 System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-medium text-gray-700">Version</p>
            <p className="text-gray-600">v2.1.0</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Last Backup</p>
            <p className="text-gray-600">2 hours ago</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Database Status</p>
            <p className="text-green-600">Healthy</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default Settings;
