const mongoose = require("mongoose");

const financeAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // Reference to User
    methodDetails: {
      bank: { label: String, value: String },
      cardholderName: String,
      accountNumber: String,
      ifscCode: String,
      email: String,
      phone: String,
      state: String,
      city: String,
      branch: String,
      walletAddress: String,
      walletType: { label: String, value: String },
      usdtWalletAddress: String,
      usdtType: { label: String, value: String },
    },
  },
  { timestamps: true }
);

const FinanceAccount = mongoose.model(
  "UserFinanceDetail",
  financeAccountSchema
);
module.exports = FinanceAccount;
