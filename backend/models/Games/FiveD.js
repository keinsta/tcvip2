const mongoose = require("mongoose");

const BetSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  position: String, // A–E or SUM
  type: String, // Number, Big, Small, etc.
  number: Number,
  amount: Number,
  contractAmount: Number,
  originalAmount: Number,
  won: Boolean,
  payout: Number,
});

const FiveDGameRoundSchema = new mongoose.Schema({
  roundId: String,
  mode: String,
  drawTime: Date,
  drawResult: {
    fullNumber: String,
    A: Number,
    B: Number,
    C: Number,
    D: Number,
    E: Number,
    sum: Number,
    bigSmall: { type: String, enum: ["Big", "Small"] },
    oddEven: { type: String, enum: ["Odd", "Even"] },
  },
  bets: [BetSchema],
});

module.exports = mongoose.model("FiveDRound", FiveDGameRoundSchema);
