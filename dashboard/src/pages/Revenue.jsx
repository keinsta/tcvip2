import React, { useEffect, useState } from "react";
import axiosInstance from "../config/axiosInstance";
import StatCard from "../components/revenue/StatCard";
import GroupedChart from "../components/revenue/GroupedChart";
import LineChart from "../components/revenue/LineChart";

const Revenue = () => {
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState({});
  const [byGame, setByGame] = useState([]);
  const [daily, setDaily] = useState([]);
  const [weekly, setWeekly] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [
          today,
          yesterday,
          thisWeek,
          thisMonth,
          game,
          dailyStats,
          weeklyStats,
        ] = await Promise.all([
          axiosInstance.get("/revenue/stats/today"),
          axiosInstance.get("/revenue/stats/yesterday"),
          axiosInstance.get("/revenue/stats/this-week"),
          axiosInstance.get("/revenue/stats/this-month"),
          axiosInstance.get("/revenue/stats/by-game"),
          axiosInstance.get("/revenue/stats/daily-this-month"),
          axiosInstance.get("/revenue/stats/weekly"),
        ]);
        setCards({
          today: today.data,
          yesterday: yesterday.data,
          thisWeek: thisWeek.data,
          thisMonth: thisMonth.data,
        });
        setByGame(game.data);
        setDaily(dailyStats.data);
        setWeekly(weeklyStats.data);
      } catch (err) {
        console.error("Error loading Revenue data:", err);
      }
      setLoading(false);
    };

    fetchStats();
  }, []);

  return (
    <div className="p-6 space-y-6 bg-gray-800 min-h-screen">
      <h1 className="text-3xl font-bold">📊 Admin Revenue Dashboard</h1>

      {loading ? (
        <div className="text-center py-20 text-gray-600 animate-pulse">
          Loading stats...
        </div>
      ) : (
        <>
          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard title="Today" stats={cards.today} />
            <StatCard title="Yesterday" stats={cards.yesterday} />
            <StatCard title="This Week" stats={cards.thisWeek} />
            <StatCard title="This Month" stats={cards.thisMonth} />
          </div>

          {/* Grouped by Game */}
          <div className="bg-gray-900 rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Revenue by Game</h2>
            <GroupedChart data={byGame} />
          </div>

          {/* Line Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900 rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4">
                Daily Revenue (This Month)
              </h2>
              <LineChart data={daily} label="date" />
            </div>

            <div className="bg-gray-900 rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4">
                Weekly Revenue (Last 4 Weeks)
              </h2>
              <LineChart data={weekly} label="weekStart" />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Revenue;
