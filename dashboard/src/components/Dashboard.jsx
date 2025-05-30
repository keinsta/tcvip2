import React, { useState, useEffect } from "react";
import axiosInstance from "../config/axiosInstance";
import Card from "./Card";
import { FaUsers, FaExchangeAlt, FaArrowDown, FaArrowUp } from "react-icons/fa";
import toast from "react-hot-toast";
import UserGrowthChart from "./charts/UserGrowthCharts";
import TransactionCharts from "./charts/TransactionsCharts";

const Dashboard = () => {
  const [transactionsStats, setTransactionsStats] = useState(null);
  const [usersStats, setUsersStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersResponse, transactionsResponse] = await Promise.all([
        axiosInstance.get("/admin/get-users-growth"),
        axiosInstance.get("/transaction/get-transactions-stats"),
      ]);

      setUsersStats(usersResponse.data);
      setTransactionsStats(transactionsResponse.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="w-full pb-6 sm:p-2 space-y-4">
      <h2 className="text-2xl mb-4 font-semibold">Dashboard</h2>

      {/* Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-gray-300 dark:bg-gray-700 rounded-md animate-pulse"
            ></div>
          ))
        ) : (
          <>
            <Card
              icon={<FaUsers />}
              title="Total Users"
              value={usersStats?.totalUsers}
            />
            <Card
              icon={<FaExchangeAlt />}
              title="Total Transactions"
              value={transactionsStats?.totalTransactions}
            />
            <Card
              icon={<FaArrowDown />}
              title="Total Deposits"
              value={transactionsStats?.cumulativeTotalDeposits}
              percentage={
                transactionsStats?.percentageChange?.depositPercentageChange
              }
            />
            <Card
              icon={<FaArrowUp />}
              title="Total Withdrawals"
              value={transactionsStats?.cumulativeTotalWithdrawals}
              percentage={
                transactionsStats?.percentageChange?.withdrawalPercentageChange
              }
            />
          </>
        )}
      </div>

      {/* Charts Section */}
      <UserGrowthChart data={loading ? null : usersStats} />
      <TransactionCharts data={loading ? null : transactionsStats} />
    </div>
  );
};

export default Dashboard;
