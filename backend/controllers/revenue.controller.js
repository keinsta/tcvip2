const GameRevenue = require("../models/GameRevenue");

// 🔹 Helper: Get start/end of day
const getDayRange = (daysAgo = 0) => {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  start.setDate(start.getDate() - daysAgo);
  const end = new Date(start);
  end.setUTCHours(23, 59, 59, 999);
  return { start, end };
};

// 🔹 Helper: Start/End of Month
const getMonthRange = (year, month) => {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  return { start, end };
};

// ✅ Today
exports.getTodayStats = async (req, res) => {
  const { start, end } = getDayRange(0);
  const stats = await getStatsBetweenDates(start, end);
  res.json(stats);
};

// ✅ Yesterday
exports.getYesterdayStats = async (req, res) => {
  const { start, end } = getDayRange(1);
  const stats = await getStatsBetweenDates(start, end);
  res.json(stats);
};

// ✅ This Week (Mon–Sun)
exports.getThisWeekStats = async (req, res) => {
  const now = new Date();
  const day = now.getUTCDay();
  const diff = now.getUTCDate() - day + (day === 0 ? -6 : 1); // get Monday
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), diff)
  );
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date();
  end.setUTCHours(23, 59, 59, 999);
  const stats = await getStatsBetweenDates(start, end);
  res.json(stats);
};

// ✅ This Month
exports.getThisMonthStats = async (req, res) => {
  const now = new Date();
  const { start, end } = getMonthRange(
    now.getUTCFullYear(),
    now.getUTCMonth() + 1
  );
  const stats = await getStatsBetweenDates(start, end);
  res.json(stats);
};

// ✅ Any Month: /stats/month/:year/:month
exports.getAnyMonthStats = async (req, res) => {
  const { year, month } = req.params;
  const { start, end } = getMonthRange(parseInt(year), parseInt(month));
  const stats = await getStatsBetweenDates(start, end);
  res.json(stats);
};

// ✅ Grouped by Game
exports.getStatsByGame = async (req, res) => {
  const data = await GameRevenue.aggregate([
    {
      $group: {
        _id: "$gameName",
        totalAmount: { $sum: "$betAmount" },
        totalServiceFee: { $sum: "$serviceFee" },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        gameName: "$_id",
        totalAmount: 1,
        totalServiceFee: 1,
        count: 1,
        _id: 0,
      },
    },
  ]);
  res.json(data);
};

// ✅ Daily Revenue for This Month
exports.getDailyThisMonth = async (req, res) => {
  const now = new Date();
  const { start, end } = getMonthRange(
    now.getUTCFullYear(),
    now.getUTCMonth() + 1
  );

  const data = await GameRevenue.aggregate([
    { $match: { createdAt: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        totalAmount: { $sum: "$betAmount" },
        totalServiceFee: { $sum: "$serviceFee" },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        date: "$_id",
        totalAmount: 1,
        totalServiceFee: 1,
        count: 1,
        _id: 0,
      },
    },
  ]);

  res.json(data);
};

// ✅ Weekly Revenue (last 4 weeks)
exports.getWeeklyStats = async (req, res) => {
  const fourWeeksAgo = new Date();
  fourWeeksAgo.setUTCDate(fourWeeksAgo.getUTCDate() - 28);

  const data = await GameRevenue.aggregate([
    { $match: { createdAt: { $gte: fourWeeksAgo } } },
    {
      $group: {
        _id: {
          $isoWeek: "$createdAt",
        },
        weekStart: { $min: "$createdAt" },
        totalAmount: { $sum: "$betAmount" },
        totalServiceFee: { $sum: "$serviceFee" },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        weekStart: {
          $dateToString: { format: "%Y-%m-%d", date: "$weekStart" },
        },
        totalAmount: 1,
        totalServiceFee: 1,
        count: 1,
        _id: 0,
      },
    },
  ]);

  res.json(data);
};

// 🔁 Shared helper to compute totals in a time range
async function getStatsBetweenDates(start, end) {
  const data = await GameRevenue.aggregate([
    { $match: { createdAt: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$betAmount" },
        totalServiceFee: { $sum: "$serviceFee" },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        totalAmount: 1,
        totalServiceFee: 1,
        count: 1,
      },
    },
  ]);
  return data[0] || { totalAmount: 0, totalServiceFee: 0, count: 0 };
}
