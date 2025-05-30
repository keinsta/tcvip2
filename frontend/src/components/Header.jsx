import React from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import HeaderLogo from "../assets/images/HeaderLogo.png";
import useNotificationStore from "../store/useNotificationStore";

const Header = () => {
  const navigate = useNavigate();
  const { unreadCount } = useNotificationStore(); // Get unread notifications count

  return (
    <>
      <style>
        {`
  @keyframes headerGradientMove {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  .header-3d {
    background: linear-gradient(135deg, #fcd34d, #fbbf24, #f59e0b, #d97706);
    background-size: 300% 300%;
    animation: headerGradientMove 16s ease-in-out infinite;
    box-shadow: 0 4px 12px rgba(0,0,0,0.25);
    backdrop-filter: blur(10px);
    position: relative;
    z-index: 10;
  }

  .logo-3d {
    transform: perspective(600px) rotateX(4deg);
    filter: drop-shadow(0 2px 5px rgba(255, 215, 0, 0.4));
    transition: transform 0.3s ease;
  }

  .logo-3d:hover {
    transform: perspective(600px) rotateX(0deg) scale(1.05);
  }

  .version-glow {
    color: #fff8dc;
    text-shadow: 0 1px 3px #f59e0b, 0 0 6px #fcd34d;
  }

  .glass-button {
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(6px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 6px 12px rgba(253, 224, 71, 0.2);
    transition: all 0.25s ease;
  }

  .glass-button:hover {
    transform: scale(1.08);
    box-shadow: 0 0 12px rgba(251, 191, 36, 0.5), 0 0 6px rgba(255, 255, 255, 0.2);
  }

  .notification-dot {
    animation: pulse 1.3s ease-in-out infinite;
  }

  @keyframes pulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.2); opacity: 0.5; }
    100% { transform: scale(1); opacity: 1; }
  }
`}
      </style>

      <header className="header-3d w-full h-[54px] flex items-center justify-between px-4">
        {/* Logo and Version */}
        <div className="w-28 h-10 flex items-end logo-3d">
          <img
            src={HeaderLogo}
            alt="MyApp Logo"
            className="w-full h-full object-contain mr-1"
          />
          <span className="text-2xl font-semibold version-glow">2.0</span>
        </div>

        {/* Notification Bell */}
        <button
          onClick={() => navigate("/user-message")}
          className="relative p-2 rounded-full glass-button"
        >
          <Bell className="w-5 h-5 text-white" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full notification-dot"></span>
          )}
        </button>
      </header>
    </>
  );
};

export default Header;
