const express = require("express");
const router = express.Router();
const {
  deposit,
  withdraw,
  updateUserBalance,
  getTransactionHistory,
  approvalDepositWithdrawal,
  getWeeklyTransactionStats,
  getCumulativeFinancialStats,
} = require("../controllers/transactions.controller");

const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware");

router.post("/update-user-balance", authMiddleware, updateUserBalance);

router.post("/deposit", authMiddleware, deposit);
router.post("/withdraw", authMiddleware, withdraw);
router.post(
  "/approvalDepositWithdrawal",
  authMiddleware,
  approvalDepositWithdrawal
);
router.get("/history", authMiddleware, getTransactionHistory);
router.get(
  "/get-transactions-stats",
  authMiddleware,
  adminMiddleware,
  getWeeklyTransactionStats
);

router.get(
  "/get-cumulative-financial-stats",
  authMiddleware,
  adminMiddleware,
  getCumulativeFinancialStats
);

module.exports = router;
