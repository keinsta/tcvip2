import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, MessageCircle, ArrowLeft } from "lucide-react";
import useNotificationStore from "../store/useNotificationStore";

const categories = [
  {
    id: 1,
    name: "notification",
    label: "Notifications",
    icon: <MessageCircle size={20} />,
  },
  { id: 2, name: "activity", label: "Activity", icon: <Bell size={20} /> },
];

const Notifications = () => {
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("notifications");

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCounts = categories.reduce((acc, category) => {
    acc[category.name] = notifications.filter(
      (n) => n.category === category.name && !n.isRead
    ).length;
    return acc;
  }, {});

  const filteredNotifications = notifications.filter(
    (n) => n.category === selectedCategory
  );

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  return (
    <div className="min-h-screen mb-24 flex flex-col items-center">
      {/* Header */}
      <div className="w-full h-[54px] bg-gradient-to-r from-yellow-600 to-yellow-400 flex items-center px-4 shadow-md">
        <ArrowLeft
          size={24}
          className="text-white mr-2 cursor-pointer"
          onClick={() => navigate(-1)}
        />
        <p className="text-lg text-white font-semibold">Notifications</p>
      </div>

      {/* Category Selection */}
      <div className="w-full p-4">
        <div className="space-y-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className={`p-3 border cursor-pointer rounded-lg flex items-start space-x-3 shadow-sm transition ${
                selectedCategory === category.name ? "bg-white" : "bg-gray-300"
              }`}
              onClick={() => handleCategoryClick(category.name)}
            >
              <div className="relative p-2 bg-gray-100 rounded-full">
                {category.icon}
                {unreadCounts[category.name] > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                )}
              </div>
              <div className="w-full flex justify-between">
                <div className="flex flex-col">
                  <h3 className="text-xs lg:text-sm font-semibold">
                    {category.label}
                  </h3>

                  {notifications
                    .filter((n) => n.category === category.name && !n.isRead)
                    .sort(
                      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                    ) // Sort by date (latest first)
                    .slice(0, 1) // Get only the latest notification
                    .map((n) => (
                      <p key={n._id} className="text-xs text-red-600 mt-1">
                        {n.title}
                      </p>
                    ))}
                </div>
                {unreadCounts[category.name] > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="p-1 px-2 text-xs text-white bg-yellow-500"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <hr className="border-2 w-[80%] rounded-lg border-yellow-500 my-2" />

      {/* Messages Display */}
      <div className="w-full p-4">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <div
              key={notification._id}
              className="my-2 p-4 bg-white shadow-md rounded-lg"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-sm lg:text-base font-semibold">
                  {notification.title}
                </h3>
                {!notification.isRead && (
                  <button
                    onClick={() => markAsRead(notification._id)}
                    className="text-xs text-yellow-600 font-semibold"
                  >
                    Mark as read
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {new Date(notification.createdAt).toLocaleDateString()} •{" "}
                {new Date(notification.createdAt).toLocaleTimeString()}
              </p>
              <p className="text-sm text-gray-700 mt-2">
                {notification.message}
              </p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-600">No messages available.</p>
        )}
      </div>
    </div>
  );
};

export default Notifications;
