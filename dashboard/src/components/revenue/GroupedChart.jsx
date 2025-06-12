import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
ChartJS.register(BarElement, CategoryScale, LinearScale);

const GroupedChart = ({ data }) => {
  const chartData = {
    labels: data.map((d) => d.gameName),
    datasets: [
      {
        label: "Bet Amount (₹)",
        data: data.map((d) => d.totalAmount),
        backgroundColor: "rgba(59, 130, 246, 0.6)",
      },
      {
        label: "Service Fee (₹)",
        data: data.map((d) => d.totalServiceFee),
        backgroundColor: "rgba(34, 197, 94, 0.6)",
      },
    ],
  };

  return <Bar data={chartData} />;
};

export default GroupedChart;
