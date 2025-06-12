import React, { useEffect, useState } from "react";
import axiosInstance from "../config/axiosInstance";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Agents = () => {
  const [agentUID, setAgentUID] = useState("");
  const [agentProfile, setAgentProfile] = useState(null);
  const [subordinatesStats, setSubordinatesStats] = useState(null);
  const [subordinatesData, setSubordinatesData] = useState(null);
  const [agentProfileLoading, setAgentProfileLoading] = useState(false);
  const [subordinatesLoading, setSubordinatesLoading] = useState(false);
  const [subordinatesDataLoading, setSubordinatesDataLoading] = useState(false);
  const today = new Date().toISOString().slice(0, 10); // e.g., "2025-05-19"
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const fetchAgentSubordinatesStats = async (startDate, endDate) => {
    try {
      setSubordinatesLoading(true);

      // Construct query parameters for startDate and endDate
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      console.log(startDate, endDate, agentUID);

      const response = await axiosInstance.get(
        `/agent/subordinate-stats2/${agentUID}?${params.toString()}`
      );

      setSubordinatesStats(response.data);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to fetch subordinate stats."
      );
      setSubordinatesStats(null);
    } finally {
      setSubordinatesLoading(false);
    }
  };

  const fetchAgentProfile = async () => {
    const normalizedUID = agentUID.startsWith("MEMBER-")
      ? agentUID
      : `MEMBER-${agentUID}`;
    try {
      setAgentProfileLoading(true);
      const response = await axiosInstance.get(
        `/admin/get-agent-profile/${normalizedUID}`
      );
      setAgentProfile(response.data.agentProfile);
      //   setAgentUID("");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to fetch agent profile."
      );
      setAgentProfile(null);
    } finally {
      setAgentProfileLoading(false);
    }
  };

  const fetchAgentSubordinatesData = async () => {
    const normalizedUID = agentUID.startsWith("MEMBER-")
      ? agentUID
      : `MEMBER-${agentUID}`;
    try {
      setSubordinatesDataLoading(true);
      // Construct query parameters for startDate and endDate
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      console.log(startDate, endDate, agentUID);
      const response = await axiosInstance.get(
        `/agent/direct-children/${normalizedUID}?${params.toString()}`
      );
      console.log(response.data);
      setSubordinatesData(response.data);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to fetch subordinate stats."
      );
      setSubordinatesData(null);
    } finally {
      setSubordinatesDataLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!agentUID.trim()) return toast.error("Please enter an Agent UID");
    fetchAgentProfile();
    fetchAgentSubordinatesStats();
    fetchAgentSubordinatesData();
  };

  useEffect(() => {
    //   console.log(startDate, endDate);
    if (agentProfile) {
      fetchAgentSubordinatesStats(startDate, endDate);
      fetchAgentSubordinatesData(startDate, endDate);
    }
  }, [startDate, endDate]);
  const SkeletonLine = ({ width = "w-full" }) => (
    <div className={`h-4 rounded bg-gray-600 animate-pulse ${width}`} />
  );

  return (
    <div className="w-full space-y-6">
      {/* Agent Search and Profile */}
      <div className="bg-gray-800 rounded-md shadow p-6 space-y-6">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col md:flex-row items-start md:items-end gap-4"
        >
          <input
            type="text"
            placeholder="Enter Agent UID"
            value={agentUID}
            onChange={(e) => setAgentUID(e.target.value)}
            className="bg-gray-900 border border-gray-700 text-white p-2 rounded w-full md:w-[300px]"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 rounded"
          >
            {agentProfileLoading ? "Fetching..." : "Fetch Agent Profile"}
          </button>
        </form>

        {/* Profile Section */}
        <div className="mt-4">
          {agentProfileLoading ? (
            <div className="space-y-2">
              <SkeletonLine width="w-2/3" />
              {[...Array(6)].map((_, i) => (
                <SkeletonLine key={i} />
              ))}
            </div>
          ) : agentProfile ? (
            <div className="text-sm text-gray-300 space-y-1">
              <h3 className="text-lg font-semibold text-white">
                Agent Details (Level {agentProfile.level})
              </h3>
              <p>
                <strong>UID:</strong> {agentProfile.uid}
              </p>
              <p>
                <strong>Parent UID:</strong> {agentProfile.parentUID || "N/A"}
              </p>
              <p>
                <strong>Name:</strong> {agentProfile.nickname || "N/A"}
              </p>
              <p>
                <strong>Email:</strong> {agentProfile.email || "N/A"}
              </p>
              <p>
                <strong>Phone:</strong> {agentProfile.phone || "N/A"}
              </p>
              <p>
                <strong>Total Balance:</strong> ₹
                {agentProfile.totalBalance || 0}
              </p>
              <p>
                <strong>Number of Children:</strong>{" "}
                {subordinatesData?.totalChildren || 0}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {agentProfile && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 bg-transparent">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <label htmlFor="start-date" className="text-sm font-medium">
              Start Date
            </label>
            <DatePicker
              id="start-date"
              className="border border-gray-300 rounded px-2 py-1 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              selected={new Date(startDate)}
              onChange={(date) => setStartDate(date.toISOString().slice(0, 10))}
              dateFormat="yyyy-MM-dd"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <label htmlFor="end-date" className="text-sm font-medium">
              End Date
            </label>
            <DatePicker
              id="end-date"
              className="border border-gray-300 rounded px-2 py-1 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              selected={new Date(endDate)}
              onChange={(date) => setEndDate(date.toISOString().slice(0, 10))}
              dateFormat="yyyy-MM-dd"
              minDate={new Date(startDate)}
            />
          </div>
        </div>
      )}
      {/* Subordinate Stats */}
      <div className="bg-gray-800 rounded-md shadow p-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          Subordinates Statistics
        </h2>
        {subordinatesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <SkeletonLine width="w-1/2" />
                <SkeletonLine width="w-1/4" />
              </div>
            ))}
          </div>
        ) : subordinatesStats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <Stat
              label="New Registration Accounts"
              value={subordinatesStats.newRegistrationAccounts}
            />
            <Stat
              label="Deposit Accounts"
              value={subordinatesStats.depositAccounts}
            />
            <Stat
              label="Deposit Amount"
              value={`₹${subordinatesStats.depositAmount || 0}`}
            />
            <Stat
              label="Withdrawal Accounts"
              value={subordinatesStats.withdrawalAccounts}
            />
            <Stat
              label="Withdrawal Amount"
              value={`₹${subordinatesStats.withdrawalAmount || 0}`}
            />
            <Stat label="Bet Accounts" value={subordinatesStats.betAccounts} />
            <Stat
              label="Bet Amount"
              value={`₹${subordinatesStats.betAmount || 0}`}
            />
            <Stat
              label="First Deposit Accounts"
              value={subordinatesStats.firstDepositAccounts}
            />
            <Stat
              label="First Deposit Amount"
              value={`₹${subordinatesStats.firstDepositAmount || 0}`}
            />
            <Stat
              label="Second Deposit Accounts"
              value={subordinatesStats.secondDepositAccounts}
            />
            <Stat
              label="Second Deposit Amount"
              value={`₹${subordinatesStats.secondDepositAmount || 0}`}
            />
            <Stat
              label="Third Deposit Accounts"
              value={subordinatesStats.thirdDepositAccounts}
            />
            <Stat
              label="Third Deposit Amount"
              value={`₹${subordinatesStats.thirdDepositAmount || 0}`}
            />
          </div>
        ) : (
          <p className="text-gray-400">
            No data available. Please search for an agent.
          </p>
        )}
      </div>

      {subordinatesData && (
        <div className="bg-gray-800 p-6 space-y-6 overflow-auto">
          <table className="min-w-full bg-gray-800 border rounded-xl shadow text-sm">
            <thead className="bg-gray-700 text-white text-left">
              <tr>
                {/* <th className="px-4 py-2">Email</th> */}
                <th className="px-2 text-center py-2 border">UID</th>
                <th className="px-2 text-center py-2 border">Role</th>
                <th className="px-2 text-center py-2 border">Status</th>
                <th className="px-2 text-center py-2 border">Level</th>
                <th className="px-2 text-center py-2 border">Balance</th>
                <th className="px-2 text-center py-2 border">
                  No. of Deposits
                </th>
                <th className="px-2 text-center py-2 border">Deposits</th>
                <th className="px-2 text-center py-2 border">
                  No. of Withdrawals
                </th>
                <th className="px-2 text-center py-2 border">Withdrawals</th>
                <th className="px-2 text-center py-2 border">Winnings</th>
                <th className="px-2 text-center py-2 border">
                  Deposit Rewards
                </th>
                <th className="px-2 text-center py-2 border">Bet Placed</th>
                {/* <th className="px-4 py-2">Recent Logins</th> */}
              </tr>
            </thead>

            <tbody>
              {subordinatesData.children.map((user) => (
                <tr
                  key={user._id}
                  className="border-t text-center hover:bg-gray-700"
                >
                  {/* <td className="px-4 py-2 font-medium text-white">
                    {user.email}
                  </td> */}
                  <td className="px-4 border py-2">{user.uid}</td>
                  <td className="px-4 border py-2">
                    <span
                      className={`px-2  border py-1 rounded-full text-xs font-semibold ${
                        user.role === "admin"
                          ? "bg-red-100 text-red-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 border py-2">
                    <span
                      className={`font-semibold ${
                        user.status === "active"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 border py-2">{user.level}</td>
                  <td className="px-4 border py-2">₹{user.totalBalance}</td>
                  <td className="px-4 border py-2">
                    ₹{user.totalDepositsCounts}
                  </td>
                  <td className="px-4 border py-2">
                    ₹{user.totalDepositsAmount}
                  </td>
                  <td className="px-4 border py-2">
                    ₹{user.totalWithdrawalsCounts}
                  </td>
                  <td className="px-4 border py-2">
                    ₹{user.totalWithdrawalsAmount}
                  </td>
                  <td className="px-4 border py-2">₹{user.winningsAmount}</td>
                  <td className="px-4 border py-2">
                    <div className="space-y-1">
                      <div>
                        First: ₹{user.firstDepositAmount}{" "}
                        {user.firstDepositRewardClaimed && (
                          <span className="text-green-600 text-xs">
                            (Claimed)
                          </span>
                        )}
                      </div>
                      {user.secondDepositAmount > 0 && (
                        <div>
                          Second: ₹{user.secondDepositAmount}{" "}
                          {user.secondDepositRewardClaimed && (
                            <span className="text-green-600 text-xs">
                              (Claimed)
                            </span>
                          )}
                        </div>
                      )}
                      {user.thirdDepositAmount > 0 && (
                        <div>
                          Third: ₹{user.thirdDepositAmount}{" "}
                          {user.thirdDepositRewardClaimed && (
                            <span className="text-green-600 text-xs">
                              (Claimed)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2">{user.betsPlaced}</td>
                  {/* <td className="px-4 py-2 text-xs text-gray-600">
                    {user.loginHistory?.slice(0, 3).map((login) => (
                      <div key={login._id}>
                        {new Date(login.loginAt).toLocaleString()} —{" "}
                        {login.userAgent}
                      </div>
                    ))}
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const Stat = ({ label, value }) => (
  <div className="flex justify-between border-b border-gray-700 py-1/2">
    <span className="text-gray-400">{label}</span>
    <span className="font-medium text-white">{value ?? 0}</span>
  </div>
);

export default Agents;
