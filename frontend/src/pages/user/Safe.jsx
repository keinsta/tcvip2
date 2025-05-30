import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

import { ArrowLeft, History, FolderOpen } from "lucide-react";
import safe_money from "../../assets/images/safe/savemoney_banner.png";

const Safe = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("deposit");
  const [history, setHistory] = useState([
    "Upgraded to VIP Level 2",
    "Claimed Cycle Reward - $50",
    "Received Betting Rebate - 0.5%",
    "Deposited $200 into Safe",
  ]);

  return (
    <div className="mb-28">
      {/* Header */}
      <div className="w-full h-[54px] bg-gradient-yellow-headers flex items-center justify-between px-4 shadow-md text-white">
        <div className="flex justify-center">
          <ArrowLeft
            className="mr-4 cursor-pointer"
            onClick={() => navigate(-1)}
          />
          <span className="text-lg">Safe</span>
        </div>
      </div>

      {/* Banner */}
      <img src={safe_money} alt="Safe Banner" className="cursor-pointer my-4" />

      <div className="w-full px-4 space-y-4">
        {/* Safe Money Details */}
        <div className="w-full bg-yellow-700 p-4 flex flex-col items-center rounded-lg">
          <div className="text-white flex flex-col items-center">
            <div className="flex flex-col items-center">
              <p className="text-xs">Safe Amount</p>
              <h3 className="text-3xl">
                ₹{user?.totalBalance.toLocaleString()}
              </h3>
            </div>
          </div>

          <div className="text-white flex justify-evenly w-full mt-2">
            <div className="flex flex-col items-center">
              <h3 className="text-2xl">₹0.00</h3>
              <p className="text-xs">My Balance</p>
            </div>
            <div className="flex flex-col items-center">
              <h3 className="text-2xl">₹0.00</h3>
              <p className="text-xs">Accumulated Earnings</p>
            </div>
          </div>
        </div>

        <div className="flex w-full border-2 border-yellow-500 rounded-lg mb-4">
          <button
            onClick={() => setActiveTab("deposit")}
            className={`w-1/3 p-3 text-sm font-semibold ${
              activeTab === "deposit"
                ? "bg-yellow-500 text-gray-900"
                : "text-white"
            } transition-all rounded-l-lg`}
          >
            Deposit
          </button>
          <button
            onClick={() => setActiveTab("my")}
            className={`w-1/3 p-3 text-sm font-semibold ${
              activeTab === "my" ? "bg-yellow-500 text-gray-900" : "text-white"
            } transition-all`}
          >
            My
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`w-1/3 p-3 text-sm font-semibold ${
              activeTab === "history"
                ? "bg-yellow-500 text-gray-900"
                : "text-white"
            } transition-all rounded-r-lg`}
          >
            My History
          </button>
        </div>

        <div className="rounded-lg shadow-lg w-full">
          {/* Deposit */}
          {activeTab === "deposit" && (
            <div className="flex justify-between p-4 items-center bg-white rounded-lg shadow-md">
              {/* Left Side (Details) */}
              <div className="space-y-2">
                <h3 className="text-sm text-center font-bold">
                  1-Day Custody Period
                </h3>
                <p className="text-xs text-center text-gray-700">
                  Minimum amount: ₹100
                </p>
                <p className="text-xs text-center text-gray-700">
                  Expiration earnings: 0.1%
                </p>
              </div>

              {/* Right Side (Button) */}
              <button className="text-sm md:text-lg bg-yellow-500 text-gray-900 px-5 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition-all">
                Deposit Now
              </button>
            </div>
          )}

          {/* My Section */}
          {activeTab === "my" && (
            <div className="text-white p-6 rounded-2xl shadow-xl w-full max-w-3xl mx-auto mt-6 min-h-[250px] flex items-center justify-center">
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
          )}

          {/* History Section */}
          {activeTab === "history" && (
            <div className="text-white p-6 rounded-2xl shadow-xl w-full max-w-3xl mx-auto mt-6 min-h-[250px] flex items-center justify-center">
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Safe;
