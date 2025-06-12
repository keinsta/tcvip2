const express = require("express");

const {
  getNotifications,
  markAsRead,
  markAllRead,
  getAllUserGifts,
  redeemGift,
  generateGiftCode,
} = require("../controllers/userActivities.controller");

const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware");

const router = express.Router();

// for notifications
router.get("/notify/get-notifications", authMiddleware, getNotifications);
router.patch("/notify/mark-as-read/:id", authMiddleware, markAsRead);
router.patch("/notify/mark-all-read", authMiddleware, markAllRead);

// for user gifts
router.get("/gifts/get-all-user-gifts", authMiddleware, getAllUserGifts);
router.post("/gifts/generate-gift-code", authMiddleware, generateGiftCode); // for admin
router.post("/gifts/redeem-gift", authMiddleware, redeemGift);

module.exports = router;
