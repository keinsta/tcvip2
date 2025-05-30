const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const {
  getAllFeedbacks,
  addFeedback,
} = require("../controllers/feedback.controller");

router.get("/get-all-feedbacks", authMiddleware, getAllFeedbacks);
router.post("/add-feedback", authMiddleware, addFeedback);

module.exports = router;
