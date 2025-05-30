const mongoose = require("mongoose");

const WinGoGameSchema = new mongoose.Schema({
  roundId: { type: String, required: true, unique: true },
  mode: { type: String, enum: ["30s", "1min", "3min", "5min"], required: true },
  drawnNumber: { type: Number },
  color: {
    type: String,
    enum: ["Red", "Blue", "Green", "Purple"],
    // required: true,
  },
  category: { type: String, enum: ["Big", "Small"] },
  bets: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      result: { type: String, enum: ["Won", "Lose", "Pending"] },
      betAmount: { type: Number, required: true },
      betColor: { type: String, enum: ["Red", "Blue", "Green", "Purple"] },
      betCategory: { type: String, enum: ["Big", "Small"] },
      betNumber: { type: Number, min: 0, max: 9 }, // For single number bets
      winningPrice: { type: Number },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("WinGoGame", WinGoGameSchema);
