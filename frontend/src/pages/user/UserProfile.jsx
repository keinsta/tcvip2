import React, { useState, useEffect, use } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Clipboard,
  RefreshCcw,
  Wallet,
  Download,
  Upload,
  Star,
  Bell,
  Gift,
  BarChart3,
  Languages,
  ChevronRight,
  Settings,
  MessageSquare,
  Megaphone,
  Headphones,
  BookOpen,
  Info,
  LogOut,
  Repeat,
} from "lucide-react";
import useAuthStore from "../../store/authStore";
import safe_banner from "../../assets/images/banners/safe_banner.png";
import { history_icons } from "../../assets/icons/wallet-icons";
import axiosInstance from "../../config/axiosInstance";
import { avatars } from "../../assets/images/avatar/avatar";
import toast from "react-hot-toast";
import usdtImageIcon from "../../assets/images/payment-methods/pay_icon_usdt_red.svg";
import useUSDTPriceStore from "../../store/useUSDTPriceStore";

const settings = [
  {
    icon: <Bell className="w-7 h-7 text-yellow-500" />,
    title: "Notifications",
    subtitle: "My Betting History",
    link_to: "/user-message",
  },
  {
    icon: <Gift className="w-7 h-7 text-yellow-500" />,
    title: "Gifts",
    subtitle: "My Transaction History",
    link_to: "/user-redeem-gift",
  },
  {
    icon: <BarChart3 className="w-7 h-7 text-yellow-500" />,
    title: "Game Statistics",
    subtitle: "My Deposit History",
    link_to: "/game-statistics",
  },
  // {
  //   icon: <Languages className="w-7 h-7 text-yellow-500" />,
  //   title: "Languages",
  //   subtitle: "My Withdraw History",
  //   link_to: "/user-message",
  // },
];
const services = [
  {
    icon: <Settings className="w-7 h-7 text-yellow-500" />,
    title: "Settings",
    to_link: "/user-me/settings",
  },
  {
    icon: <MessageSquare className="w-7 h-7 text-yellow-500" />,
    title: "Feedback",
    to_link: "/user-feedback",
  },
  {
    icon: <Megaphone className="w-7 h-7 text-yellow-500" />,
    title: "Announcement",
    to_link: "/user-announcements",
  },
  {
    icon: <Headphones className="w-7 h-7 text-yellow-500" />,
    title: "Customer Service",
    to_link: "/customer-service",
  },
  {
    icon: <BookOpen className="w-7 h-7 text-yellow-500" />,
    title: "Beginner's Guide",
  },
  {
    icon: <Info className="w-7 h-7 text-yellow-500" />,
    title: "About Us",
    to_link: "/about-us",
  },
];

const UserProfile = () => {
  const { user, fetchUser } = useAuthStore();
  const userBalance = user?.totalBalance;
  const usdtPriceInINR = useUSDTPriceStore((state) => state.usdtPriceInINR);
  const memberId = user?.uid?.replace("MEMBER-", "") || "";
  const memberAvatar = user?.avatar;
  const withdrawalPasswordStatus = user?.withdrawalPasswordStatus;
  const navigate = useNavigate();
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [lastLogin, setLastLogin] = useState([]);
  const [copied, setCopied] = useState(false);

  const handleLogout = async () => {
    await axiosInstance
      .get("/auth/logout")
      .then((response) => {
        toast.success(response.data.message);
        useAuthStore.getState().logout();
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(memberId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNavigation = (e) => {
    if (!withdrawalPasswordStatus) {
      e.preventDefault(); // Prevent default link navigation
      toast.error("You need to set up your withdrawal password first!");
      navigate("/user-me/settings");
    }
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);

    // Convert to YYYY-MM-DD HH:mm:ss format
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Ensure two digits
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Finding the avatar whenever memberAvatar changes
  useEffect(() => {
    const foundAvatar = avatars.find((avatar) => avatar.name === memberAvatar);
    setSelectedAvatar(foundAvatar);
  }, [memberAvatar]);

  return (
    <div className="min-h-screen mb-24 flex flex-col items-center">
      <div className="w-full bg-gradient-yellow-headers p-4 pb-16 rounded-b-3xl">
        {/* Profile Header */}
        <div className="flex items-center gap-4 p-4 rounded-lg shadow-md">
          {/* Avatar */}
          <div className="w-16 h-16" onClick={() => navigate("/change-avatar")}>
            <img
              src={selectedAvatar?.avatar}
              alt="Avatar"
              className="w-full h-full rounded-full cursor-pointer border-4 border-yellow-400"
            />
          </div>

          {/* Member Info */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-yellow-800">
              <span className="font-semibold">
                {user?.nickName ? user?.nickName : user?.uid}
              </span>
            </div>
            <div className="flex items-center text-xs text-yellow-800 gap-1">
              <span className="font-semibold">UID |</span>
              <span className="">{memberId}</span>
              <button onClick={copyToClipboard} className="text-yellow-800 ">
                <Clipboard size={14} />
              </button>
              {copied && (
                <span className="text-green-600 text-xs">Copied!</span>
              )}
            </div>
            <div className="text-yellow-800 text-xs">
              <span className="font-semibold">Last Login:</span>{" "}
              {user?.updatedAt ? formatDateTime(user.updatedAt) : "N/A"}
            </div>
          </div>
        </div>
      </div>
      <div className="w-full px-4 relative top-[-50px]">
        {/* Total Balance Component */}
        <div className=" bg-app-bg p-5 rounded-2xl shadow-md shadow-gray-800 space-y-4">
          {/* Total Balance */}
          <div className="flex justify-between items-center p-3 rounded-lg">
            <h3 className="text-lg font-bold text-white">
              Total Balance{" "}
              <div className="flex items-center gap-1 text-yellow-500">
                ₹{userBalance}
                <span className="flex items-center gap-1">
                  <Repeat />{" "}
                  <img
                    src={usdtImageIcon}
                    alt="usdt-icon"
                    className="w-8 h-8"
                  />{" "}
                  {(userBalance / usdtPriceInINR).toFixed(2)}
                </span>
              </div>
            </h3>
            <button
              onClick={fetchUser}
              className="p-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600"
            >
              <RefreshCcw className="w-5 h-5" />
            </button>
          </div>

          {/* Wallet, Deposit, Withdraw, SVIP Sections */}
          <div className="grid grid-cols-4 gap-5 text-center">
            <Link to={"/wallet"}>
              <div className="flex flex-col items-center cursor-pointer">
                <Wallet className="w-7 h-7 mb-1 text-yellow-500" />
                <p className="text-sm text-white">Wallet</p>
              </div>
            </Link>
            <Link to={"/deposit"}>
              <div className="flex flex-col items-center cursor-pointer">
                <Download className="w-7 h-7 mb-1 text-yellow-500" />
                <p className="text-sm text-white">Deposit</p>
              </div>
            </Link>
            <Link
              to={withdrawalPasswordStatus ? "/withdraw" : "/user-me/settings"}
              onClick={handleNavigation}
            >
              <div className="flex flex-col items-center cursor-pointer">
                <Upload className="w-7 h-7 mb-1 text-yellow-500" />
                <p className="text-sm text-white">Withdraw</p>
              </div>
            </Link>
            <Link to={"/svip"}>
              <div className="flex flex-col items-center cursor-pointer">
                <Star className="w-7 h-7 mb-1 text-yellow-500" />
                <p className="text-sm text-white">SVIP</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Banner Image */}
        <Link to={"/safe-box"}>
          <img
            src={safe_banner}
            alt="Safe Banner"
            className="cursor-pointer my-4"
          />
        </Link>

        {/* Transaction History */}
        <div className=" rounded-2xl shadow-md">
          <div className="grid grid-cols-2 gap-4">
            {history_icons.map((section, index) => (
              <Link to={section.link_to} key={index}>
                <div className="flex items-center p-2 bg-[#595959] rounded-lg space-x-2 cursor-pointer">
                  <div className="w-10 h-10 flex-shrink-0">
                    <img
                      src={section.icon}
                      alt={section.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {section.title}
                    </h3>
                    <p className="text-[10px] text-gray-200">
                      {section.subTitle}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Statistics */}
        <div className="rounded-2xl shadow-md my-4">
          <div className="grid grid-cols-1 gap-1">
            {settings.map((tile, index) => (
              <Link key={index} to={tile.link_to}>
                <div className="flex items-center justify-between p-4 bg-[#595959] rounded-lg cursor-pointer hover:bg-[#4a4a4a] transition-all">
                  <div className="flex items-center space-x-4">
                    <span>{tile.icon}</span>
                    <h3 className="text-white font-semibold text-sm">
                      {tile.title}
                    </h3>
                  </div>

                  {/* Right Arrow and Badge for Notifications */}
                  <div className="relative flex items-center">
                    <ChevronRight className="text-gray-300 text-lg ml-2" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Service Center */}
        <div className="p-6 bg-[#595959] rounded-xl shadow-lg">
          <h2 className="text-xl font-bold text-white mb-4">Service Center</h2>
          <div className="grid grid-cols-3 gap-4">
            {services.map((service, index) => (
              <Link key={index} to={service.to_link}>
                <div className="flex flex-col items-center justify-center rounded-lg cursor-pointer transition">
                  {service.icon}
                  <p className="text-xs text-white mt-2 text-center">
                    {service.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex justify-center my-4 border-2 border-gray-400 rounded-2xl py-1 text-gray-400"
        >
          <LogOut /> <span className="ml-1">Log Out</span>
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
