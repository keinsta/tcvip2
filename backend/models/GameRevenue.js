const mongoose = require("mongoose");

const GameRevenueSchema = new mongoose.Schema({
  gameName: { type: String, required: true }, // e.g., "K3", "5D", "Racing"
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Who placed the bet
  userUID: { type: String },
  betAmount: { type: Number, required: true }, // Full bet amount
  serviceFee: { type: Number, required: true }, // 2% of betAmount
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("GameRevenue", GameRevenueSchema);
