import React, { useState } from "react";
import { useToast } from "../../hooks/useToast";
import AdminLayout from "./AdminLayout";

function Notifications() {
  const { successToast, infoToast } = useToast();
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "warning",
      title: "Room Assignment Required",
      message:
        "3 exams are pending room assignment. Please review and assign rooms.",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      read: false,
      priority: "high",
    },
    {
      id: 2,
      type: "error",
      title: "Student Unassigned",
      message:
        "27 students are still unassigned for tomorrow's CS 301 Final Exam.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: false,
      priority: "critical",
    },
    {
      id: 3,
      type: "info",
      title: "Room Conflict Detected",
      message: "MB-101 is double-booked for 2pm-4pm on December 10th.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
      read: true,
      priority: "medium",
    },
    {
      id: 4,
      type: "success",
      title: "Assignment Completed",
      message: "MATH 201 Midterm assignments have been successfully completed.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      read: true,
      priority: "low",
    },
  ]);

  const [filter, setFilter] = useState("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    successToast("All notifications marked as read");
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    infoToast("Notification deleted");
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (filter !== "all" && notif.type !== filter) return false;
    if (showUnreadOnly && notif.read) return false;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "medium":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "low":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeIcon = (type) => {
    return ""; // Remove emojis for clean design
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    return "Just now";
  };

  return (
    <AdminLayout title="Notifications">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Notification Center</h2>
          {unreadCount > 0 && (
            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
              {unreadCount} unread
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={markAllAsRead}
            className="px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            Mark All Read
          </button>
          <button
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            className={`px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${
              showUnreadOnly
                ? "bg-purple-500 text-white hover:bg-purple-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {showUnreadOnly ? "Show All" : "Unread Only"}
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["all", "info", "warning", "error", "success"].map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${
              filter === filterType
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {filterType === "all"
              ? "All"
              : filterType.charAt(0).toUpperCase() + filterType.slice(1)}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.891 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No notifications
            </h3>
            <p className="text-gray-600">
              {showUnreadOnly ? "All caught up!" : "You're all caught up!"}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 border rounded-lg transition-all duration-200 ${
                notification.read
                  ? "bg-white border-gray-200"
                  : "bg-blue-50 border-blue-200 shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <span className="text-xl">
                    {getTypeIcon(notification.type)}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3
                        className={`font-medium ${notification.read ? "text-gray-900" : "text-gray-900"}`}
                      >
                        {notification.title}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(notification.priority)}`}
                      >
                        {notification.priority}
                      </span>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                    <p
                      className={`text-sm mb-2 ${notification.read ? "text-gray-600" : "text-gray-700"}`}
                    >
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatTimestamp(notification.timestamp)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors duration-200"
                    >
                      Mark Read
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
                    title="Delete notification"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>


    </AdminLayout>
  );
}

export default Notifications;
