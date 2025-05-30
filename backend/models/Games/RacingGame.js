const mongoose = require("mongoose");

const CarRaceGameSchema = new mongoose.Schema({
  roundId: { type: String, required: true, unique: true },
  mode: {
    type: String,
    enum: ["30s", "1min", "3min", "5min"],
    required: true,
  },

  rankings: {
    type: [Number], // [1st, 2nd, 3rd, ..., 10th]
    required: true,
  },
  firstPlace: { type: Number, required: true },
  oddEven: { type: String, enum: ["Odd", "Even"], required: true },
  bigSmall: { type: String, enum: ["Big", "Small"], required: true },

  bets: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      betAmount: { type: Number, required: true },
      betValue: { type: String, required: false }, // Optional for rank bets
      oddEven: { type: String, enum: ["Odd", "Even"], required: false }, // Optional for oddEven bets
      bigSmall: { type: String, enum: ["Big", "Small"], required: false }, // Optional for bigSmall bets
      result: {
        type: String,
        enum: ["Won", "Lose", "Pending"],
        default: "Pending",
      },
      payoutAmount: { type: Number, default: 0 }, // Actual reward based on odds
      winningPrice: { type: Number, default: 0 }, // Same as payoutAmount (optional duplicate)
    },
  ],

  createdAt: { type: Date, default: Date.now },
});

CarRaceGameSchema.index({ roundId: 1, mode: 1 }); // For fast querying

module.exports = mongoose.model("CarRaceGame", CarRaceGameSchema);
