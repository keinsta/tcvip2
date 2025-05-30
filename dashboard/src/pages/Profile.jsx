import React, { useEffect, useState } from "react";
import axiosInstance from "../config/axiosInstance";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCheckCircle,
  FaTimesCircle,
  FaShieldAlt,
  FaCalendarAlt,
  FaIdBadge,
  FaKey,
} from "react-icons/fa";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get("/auth/profile")
      .then((response) => {
        setUser(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="w-24 h-24 mx-auto rounded-full bg-gray-300"></div>
          <div className="h-4 w-32 mx-auto bg-gray-300 rounded"></div>
          <div className="h-3 w-40 mx-auto bg-gray-300 rounded"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-300 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-10 text-red-500">
        User data not available.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-xl rounded-lg dark:bg-gray-800 border dark:border-gray-700">
      {/* Profile Header */}
      <div className="flex flex-col items-center text-center">
        <h2 className="mt-4 text-2xl font-semibold text-gray-900 dark:text-white">
          {user.name}
        </h2>
        <p className="text-gray-500 dark:text-gray-300">{user.email}</p>
      </div>

      {/* User Details */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="p-5 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
            Basic Info
          </h3>
          <p className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <FaUser className="mr-2 text-blue-500" /> Nickname:{" "}
            {user.nickName || "N/A"}
          </p>
          <p className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <FaIdBadge className="mr-2 text-green-500" /> UID:{" "}
            {user.uid || "Not provided"}
          </p>
          <p className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <FaEnvelope className="mr-2 text-purple-500" /> Email:{" "}
            {user.email || "Not provided"}
          </p>
          <p className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <FaPhone className="mr-2 text-yellow-500" /> Phone:{" "}
            {user.phone || "Not provided"}
          </p>
        </div>

        {/* Account Details */}
        <div className="p-5 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
            Account Details
          </h3>
          <p className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <FaKey className="mr-2 text-red-500" /> Admin ID:{" "}
            {user._id || "Not provided"}
          </p>
          <p className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <FaShieldAlt className="mr-2 text-indigo-500" /> Auth Method:{" "}
            {user.authBy || "N/A"}
          </p>
          <p className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <FaCheckCircle className="mr-2 text-green-500" /> Account Status:{" "}
            {user.status || "N/A"}
          </p>
          <p className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            {user.isVerified ? (
              <FaCheckCircle className="mr-2 text-green-500" />
            ) : (
              <FaTimesCircle className="mr-2 text-red-500" />
            )}
            Verification: {user.isVerified ? "Verified" : "Unverified"}
          </p>
          <p className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <FaShieldAlt className="mr-2 text-yellow-500" /> Role:{" "}
            {user.role || "User"}
          </p>
          <p className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <FaCalendarAlt className="mr-2 text-blue-500" /> Joined:{" "}
            {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* User Bio */}
      {user.bio && (
        <div className="mt-6 p-5 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            About Me
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
            {user.bio}
          </p>
        </div>
      )}
    </div>
  );
};

export default Profile;
