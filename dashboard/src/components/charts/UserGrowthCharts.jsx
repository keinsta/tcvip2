import React, { useState, useEffect } from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const UserGrowthChart = ({ data }) => {
  // State to store chart data
  const [chartData, setChartData] = useState({
    labels: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    datasets: [
      {
        label: "Users Joined",
        data: Array(12).fill(0), // Default empty state before data arrives
        borderColor: "#4CAF50",
        backgroundColor: "rgba(76, 175, 80, 0.2)",
        borderWidth: 2,
        fill: true,
      },
    ],
  });

  // Update chart data when backend data arrives
  useEffect(() => {
    if (data && data.success) {
      // Define all months in order
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      // Create an array of 12 values, defaulting to 0
      const userCounts = months.map((month) => data.userGrowth[month] || 0);

      setChartData((prev) => ({
        ...prev,
        labels: months, // Ensure labels stay the same
        datasets: [{ ...prev.datasets[0], data: userCounts }],
      }));
    }
  }, [data]);

  return (
    <div className="p-4 bg-white shadow-md rounded-lg dark:bg-gray-800 w-full">
      <h2 className="text-lg font-semibold mb-4">User Growth Per Month</h2>

      {/* Flex Container for Responsive Charts */}
      <div className="flex flex-wrap justify-center gap-4">
        {/* Line Chart */}
        <div className="w-full lg:w-[48%] h-[300px] sm:h-[400px] md:h-[450px] p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <Line
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false, // Allow dynamic resizing
              plugins: { legend: { position: "top" } },
            }}
          />
        </div>

        {/* Bar Chart */}
        <div className="w-full lg:w-[48%] h-[300px] sm:h-[400px] md:h-[450px] p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <Bar
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false, // Allow dynamic resizing
              plugins: { legend: { position: "top" } },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default UserGrowthChart;
