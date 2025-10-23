import React, { useState } from "react";
import { useToast } from "../../hooks/useToast";
import AdminLayout from "./AdminLayout";

function Settings() {
  const { successToast, infoToast } = useToast();

  // Change password modal state
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Settings state
  const [settings, setSettings] = useState({
    // General Settings
    siteName: "SmartRoomAssigner",
    adminEmail: "admin@university.edu",
    timezone: "America/New_York",
    language: "en",

    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    notificationFrequency: "immediate",

    // System Settings
    autoAssignment: true,
    conflictDetection: true,
    backupFrequency: "daily",
    sessionTimeout: "30",



    // Security Settings
    twoFactorAuth: false,
  });

  const handleSettingChange = (category, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
    successToast(`${key} updated successfully`);
  };

  const handleSaveSettings = () => {
    // In a real app, this would save to backend
    successToast("Settings saved successfully");
  };

  const handleResetSettings = () => {
    // Reset to defaults
    setSettings({
      siteName: "SmartRoomAssigner",
      adminEmail: "admin@university.edu",
      timezone: "America/New_York",
      language: "en",
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      notificationFrequency: "immediate",
      autoAssignment: true,
      conflictDetection: true,
      backupFrequency: "daily",
      sessionTimeout: "30",
      twoFactorAuth: false,
    });
    successToast("Settings reset to defaults");
  };

  const generalSettings = [
    {
      key: "siteName",
      label: "Site Name",
      type: "text",
      value: settings.siteName,
    },
    {
      key: "adminEmail",
      label: "Admin Email",
      type: "email",
      value: settings.adminEmail,
    },
    {
      key: "timezone",
      label: "Timezone",
      type: "select",
      value: settings.timezone,
      options: [
        { value: "America/New_York", label: "Eastern Time" },
        { value: "America/Chicago", label: "Central Time" },
        { value: "America/Denver", label: "Mountain Time" },
        { value: "America/Los_Angeles", label: "Pacific Time" },
      ],
    },
    {
      key: "language",
      label: "Language",
      type: "select",
      value: settings.language,
      options: [
        { value: "en", label: "English" },
        { value: "es", label: "Spanish" },
        { value: "fr", label: "French" },
      ],
    },
  ];

  const notificationSettings = [
    {
      key: "emailNotifications",
      label: "Email Notifications",
      type: "checkbox",
      value: settings.emailNotifications,
    },
    {
      key: "pushNotifications",
      label: "Push Notifications",
      type: "checkbox",
      value: settings.pushNotifications,
    },
    {
      key: "smsNotifications",
      label: "SMS Notifications",
      type: "checkbox",
      value: settings.smsNotifications,
    },
    {
      key: "notificationFrequency",
      label: "Notification Frequency",
      type: "select",
      value: settings.notificationFrequency,
      options: [
        { value: "immediate", label: "Immediate" },
        { value: "hourly", label: "Hourly Digest" },
        { value: "daily", label: "Daily Digest" },
      ],
    },
  ];

  const systemSettings = [
    {
      key: "autoAssignment",
      label: "Enable Auto Assignment",
      type: "checkbox",
      value: settings.autoAssignment,
    },
    {
      key: "conflictDetection",
      label: "Enable Conflict Detection",
      type: "checkbox",
      value: settings.conflictDetection,
    },
    {
      key: "backupFrequency",
      label: "Backup Frequency",
      type: "select",
      value: settings.backupFrequency,
      options: [
        { value: "hourly", label: "Hourly" },
        { value: "daily", label: "Daily" },
        { value: "weekly", label: "Weekly" },
      ],
    },
  ];


  const securitySettings = [
    {
      key: "changePassword",
      label: "Change Password",
      type: "button",
      value: "Change Password",
    },
    {
      key: "twoFactorAuth",
      label: "Enable Two-Factor Authentication",
      type: "checkbox",
      value: settings.twoFactorAuth,
    },
  ];

  const renderSettingInput = (setting) => {
    switch (setting.type) {
      case "text":
      case "email":
        return (
          <input
            type={setting.type}
            value={setting.value}
            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );
      case "select":
        return (
          <select
            value={setting.value}
            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {setting.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case "checkbox":
        return (
          <input
            id={`checkbox-${setting.key}`}
            type="checkbox"
            checked={setting.value}
            onChange={(e) => handleSettingChange(setting.key, e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        );
      case "textarea":
        return (
          <textarea
            value={setting.value}
            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
            placeholder={setting.placeholder}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );
      case "button":
        return (
          <button
            onClick={() => setShowChangePasswordModal(true)}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors duration-200"
          >
            {setting.value}
          </button>
        );
      default:
        return null;
    }
  };

  const tabs = [
    { id: "general", label: "⚙️ General", icon: "⚙️" },
    { id: "notifications", label: "🔔 Notifications", icon: "🔔" },
    { id: "system", label: "🔧 System", icon: "🔧" },
    { id: "security", label: "🔒 Security", icon: "🔒" },
  ];

  return (
    <AdminLayout title="Settings">
      {/* Header */}

      {/* Settings Content */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-8">
        {/* General Settings */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            ⚙️ General Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {generalSettings.map((setting) => (
              <div key={setting.key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {setting.label}
                </label>
                <div className="max-w-xs">
                  {renderSettingInput(setting)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notification Settings */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            🔔 Notification Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {notificationSettings.map((setting) => (
              <div key={setting.key}>
                {setting.type === "checkbox" ? (
                  <div className="flex items-center">
                    {renderSettingInput(setting)}
                    <label
                      htmlFor={`checkbox-${setting.key}`}
                      className="ml-2 text-sm font-medium text-gray-700 cursor-pointer"
                    >
                      {setting.label}
                    </label>
                  </div>
                ) : setting.type === "select" ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {setting.label}
                    </label>
                    <div className="max-w-xs">
                      {renderSettingInput(setting)}
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        {/* System Settings */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            🔧 System Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {systemSettings.map((setting) => (
              <div key={setting.key}>
                {setting.type === "select" ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {setting.label}
                    </label>
                    <div className="max-w-xs">
                      {renderSettingInput(setting)}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {setting.label}
                    </span>
                    {renderSettingInput(setting)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>



        {/* Security Settings */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            🔒 Security Settings
          </h3>
          <div className="grid grid-cols-1 gap-6">
            {securitySettings.map((setting) => (
              <div
                key={setting.key}
              >
                {setting.type === "checkbox" ? (
                  <div className="flex items-center">
                    {renderSettingInput(setting)}
                    <label
                      htmlFor={`checkbox-${setting.key}`}
                      className="ml-2 text-sm font-medium text-gray-700 cursor-pointer"
                    >
                      {setting.label}
                    </label>
                  </div>
                ) : setting.type === "button" ? (
                  <div>
                    {renderSettingInput(setting)}
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {setting.label}
                    </label>
                    {renderSettingInput(setting)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-lg font-bold mb-4 text-black">Change Password</h3>
            <p className="text-sm text-gray-700 mb-4">
              Enter your current password and choose a new password.
            </p>

            {/* Current Password */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => document.querySelector('input[placeholder="Enter current password"]').type = document.querySelector('input[placeholder="Enter current password"]').type === 'password' ? 'text' : 'password'}
                >
                  <svg className="h-5 w-5 text-gray-500 hover:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  placeholder="Enter new password (6+ characters)"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => document.querySelector('input[placeholder="Enter new password (6+ characters)"]').type = document.querySelector('input[placeholder="Enter new password (6+ characters)"]').type === 'password' ? 'text' : 'password'}
                >
                  <svg className="h-5 w-5 text-gray-500 hover:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => document.querySelector('input[placeholder="Confirm new password"]').type = document.querySelector('input[placeholder="Confirm new password"]').type === 'password' ? 'text' : 'password'}
                >
                  <svg className="h-5 w-5 text-gray-500 hover:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowChangePasswordModal(false);
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmNewPassword("");
                }}
                className="px-4 py-2 text-black hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  // Validation
                  if (!currentPassword || !newPassword || !confirmNewPassword) {
                    infoToast("Please fill in all fields");
                    return;
                  }

                  if (newPassword.length < 6) {
                    infoToast("New password must be at least 6 characters long");
                    return;
                  }

                  if (newPassword !== confirmNewPassword) {
                    infoToast("New passwords do not match");
                    return;
                  }

                  // Call the backend API to change password
                  try {
                    const response = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/change-password`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      credentials: 'include',
                      body: JSON.stringify({
                        current_password: currentPassword,
                        new_password: newPassword,
                      }),
                    });

                    const data = await response.json();

                    if (response.ok) {
                      successToast("Password changed successfully!");
                      setShowChangePasswordModal(false);
                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmNewPassword("");
                    } else {
                      infoToast(data.error || "Failed to change password");
                    }
                  } catch (error) {
                    infoToast("Network error. Please try again.");
                  }
                }}
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* System Information */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          📊 System Information
        </h3>
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
