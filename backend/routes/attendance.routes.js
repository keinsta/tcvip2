const express = require("express");
const attendance = require("../controllers/attendance.controller");
const { authMiddleware } = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/:userId", authMiddleware, attendance.getAttendanceStatus);
router.post("/:userId", authMiddleware, attendance.markAttendance);

module.exports = router;
