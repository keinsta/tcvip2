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
  FaTimes,
} from "react-icons/fa";

const ProfileModal = ({ isOpen, onClose }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

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
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end items-start ">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Panel */}
      <div className="relative w-full sm:max-w-md bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-xl rounded-lg m-4 overflow-y-auto max-h-[90vh] animate-slideInRight">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-600">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Profile Info
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 text-xl"
          >
            <FaTimes />
          </button>
        </div>

        {loading ? (
          <div className="p-6 animate-pulse space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-gray-300"></div>
            <div className="h-4 w-32 mx-auto bg-gray-300 rounded"></div>
            <div className="grid grid-cols-1 gap-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
          </div>
        ) : !user ? (
          <div className="text-center py-10 text-red-500">
            User data not available.
          </div>
        ) : (
          <div className="p-4">
            {/* Header */}
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {user.name}
              </h2>
              <p className="text-gray-500 dark:text-gray-300">{user.email}</p>
            </div>

            {/* Basic Info */}
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
                Basic Info
              </h3>
              <InfoItem
                icon={<FaUser />}
                label="Nickname"
                value={user.nickName}
              />
              <InfoItem icon={<FaIdBadge />} label="UID" value={user.uid} />
              <InfoItem
                icon={<FaEnvelope />}
                label="Email"
                value={user.email}
              />
              <InfoItem icon={<FaPhone />} label="Phone" value={user.phone} />
            </div>

            {/* Account Info */}
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
                Account Details
              </h3>
              <InfoItem icon={<FaKey />} label="Admin ID" value={user._id} />
              <InfoItem
                icon={<FaShieldAlt />}
                label="Auth Method"
                value={user.authBy}
              />
              <InfoItem
                icon={<FaCheckCircle />}
                label="Account Status"
                value={user.status}
              />
              <InfoItem
                icon={
                  user.isVerified ? (
                    <FaCheckCircle className="text-green-500" />
                  ) : (
                    <FaTimesCircle className="text-red-500" />
                  )
                }
                label="Verification"
                value={user.isVerified ? "Verified" : "Unverified"}
              />
              <InfoItem icon={<FaShieldAlt />} label="Role" value={user.role} />
              <InfoItem
                icon={<FaCalendarAlt />}
                label="Joined"
                value={new Date(user.createdAt).toLocaleDateString()}
              />
            </div>

            {/* Bio */}
            {user.bio && (
              <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
                  About Me
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {user.bio}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Slide-in animation */}
      <style jsx>{`
        @keyframes slideInRight {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(0%);
          }
        }

        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

const InfoItem = ({ icon, label, value }) => (
  <p className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-1">
    <span className="mr-2 text-blue-500">{icon}</span>
    <strong className="mr-1">{label}:</strong> {value || "N/A"}
  </p>
);

export default ProfileModal;
