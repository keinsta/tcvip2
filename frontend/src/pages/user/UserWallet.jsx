import React, { useState, useEffect } from "react";
import { icons } from "../../assets/icons/wallet-icons";
import useAuthStore from "../../store/authStore";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const UserWallet = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const withdrawalPasswordStatus = user?.withdrawalPasswordStatus;
  const maxBalance = user?.totalBalance || 0; // Ensure totalBalance is always defined
  const [progress, setProgress] = useState(0);

  const handleNavigation = (e, link) => {
    if (!withdrawalPasswordStatus && link === "/withdraw") {
      e.preventDefault(); // Stop the default navigation
      toast.error("You need to set up your withdrawal password first!");
      navigate("/user-me/settings"); // Redirect manually
    }
  };

  useEffect(() => {
    if (maxBalance > 0) {
      const interval = setInterval(() => {
        setProgress((prev) => (prev < 100 ? prev + 1 : 100));
      }, 20);
      return () => clearInterval(interval);
    }
  }, [maxBalance]);

  const strokeDasharray = 251.2;
  const strokeDashoffset = strokeDasharray - (strokeDasharray * progress) / 100;
  const calculatedAmount = ((maxBalance * progress) / 100).toFixed(2); // Balance based on percentage

  return (
    <div className="h-[100vh]">
      {/* Header Section */}
      <div className="w-full bg-gradient-yellow-headers pb-6 mb-2">
        <div className="w-full pt-4 px-4 flex flex-col items-center">
          <div className="text-white flex flex-col items-center">
            <img src={icons[0].icon} alt="Wallet-Icon" className="w-10" />
            <div className="flex flex-col items-center">
              <h3 className="text-2xl">₹{maxBalance}</h3>
              <p className="text-xs">Total Balance</p>
            </div>
          </div>

          <div className="text-white flex justify-evenly w-full mt-2">
            <div className="flex flex-col items-center">
              <h3 className="text-2xl">₹0.00</h3>
              <p className="text-xs">Withdraw Amount</p>
            </div>
            <div className="flex flex-col items-center">
              <h3 className="text-2xl">₹0.00</h3>
              <p className="text-xs">Deposit Amount</p>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Section */}
      <div className="w-[95%] mx-auto bg-[#818181] rounded-lg shadow-md mt-[-20px] px-4 pt-2">
        <div className="flex justify-around">
          {/* Main Wallet Progress Circle */}
          <div className="relative w-28 h-28">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                className="text-gray-300"
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
                r="40"
                cx="50"
                cy="50"
              />
              <circle
                className="text-yellow-500"
                strokeWidth="10"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="40"
                cx="50"
                cy="50"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-lg text-gray-100">
              <div>{progress}%</div>
              <span className="text-xs">₹{calculatedAmount}</span>
            </div>
            <p className="text-sm text-white text-center mt-2">Main Wallet</p>
          </div>

          {/* 3rd Party Wallet Progress Circle */}
          <div className="relative w-28 h-28">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                className="text-gray-300"
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
                r="40"
                cx="50"
                cy="50"
              />
              <circle
                className="text-yellow-500"
                strokeWidth="10"
                strokeDasharray={0}
                strokeDashoffset={0}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="40"
                cx="50"
                cy="50"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-lg text-gray-100">
              <span>0%</span>
              <span className="text-xs">₹0.00</span>
            </div>
            <p className="text-sm text-white text-center mt-2">
              3rd Party Wallet
            </p>
          </div>
        </div>

        {/* Wallet Transfer Button */}
        <button className="bg-gradient-yellow-headers w-full rounded-3xl p-2 mt-8 text-white font-semibold">
          Main Wallet Transfer
        </button>

        {/* Icons Section */}
        <div className="flex justify-between p-4">
          {icons.slice(1).map((icon, index) => (
            <Link
              key={index}
              to={
                withdrawalPasswordStatus || icon.link_to !== "/withdraw"
                  ? icon.link_to
                  : "/user-me/settings"
              }
              onClick={(e) => handleNavigation(e, icon.link_to)}
            >
              <div className="flex flex-col items-center w-12">
                <div className="p-2 bg-orange-100 rounded-2xl mb-2">
                  <img src={icon.icon} alt={icon.title} />
                </div>
                <p className="text-xs text-white text-center">{icon.title}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Additional Wallet Stats */}
      <div className="max-w-3xl mx-auto grid grid-cols-3 gap-4 py-2 px-4 my-1">
        {[
          { amount: user?.totalBalance, text: "Total Balance" },
          { amount: "300", text: "Pending Withdrawal" },
          { amount: "500", text: "Total Deposited" },
          { amount: "200", text: "Last Withdrawal" },
          { amount: "100", text: "Bonus Earned" },
          { amount: "50", text: "Referral Earnings" },
        ].map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-center p-4 bg-[#818181] rounded-lg shadow-lg"
          >
            <span className="text-sm text-white font-bold">₹{item.amount}</span>
            <span className="text-gray-100 text-xs text-center">
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserWallet;
