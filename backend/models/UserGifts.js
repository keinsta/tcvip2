const mongoose = require("mongoose");

const UserGiftsSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  rewardAmount: { type: Number, required: true },
  type: {
    type: String,
    // required: true,
    enum: [
      "First Deposit Reward",
      "Second Deposit Reward",
      "Third Deposit Reward",
      "App Download Reward",
      "Gift",
    ],
  },
  isClaimed: { type: Boolean, default: false },
  claimedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  claimedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }, // Time when code was created
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  }, // 5 Days Expiry
  status: {
    type: String,
    enum: ["pending", "redeemed", "expired"],
    default: "pending",
  },
});

module.exports = mongoose.model("UserGift", UserGiftsSchema);
