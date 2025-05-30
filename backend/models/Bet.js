const mongoose = require("mongoose");

const betSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // Game Info
  gameName: { type: String, required: true }, // e.g. "WinGo", "K3", "5D"
  mode: { type: String }, // e.g. "30s", "1min"
  roundId: { type: String, required: true },

  // Bet Info
  betAmount: { type: Number, required: true },
  betColor: { type: String, enum: ["Red", "Green", "Purple"], default: null },
  betCategory: { type: String, enum: ["Big", "Small"], default: null },
  betNumber: { type: Number, min: 0, max: 9, default: null },

  // Outcome
  result: { type: String, enum: ["Won", "Lose", "Lost"], required: true },
  payoutAmount: { type: Number, default: 0 }, // Final amount after win
  winningPrice: { type: Number, default: 0 }, // Total amount user gets if win

  // System Info
  serviceFee: { type: Number, default: 0 }, // 2% of betAmount
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Bet", betSchema);
