const express = require("express");
const router = express.Router();
const {
  getTodayStats,
  getYesterdayStats,
  getThisWeekStats,
  getThisMonthStats,
  getAnyMonthStats,
  getStatsByGame,
  getDailyThisMonth,
  getWeeklyStats,
} = require("../controllers/revenue.controller");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware");

// Basic summaries
router.get("/stats/today", authMiddleware, adminMiddleware, getTodayStats);
router.get(
  "/stats/yesterday",
  authMiddleware,
  adminMiddleware,
  getYesterdayStats
);
router.get(
  "/stats/this-week",
  authMiddleware,
  adminMiddleware,
  getThisWeekStats
);
router.get(
  "/stats/this-month",
  authMiddleware,
  adminMiddleware,
  getThisMonthStats
);
router.get(
  "/stats/month/:year/:month",
  authMiddleware,
  adminMiddleware,
  getAnyMonthStats
);

// Grouped stats
router.get("/stats/by-game", authMiddleware, adminMiddleware, getStatsByGame);
router.get(
  "/stats/daily-this-month",
  authMiddleware,
  adminMiddleware,
  getDailyThisMonth
);
router.get("/stats/weekly", authMiddleware, adminMiddleware, getWeeklyStats);

module.exports = router;
