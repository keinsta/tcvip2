const express = require("express");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware");
const {
  getUserFinanceDetails,
  addOrUpdateFinanceDetails,
} = require("../controllers/userFinance.controller");
const router = express.Router();

router.get("/get-user-finance-details", authMiddleware, getUserFinanceDetails);
router.post(
  "/update-user-finance-details",
  authMiddleware,
  addOrUpdateFinanceDetails
);

module.exports = router;
