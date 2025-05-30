import React, { useState, useEffect, use } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Clipboard,
  RefreshCcw,
  Gift,
  DollarSign,
  Crown,
  ShieldCheck,
  TrendingUp,
  ArrowUpCircle,
  Repeat,
  AlertTriangle,
  Coins,
  FolderOpen,
  History,
} from "lucide-react";
import useAuthStore from "../../store/authStore";
import safe_banner from "../../assets/images/banners/safe_banner.png";
import { history_icons } from "../../assets/icons/wallet-icons";
import axiosInstance from "../../config/axiosInstance";
import { avatars } from "../../assets/images/avatar/avatar";

const benefits = [
  {
    title: "Upgrade Reward",
    description: "Each account can only claim it once",
    value: "12",
    icon: <Gift className="w-6 h-6 text-yellow-600" />,
  },
  {
    title: "Cycle Reward",
    description: "Each account can only claim it once per cycle",
    value: "2",
    icon: <RefreshCcw className="w-6 h-6 text-yellow-600" />,
  },
  {
    title: "Betting Rebate",
    description: "Increase your income through betting rebates",
    value: "0.6%",
    icon: <DollarSign className="w-6 h-6 text-yellow-600" />,
  },
];

const eliteRules = [
  {
    title: "Promotion Standards",
    description:
      "VIP members' experience points (valid betting amount) meet the requirements for the corresponding level, and they will be promoted to the relevant VIP level.",
    icon: <TrendingUp className="w-6 h-6 text-blue-400" />,
  },
  {
    title: "Promotion Order",
    description:
      "The VIP level that meets the corresponding requirements will be automatically upgraded.",
    icon: <ArrowUpCircle className="w-6 h-6 text-green-500" />,
  },
  {
    title: "Level Maintenance",
    description:
      "After changing the VIP level, members must meet maintenance requirements within 7 days. If completed, maintenance will be recalculated.",
    icon: <Repeat className="w-6 h-6 text-yellow-400" />,
  },
  {
    title: "Downgrade Standards",
    description:
      "If a VIP member fails to meet maintenance requirements within 7 days, experience points will be deducted, possibly resulting in a downgrade.",
    icon: <AlertTriangle className="w-6 h-6 text-red-500" />,
  },
  {
    title: "Upgrade Reward",
    description:
      "VIP members can claim upgrade benefits once per level. Each level can only be rewarded once.",
    icon: <Gift className="w-6 h-6 text-purple-500" />,
  },
  {
    title: "Cycle Bonus",
    description:
      "VIP members receive one reward per cycle. Unclaimed rewards reset on the next settlement day.",
    icon: <Coins className="w-6 h-6 text-orange-500" />,
  },
  {
    title: "Betting Rebate",
    description:
      "Higher VIP levels receive higher betting rebate rates. All games are calculated in real-time, and you can claim rewards personally.",
    icon: <ShieldCheck className="w-6 h-6 text-teal-500" />,
  },
];

const SVIP = () => {
  const { user, fetchUser } = useAuthStore();
  const memberId = user?.uid?.replace("MEMBER-", "") || "";
  const memberAvatar = user?.avatar;
  const navigate = useNavigate();
  const [toggle, setToggle] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([
    "Upgraded to VIP Level 2",
    "Claimed Cycle Reward - $50",
    "Received Betting Rebate - 0.5%",
    "Deposited $200 into Safe",
  ]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(memberId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      <div className="w-full bg-gradient-yellow-headers p-4 pb-10 rounded-b-3xl">
        {/* Profile Header */}
        <div className="flex items-center gap-4 p-4 rounded-lg shadow-md">
          {/* Avatar */}
          <div className="w-16 h-16" onClick={() => navigate("/change-avatar")}>
            <img
              src={selectedAvatar?.avatar}
              alt="Avatar"
              className="w-full h-full rounded-full cursor-pointer"
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
          </div>
        </div>
      </div>

      <div className="w-full px-4 relative top-[-30px] space-y-4">
        {/* Total Balance Component */}
        <div className="flex justify-evenly gap-3 rounded-2xl shadow-md ">
          <div className="w-1/2 p-2 bg-white rounded-lg shadow">
            {/* Content for first section */}
            <h2 className="text-sm text-center font-semibold text-yellow-800">
              0.00 EXP
            </h2>
            <p className="text-xs text-center text-gray-600">My Experience</p>
          </div>

          <div className="w-1/2 p-2 bg-white rounded-lg shadow">
            {/* Content for second section */}
            <h2 className="text-sm text-center">
              <span className="font-semibold">6</span> Days
            </h2>
            <p className="text-xs text-center text-gray-600">Settlement Date</p>
          </div>
        </div>

        {/* SVIP Announcement */}
        <div className="pl-2 text-sm bg-white rounded-md shadow">
          VIP level rewards will be settled at 2 AM every Monday
        </div>

        {/* SVIP1 Benefits */}
        <div className="space-y-4 bg-[#595959] text-white p-4 rounded-2xl shadow-lg w-full max-w-2xl mx-auto mt-6">
          {/* VIP Benefits Header */}
          <div className="flex items-center gap-3 mb-6">
            <Crown className="w-8 h-8 text-yellow-400" />
            <h2 className="text-2xl font-bold">SVIP Benefits</h2>
          </div>

          {/* Benefit Tiles (Vertical) */}
          <div className="space-y-4">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-app-bg p-4 rounded-lg shadow-md flex items-center gap-4 transition-all hover:scale-105 "
              >
                <div>{benefit.icon}</div>
                <div>
                  <h3 className="text-sm font-semibold">{benefit.title}</h3>
                  <p className="text-sm text-gray-400">{benefit.description}</p>
                  <span className="text-sm font-bold mt-1 text-yellow-400 block">
                    {benefit.value}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Toggle Buttons */}
          <div className="flex w-full border-2 border-yellow-500 rounded-lg">
            <button
              onClick={() => setToggle(true)}
              className={`w-1/2 p-3 text-sm font-semibold ${
                toggle ? "bg-yellow-500 text-gray-900" : ""
              } rounded-l-lg transition-all`}
            >
              History
            </button>
            <button
              onClick={() => setToggle(false)}
              className={`w-1/2 p-3 text-sm font-semibold ${
                !toggle ? "bg-yellow-500 text-gray-900" : ""
              } rounded-r-lg transition-all`}
            >
              VIP Rules
            </button>
          </div>

          {toggle ? (
            // History Section
            <div className="text-white rounded-2xl shadow-xl w-full max-w-3xl mx-auto flex items-center justify-center">
              {history.length > 0 ? (
                <div className="w-full">
                  <h2 className="text-2xl font-bold flex items-center gap-2 ">
                    <History className="w-8 h-8 text-yellow-400" />
                    History
                  </h2>
                  <ul className="p-4">
                    {history.map((item, index) => (
                      <li
                        key={index}
                        className=" flex justify-between transition-all"
                      >
                        <span>- {item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <FolderOpen className="w-12 h-12 text-yellow-600" />
                  <p className="text-yellow-400 text-lg mt-2">
                    No History Found
                  </p>
                </div>
              )}
            </div>
          ) : (
            // Rules
            <div className=" text-white rounded-2xl w-full max-w-3xl mx-auto mt-6">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <ShieldCheck className="w-8 h-8 text-yellow-400" />
                <h2 className="text-2xl font-bold">VIP Privileges</h2>
              </div>

              {/* Rules List */}
              <div className="space-y-2">
                {eliteRules.map((rule, index) => (
                  <div
                    key={index}
                    className=" p-2 rounded-lg shadow-xl flex items-center gap-4 transition-all hover:scale-105 "
                  >
                    <div>{rule.icon}</div>
                    <div>
                      <h3 className="text-sm font-semibold">{rule.title}</h3>
                      <p className="text-xs text-gray-400">
                        {rule.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SVIP;
