const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const {
  downloadReward,
  getDownloadRewardStatus,
} = require("../controllers/downloadReward.controller");

router.get("/download-reward-status", authMiddleware, getDownloadRewardStatus);
router.post("/download-reward", authMiddleware, downloadReward);

module.exports = router;
