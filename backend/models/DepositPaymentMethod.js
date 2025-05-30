const mongoose = require("mongoose");

const DetailSchema = new mongoose.Schema({
  accountAddress: String,
  name: String,
  image: String,
  range: String,
  bonus: { type: Boolean, default: false },
  initialDepositAmount: [String],
});

const PaymentMethodSchema = new mongoose.Schema({
  bonus: Number,
  status: { type: String, enum: ["active", "inactive"] },
  bonusStatus: { type: Boolean, default: false },
  type: {
    type: String,
    enum: ["Wallet", "Bank", "USDT"],
    required: true,
  },
  details: [DetailSchema],
});

module.exports = mongoose.model("DepositPaymentMethod", PaymentMethodSchema);
