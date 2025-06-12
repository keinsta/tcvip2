import React, { useContext, useState } from "react";
import { FaMoon, FaSun } from "react-icons/fa";
import { LogOut, Settings, Bell, Moon, Sun, User } from "lucide-react";
import { ThemeCotext } from "../context/ThemeContextProvider";
import useAuthStore from "../store/useAuthStore";
import useChatSupportStore from "../store/useChatSupportStore";
import axiosInstance from "../config/axiosInstance";
import toast from "react-hot-toast";
import ProfileModal from "./ProfileModal";

const Navbar = () => {
  const { theme, toggleTheme } = useContext(ThemeCotext);
  const unreadCount = useChatSupportStore((s) => s.unreadCount);
  const [notifications, setNotifications] = useState([]);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      const response = await axiosInstance.get("/auth/logout");
      toast.success(response.data.message);
      logout();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  return (
    <div className="bg-gray-100 text-gray-900 border-b border-gray-300 p-4 flex justify-between items-center dark:border-gray-600 dark:bg-gray-900 dark:text-white">
      <h1>TCVIP 2.0</h1>

      <div className="flex items-center gap-1">
        {/* Theme Toggle */}
        {/* <button
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          onClick={toggleTheme}
        >
          {theme === "light" ? (
            <Moon className="w-4 h-4 sm:w-6 sm:h-6" />
          ) : (
            <Sun className="w-4 h-4 sm:w-6 sm:h-6" />
          )}
        </button> */}

        {/* Notifications */}
        <button
          onClick={() => setIsProfileOpen(true)}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <User className="w-4 h-4 sm:w-6 sm:h-6" />
        </button>

        {/* Notification */}

        <button className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
          <Bell className="w-4 h-4 sm:w-6 sm:h-6" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          )}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="p-2 rounded-full hover:bg-red-500 hover:text-white dark:hover:bg-red-600"
        >
          <LogOut className="w-4 h-4 sm:w-6 sm:h-6" />
        </button>
      </div>
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  );
};

export default Navbar;
