const mongoose = require("mongoose");

const K3GameRoundSchema = new mongoose.Schema({
  roundId: { type: String, required: true, unique: true },
  mode: { type: String, enum: ["30s", "1min", "3min", "5min"], required: true },

  diceResult: {
    type: [Number],
    validate: [(arr) => arr.length === 3, "Must contain exactly 3 dice values"],
  },
  oddEven: { type: String, enum: ["Odd", "Even"] },
  bigSmall: { type: String, enum: ["Big", "Small"] },

  sum: { type: Number, min: 3, max: 18 },

  bets: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      result: {
        type: String,
        enum: ["Won", "Lose", "Pending"],
        default: "Pending",
      },
      betAmount: { type: Number, required: true },

      // Actual bet type
      betType: {
        type: String,
        enum: [
          "Sum",
          "SingleDice",
          "DoubleDice",
          "Triple",
          "TwoDiceCombination",
        ],
      },

      // The user-selected value for the betType
      betValue: mongoose.Schema.Types.Mixed, // e.g., 12, 1, [1, 1], [1,3], 6, etc.

      // Optional: User prediction about sum categories
      betOddEven: {
        type: String,
        enum: ["Odd", "Even", "None", "none"],
        default: "None",
      },
      betBigSmall: {
        type: String,
        enum: ["Big", "Small", "None", "none"],
        default: "None",
      },

      winningAmount: { type: Number, default: 0 },
    },
  ],

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("K3Game", K3GameRoundSchema);
