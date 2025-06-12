import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BarChart2, Calendar } from "lucide-react";

const GamesStats = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState("today");
  const [statistics, setStatistics] = useState(null);

  useEffect(() => {
    // Simulating API response - Assume empty stats for new users
    const fetchData = async () => {
      const response = {
        // cumulative: { totalBet: 0 }, // Default to zero
        // today: { bets: 0, totalBet: 0, profit: 0 },
        // yesterday: { bets: 0, totalBet: 0, profit: 0 },
        // thisWeek: { bets: 0, totalBet: 0, profit: 0 },
        // thisMonth: { bets: 0, totalBet: 0, profit: 0 },
        cumulative: { totalBet: 114200 },
        today: { bets: 2, totalBet: 5000, profit: 1200 },
        yesterday: { bets: 4, totalBet: 4200, profit: 900 },
        thisWeek: { bets: 6, totalBet: 25000, profit: 6800 },
        thisMonth: { bets: 8, totalBet: 80000, profit: 18500 },
      };
      setStatistics(response);
    };

    fetchData();
  }, []);

  if (!statistics) return <div className="text-center mt-10">Loading...</div>;

  const currentStats =
    statistics[selectedPeriod] ||
    {
      // bets: 0,
      // totalBet: 0,
      // profit: 0,
    };

  return (
    <div className="mb-28 min-h-screen flex flex-col items-center">
      {/* Header */}
      <div className="w-full h-[54px] bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-between px-4 shadow-md text-white">
        <div className="flex items-center">
          <ArrowLeft
            className="mr-4 cursor-pointer"
            onClick={() => navigate(-1)}
          />
          <span className="text-lg">Game Statistics</span>
        </div>
        <BarChart2 className="w-6 h-6" />
      </div>

      {/* Time Filter Buttons */}
      <div className="w-full max-w-md mt-6 flex justify-between space-x-2">
        {["today", "yesterday", "thisWeek", "thisMonth"].map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`flex-1 text-center py-2 rounded-md text-white font-semibold transition-all duration-300 ${
              selectedPeriod === period
                ? "bg-yellow-500 shadow-md"
                : "bg-gray-300 hover:bg-gray-400"
            }`}
            style={{ minWidth: "70px" }}
          >
            {period}
          </button>
        ))}
      </div>

      {/* Total Bet Amount Card */}
      <div className="w-full max-w-md mt-6 p-5 bg-gradient-yellow-headers shadow-lg rounded-lg text-center">
        <h2 className="text-white text-lg font-semibold">Total Bet Amount</h2>
        <p className="text-2xl font-bold text-white">
          ₹{statistics.cumulative?.totalBet?.toLocaleString() || "0.00"}
        </p>
      </div>

      {/* Bet Statistics Section */}
      <div className="w-full max-w-md mt-6">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Bet Statistics
        </h3>
        <div className="bg-white shadow-lg rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-gray-600">Number of Bets</span>
            <span className="font-bold text-gray-800">
              {currentStats?.bets || 0}
            </span>
          </div>
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-gray-600">Total Bet</span>
            <span className="font-bold text-yellow-500">
              ₹{currentStats?.totalBet?.toLocaleString() || "0.00"}
            </span>
          </div>
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-gray-600">Profit</span>
            <span className="font-bold text-green-500">
              ₹{currentStats?.profit?.toLocaleString() || "0.00"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamesStats;
