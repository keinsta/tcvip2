import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const LineChart = ({ data, label }) => {
  const chartData = {
    labels: data.map((d) => d[label]),
    datasets: [
      {
        label: "Bet Amount (₹)",
        data: data.map((d) => d.totalAmount),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        fill: true,
      },
      {
        label: "Service Fee (₹)",
        data: data.map((d) => d.totalServiceFee),
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.2)",
        fill: true,
      },
    ],
  };

  return <Line data={chartData} />;
};

export default LineChart;
