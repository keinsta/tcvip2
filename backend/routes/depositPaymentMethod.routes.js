const express = require("express");
const router = express.Router();
const upload = require("../config/multerConfig");
const {
  createDepositPaymentMethod,
  getAllDepositPaymentMethods,
  getDepositPaymentMethod,
  updateDepositPaymentMethod,
  deleteDepositPaymentMethod,
  addDetailsToDepositPaymentMethod,
  updateDetailsInDepositPaymentMethod,
  deleteDepositPaymentMethodOption,
} = require("../controllers/depositPaymentMethods.controller");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware");

router.post(
  "/add-method",
  upload.single("image"),
  authMiddleware,
  adminMiddleware,
  createDepositPaymentMethod
);

// Admin Side
// User Side
router.get("/get-all-methods", authMiddleware, getAllDepositPaymentMethods);
router.get(
  "/get-method/:id",
  authMiddleware,
  adminMiddleware,
  getDepositPaymentMethod
);
router.put(
  "/update-method/:id",
  upload.single("image"),
  authMiddleware,
  adminMiddleware,
  updateDepositPaymentMethod
);

router.post(
  "/add-details-to-deposit-payment-method/:methodId/details",
  upload.single("image"),
  authMiddleware,
  adminMiddleware,
  addDetailsToDepositPaymentMethod
);

router.put(
  "/update-details-of-method/:methodId/:detailId",
  upload.single("image"),
  authMiddleware,
  adminMiddleware,
  updateDetailsInDepositPaymentMethod
);
router.delete(
  "/delete-method/:id",
  authMiddleware,
  adminMiddleware,
  deleteDepositPaymentMethod
);

router.delete(
  "/delete-method-option/:methodId/details/:detailId",
  authMiddleware,
  adminMiddleware,
  deleteDepositPaymentMethodOption
);

module.exports = router;
