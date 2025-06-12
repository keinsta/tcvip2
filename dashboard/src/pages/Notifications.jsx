import React from "react";

const dummyData = [
  {
    _id: "1",
    category: "activity",
    type: "login",
    message: "You logged in successfully.",
    isRead: true,
    createdAt: "2025-04-27T12:00:00Z",
  },
  {
    _id: "2",
    category: "activity",
    type: "game",
    message: "You played the 5D lottery game.",
    isRead: true,
    createdAt: "2025-04-27T13:00:00Z",
  },
  {
    _id: "3",
    category: "notification",
    type: "promotion",
    title: "Special Offer!",
    message: "Get 10% bonus on your next deposit.",
    isRead: false,
    createdAt: "2025-04-27T14:00:00Z",
  },
  {
    _id: "4",
    category: "notification",
    type: "reward",
    title: "Congratulations!",
    message: "You won ₹500 cashback!",
    isRead: true,
    createdAt: "2025-04-27T15:00:00Z",
  },
];

const formatDate = (dateString) => {
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export default function NotificationsActivities() {
  const activities = dummyData.filter((item) => item.category === "activity");
  const notifications = dummyData.filter(
    (item) => item.category === "notification"
  );

  return (
    <div className="p-6 space-y-8">
      {/* Activities */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Activities</h2>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity._id}
              className="bg-gray-100 p-4 rounded-lg shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="text-gray-700">{activity.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDate(activity.createdAt)}
                </p>
              </div>
              <div className="text-sm text-gray-500 capitalize">
                {activity.type}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Notifications */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Notifications</h2>
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className="bg-white p-4 rounded-lg shadow-md flex items-start justify-between"
            >
              <div>
                <h3 className="font-semibold text-lg">
                  {notification.title}
                  {!notification.isRead && (
                    <span className="ml-2 inline-block px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                      New
                    </span>
                  )}
                </h3>
                <p className="text-gray-700 mt-1">{notification.message}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {formatDate(notification.createdAt)}
                </p>
              </div>
              <div className="text-sm text-gray-500 capitalize">
                {notification.type}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
