const express = require("express");
const router = express.Router();
const {
  createWithdrawalPaymentMethod,
  getAllWithdrawalPaymentMethods,
  updateWithdrawalPaymentMethod,
  toggleWithdrawalPaymentMethodStatus,
  deleteWithdrawalPaymentMethod,
} = require("../controllers/withdrawalPaymentMethods.controller");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware");

router.get(
  "/get-all-methods-by-type",
  authMiddleware,
  getAllWithdrawalPaymentMethods
);
router.post(
  "/add-new-method",
  authMiddleware,
  adminMiddleware,
  createWithdrawalPaymentMethod
);
router.put(
  "/update-method/:id",
  authMiddleware,
  adminMiddleware,
  updateWithdrawalPaymentMethod
);
router.patch(
  "/toggle-method-status/:id",
  authMiddleware,
  adminMiddleware,
  toggleWithdrawalPaymentMethodStatus
);

router.delete(
  "/delete-method/:id",
  authMiddleware,
  adminMiddleware,
  deleteWithdrawalPaymentMethod
);

module.exports = router;
