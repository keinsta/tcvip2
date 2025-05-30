import React from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

// Register required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const TransactionCharts = ({ data }) => {
  // Show empty layout until data loads
  const isDataAvailable = data && data.success;

  const currentWeek = isDataAvailable ? data.currentWeek : {};
  const lastWeek = isDataAvailable ? data.lastWeek : {};
  const cumulativeTotals = isDataAvailable ? data : {};

  // 📊 Bar Chart: Cumulative Totals
  const barChartData = {
    labels: ["Total Deposits", "Total Withdrawals", "Total Transactions"],
    datasets: [
      {
        label: "Cumulative Totals",
        data: [
          cumulativeTotals.cumulativeTotalDepositAmount || 0,
          cumulativeTotals.cumulativeTotalWithdrawalAmount || 0,
          cumulativeTotals.totalTransactions || 0,
        ],
        backgroundColor: ["#4CAF50", "#FF5733", "#1E88E5"], // Green, Red, Blue
      },
    ],
  };

  // 📈 Line Chart: Weekly Trend
  const lineChartData = {
    labels: ["Last Week", "Current Week"],
    datasets: [
      {
        label: "Deposits",
        data: [
          lastWeek.totalDepositAmount || 0,
          currentWeek.totalDepositAmount || 0,
        ],
        borderColor: "#4CAF50",
        backgroundColor: "rgba(76, 175, 80, 0.2)",
        borderWidth: 2,
        fill: true,
      },
      {
        label: "Withdrawals",
        data: [
          lastWeek.totalWithdrawalAmount || 0,
          currentWeek.totalWithdrawalAmount || 0,
        ],
        borderColor: "#FF5733",
        backgroundColor: "rgba(255, 87, 51, 0.2)",
        borderWidth: 2,
        fill: true,
      },
    ],
  };

  // 🥧 Pie Chart: Deposit vs Withdrawal Ratio
  const pieChartData = {
    labels: ["Total Deposits", "Total Withdrawals"],
    datasets: [
      {
        data: [
          cumulativeTotals.cumulativeTotalDepositAmount || 0,
          cumulativeTotals.cumulativeTotalWithdrawalAmount || 0,
        ],
        backgroundColor: ["#4CAF50", "#FF5733"],
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* 📊 Bar Chart */}
      <div className="p-4 bg-white shadow-md rounded-lg dark:bg-gray-800">
        <h2 className="text-lg font-semibold mb-4">Cumulative Totals</h2>
        <Bar
          data={barChartData}
          options={{
            responsive: true,
            plugins: { legend: { position: "top" } },
          }}
        />
      </div>

      {/* 📈 Line Chart */}
      <div className="p-4 bg-white shadow-md rounded-lg dark:bg-gray-800">
        <h2 className="text-lg font-semibold mb-4">
          Weekly Transaction Trends
        </h2>
        <Line
          data={lineChartData}
          options={{
            responsive: true,
            plugins: { legend: { position: "top" } },
          }}
        />
      </div>

      {/* 🥧 Pie Chart */}
      <div className="p-4 bg-white shadow-md rounded-lg dark:bg-gray-800">
        <h2 className="text-lg font-semibold mb-4">
          Deposit vs Withdrawal Ratio
        </h2>
        <Pie
          data={pieChartData}
          options={{
            responsive: true,
            plugins: { legend: { position: "top" } },
          }}
        />
      </div>
    </div>
  );
};

export default TransactionCharts;
