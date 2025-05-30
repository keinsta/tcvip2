import React, { useState, useEffect } from "react";
import { Search, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useParentChildStore from "../store/parentToChildStore";

const AgentTeamReport = () => {
  const navigate = useNavigate();
  const { subOrdinatesStats } = useParentChildStore();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [uid, setUid] = useState("");

  useEffect(() => {
    useParentChildStore.getState().getChildrenStats(selectedDate);
  }, [selectedDate]);

  //   useEffect(() => {
  //     console.log(subOrdinatesStats);
  //   }, [subOrdinatesStats]);

  return (
    <div className="mb-28 min-h-screen flex flex-col items-center space-y-4">
      {/* Header */}
      <div className="w-full h-[54px] bg-gradient-yellow-headers flex items-center justify-between px-4 shadow-md text-white">
        <div className="flex justify-center">
          <ArrowLeft
            className="mr-2 cursor-pointer"
            onClick={() => navigate(-1)}
          />
          <span className="text-lg">Subordinates Data</span>
        </div>
      </div>

      <div className="w-full px-4 space-y-4">
        {/* Search + Filters */}
        <div className="w-full flex flex-col gap-4 mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search for subordinate member UID"
              className="w-full p-2 pr-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
              value={uid}
              onChange={(e) => setUid(e.target.value)}
            />
            <Search className="absolute right-3 top-2.5 text-orange-500 w-5 h-5" />
          </div>

          <div className="w-full flex justify-between gap-4">
            <select className="w-full p-2 rounded-lg border border-gray-300 bg-white text-gray-800 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all">
              <option
                className="bg-white text-gray-800 hover:bg-orange-100"
                value="All"
              >
                All
              </option>
              <option
                className="bg-white text-gray-800 hover:bg-orange-100"
                value="Today"
              >
                Level 1
              </option>
              <option
                className="bg-white text-gray-800 hover:bg-orange-100"
                value="This Week"
              >
                Level 2
              </option>
              <option
                className="bg-white text-gray-800 hover:bg-orange-100"
                value="This Month"
              >
                Level 3
              </option>
              <option
                className="bg-white text-gray-800 hover:bg-orange-100"
                value="This Month"
              >
                Level 4
              </option>
              <option
                className="bg-white text-gray-800 hover:bg-orange-100"
                value="This Month"
              >
                Level 5
              </option>
              <option
                className="bg-white text-gray-800 hover:bg-orange-100"
                value="This Month"
              >
                Level 6
              </option>
            </select>

            <input
              type="date"
              className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 bg-yellow-600 text-white rounded-2xl p-6">
          <div className="flex flex-col items-center">
            <p className="text-2xl font-bold">
              {subOrdinatesStats?.depositAccounts || 0}
            </p>
            <p className="text-sm sm:text-base">Deposit Accounts</p>
          </div>

          <div className="flex flex-col items-center">
            <p className="text-2xl font-bold">
              {subOrdinatesStats?.depositAmount || 0}
            </p>
            <p className="text-sm sm:text-base">Deposit Amount</p>
          </div>

          <div className="flex flex-col items-center">
            <p className="text-2xl font-bold">
              {subOrdinatesStats?.betAccounts || 0}
            </p>
            <p className="text-sm sm:text-base">Bet Accounts</p>
          </div>

          <div className="flex flex-col items-center">
            <p className="text-2xl font-bold">
              {" "}
              {subOrdinatesStats?.betAmount || 0}
            </p>
            <p className="text-sm sm:text-base">Bet Amount</p>
          </div>

          <div className="flex flex-col items-center">
            <p className="text-2xl font-bold">
              {" "}
              {subOrdinatesStats?.newDepositAccounts || 0}
            </p>
            <p className="text-sm sm:text-base">New Deposit Accounts</p>
          </div>

          <div className="flex flex-col items-center">
            <p className="text-2xl font-bold">
              {" "}
              {subOrdinatesStats?.firstDepositAmount || 0}
            </p>
            <p className="text-sm sm:text-base">First Deposit Amount</p>
          </div>
        </div>

        {/* Note */}
        <div className="text-center text-gray-500 mt-6 text-sm sm:text-base">
          Today's data will be available for query the next day
        </div>
      </div>
    </div>
  );
};

export default AgentTeamReport;
