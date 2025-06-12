const express = require("express");
const router = express.Router();
const { getUserBetHistory } = require("../controllers/bets.controller");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware");

router.get("/get-user-bet-history/:userId", authMiddleware, getUserBetHistory);

module.exports = router;
