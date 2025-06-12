const express = require("express");
const {
  register,
  login,
  getProfile,
  logout,
  updateMemberAvatar,
  changePassword,
  updateUserContact,
  forgotPassword,
  resetPassword,
  updataMemberNickname,
  updateWithdrawalPassword,
  resetWithdrawalPassword,
  validateWithdrawalPassword,
} = require("../controllers/auth.controller");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authMiddleware, getProfile);
router.get("/logout", logout);
router.put("/change-password", authMiddleware, changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.put(
  "/update-withdrawal-password",
  authMiddleware,
  updateWithdrawalPassword
);
router.put(
  "/reset-withdrawal-password",
  authMiddleware,
  resetWithdrawalPassword
);
router.post(
  "/validate-withdrawal-password",
  authMiddleware,
  validateWithdrawalPassword
);
router.put("/update-user-contact", authMiddleware, updateUserContact);
router.put("/update-user-nickname", authMiddleware, updataMemberNickname);
router.put("/update-user-avatar", authMiddleware, updateMemberAvatar);

module.exports = router;
