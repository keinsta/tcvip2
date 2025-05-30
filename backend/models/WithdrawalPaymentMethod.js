// models/WithdrawalMethod.js
const mongoose = require("mongoose");

const withdrawalPaymentMethodSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Bank", "Wallet", "USDT"],
      required: true,
    },
    value: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
    withdrawalFee: {
      type: Number,
      default: 0, // percentage or flat amount depending on your use case
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "WithdrawalPaymentMethod",
  withdrawalPaymentMethodSchema
);
