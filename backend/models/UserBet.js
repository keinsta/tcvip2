const mongoose = require("mongoose");

const UserBetSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    game: { type: mongoose.Schema.Types.ObjectId, ref: "Game", required: true },

    gameMode: { type: String },
    betAmount: { type: Number },
    betType: { type: String },

    status: {
      type: String,
      enum: ["pending", "won", "lost"],
      default: "pending",
    }, // Status of the bet

    winnings: { type: Number, default: 0 }, // Amount won if any
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserBet", UserBetSchema);
