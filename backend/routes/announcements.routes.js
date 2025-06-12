const express = require("express");
const router = express.Router();
const announcements = require("../controllers/announcements.controller");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware");

router.get(
  "/all",
  authMiddleware,
  //   adminMiddleware,
  announcements.getAllAnnouncements
);
router.get(
  "/user/:userId",
  authMiddleware,
  //   adminMiddleware,
  announcements.getAnnouncementsByUser
);
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  announcements.getAllAnnouncements
);
router.post(
  "/create",
  authMiddleware,
  adminMiddleware,
  announcements.createAnnouncement
);
module.exports = router;
