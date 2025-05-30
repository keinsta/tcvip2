import React, { useEffect, useState } from "react";
import axiosInstance from "../config/axiosInstance";
import Card from "../components/Card";
import {
  Chart as ChartJS,
  BarElement,
  ArcElement,
  LineElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  PointElement,
} from "chart.js";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import { Bar, Pie, Line } from "react-chartjs-2";

ChartJS.register(
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const CumulativeStats = () => {
  const [stats, setStats] = useState(null);
  const [transactionsStats, setTransactionsStats] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    financialStats();
    fetchWeeklyTransactionsStats();
  }, []);

  const financialStats = async () => {
    await axiosInstance
      .get("/transaction/get-cumulative-financial-stats")
      .then((res) => {
        setStats(res.data.stats);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching stats:", err);
        setLoading(false);
      });
  };

  const fetchWeeklyTransactionsStats = async () => {
    await axiosInstance
      .get("/transaction/get-transactions-stats")
      .then((response) => {
        setTransactionsStats(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.log("Error fetching weekly stats:", error);
        setLoading(false);
      });
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (!stats)
    return (
      <div className="text-center py-10 text-red-500">Failed to load stats</div>
    );

  const {
    totalTransactions,
    totalDeposits,
    totalDepositAmount,
    totalWithdrawals,
    totalWithdrawalAmount,
    chartHistory = [],
    pending,
    cancelled,
  } = stats;

  const barData = {
    labels: ["Deposits", "Withdrawals"],
    datasets: [
      {
        label: "Amount ₹",
        data: [totalDepositAmount, totalWithdrawalAmount],
        backgroundColor: ["#4ade80", "#f87171"],
      },
    ],
  };

  const barOptions = {
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        titleColor: "#ffffff", // Tooltip title color
        bodyColor: "#ffffff", // Tooltip body color
        footerColor: "#ffffff", // Tooltip footer color
      },
      legend: {
        labels: {
          color: "#ffffff", // Legend text color
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#ffffff", // X-axis labels color
        },
      },
      y: {
        ticks: {
          color: "#ffffff", // Y-axis labels color
        },
      },
    },
  };

  const pieData = {
    labels: ["Deposits", "Withdrawals"],
    datasets: [
      {
        label: "Transaction Share",
        data: [totalDeposits, totalWithdrawals],
        backgroundColor: ["#34d399", "#f87171"],
      },
    ],
  };

  const pieOptions = {
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        titleColor: "#ffffff", // Tooltip title color
        bodyColor: "#ffffff", // Tooltip body color
      },
      legend: {
        labels: {
          color: "#ffffff", // Legend text color
        },
      },
    },
  };

  const lineData = {
    labels: chartHistory.map((item) => item.date),
    datasets: [
      {
        label: "Deposits ₹",
        data: chartHistory.map((item) => item.deposits),
        fill: false,
        borderColor: "#4ade80",
        tension: 0.4,
      },
      {
        label: "Withdrawals ₹",
        data: chartHistory.map((item) => item.withdrawals),
        fill: false,
        borderColor: "#f87171",
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">
        Cumulative Financial Dashboard
      </h1>

      {/* Stat Cards */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Total Transactions" value={totalTransactions} />
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
        <StatCard
          title="Total Deposits"
          value={`${totalDeposits}`}
          subtitle={`₹${totalDepositAmount}`}
        />

        <StatCard
          title="Pending Deposits"
          value={pending.deposits?.count}
          subtitle={`₹${pending.deposits?.amount}`}
        />
        <StatCard
          title="Cancelled Deposits"
          value={cancelled.deposits?.count}
          subtitle={`₹${cancelled.deposits?.amount}`}
        />
        <StatCard
          title="Total Withdrawals"
          value={`${totalWithdrawals}`}
          subtitle={`₹${totalWithdrawalAmount}`}
        />
        <StatCard
          title="Pending Withdrawals"
          value={pending.withdrawals?.count}
          subtitle={`₹${pending.withdrawals?.amount}`}
        />
        <StatCard
          title="Cancelled Withdrawals"
          value={cancelled.withdrawals?.count}
          subtitle={`₹${cancelled.withdrawals?.amount}`}
        />
      </div>

      {/* Bar + Pie Charts */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Bar Chart */}
        <div className="w-full lg:w-1/2 bg-gray-800 p-4 rounded-lg shadow h-96">
          <Bar data={barData} options={barOptions} />
        </div>

        {/* Pie Chart */}
        <div className="w-full lg:w-1/2 bg-gray-800 p-4 rounded-lg shadow h-96">
          <Pie data={pieData} options={pieOptions} />
        </div>
      </div>

      {/* Line Chart */}
      {chartHistory.length > 0 && (
        <div className="w-full bg-gray-800 p-4 rounded-lg shadow h-80">
          <h2 className="text-xl font-semibold mb-2 text-white">
            Daily Trends
          </h2>
          <Line
            data={lineData}
            options={{
              maintainAspectRatio: false,
              plugins: {
                tooltip: {
                  titleColor: "#ffffff",
                  bodyColor: "#ffffff",
                },
                legend: {
                  labels: {
                    color: "#ffffff",
                  },
                },
              },
              scales: {
                x: {
                  ticks: {
                    color: "#ffffff",
                  },
                },
                y: {
                  ticks: {
                    color: "#ffffff",
                  },
                },
              },
            }}
          />
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, subtitle, color = "text-gray-800" }) => (
  <div className="bg-gray-800 p-4 rounded-lg shadow">
    <h3 className="text-lg font-bold text-gray-200">{title}</h3>
    <p className={`text-2xl text-white font-bold ${color}`}>{value}</p>
    {subtitle && (
      <p className="text-lg font-bold text-gray-100 mt-1">{subtitle}</p>
    )}
  </div>
);

export default CumulativeStats;
