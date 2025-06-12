const mongoose = require("mongoose");

const TrxWinGoGameSchema = new mongoose.Schema({
  roundId: { type: String, required: true, unique: true },
  mode: { type: String, enum: ["1min"], required: true },
  drawnNumber: { type: Number },
  color: {
    type: String,
    enum: ["Red", "Blue", "Green", "Purple"],
    // required: true,
  },
  category: { type: String, enum: ["Big", "Small"] },
  tronBlockDetails: [
    {
      hash: String,
      sequentialNumber: Number,
    },
  ],
  bets: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      result: { type: String, enum: ["Won", "Lose", "Pending"] },
      betAmount: { type: Number, required: true },
      betColor: { type: String, enum: ["Red", "Blue", "Green", "Purple"] },
      betCategory: { type: String, enum: ["Big", "Small"] },
      betNumber: { type: Number, min: 0, max: 9 }, // For single number bets
      winningPrice: { type: Number },
      payoutAmount: Number,
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("TrxWinGoGame", TrxWinGoGameSchema);
