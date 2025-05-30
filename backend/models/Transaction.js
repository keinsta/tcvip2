const mongoose = require("mongoose");
const transactionTypes = require("../config/transactionTypes");

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userIP: {
      type: String,
      default: null,
    },

    type: {
      type: String,
      required: true,
      enum: transactionTypes,
    },

    amount: { type: Number, required: true },

    status: {
      type: String,
      required: true,
      enum: ["Pending", "Completed", "Cancelled"],
      default: "Pending",
    },

    method: {
      type: String,
      required: true,
      enum: ["USDT", "Wallet", "Bank Card", "Bank"],
    },

    paymentOption: {
      type: String,
      require: true,
    },

    methodDetails: {
      type: mongoose.Schema.Types.Mixed, // Dynamic object based on method
      default: {},
    },
    remarks: { type: String, default: "" }, // for admin or user-facing notes
    isDeleted: { type: Boolean, default: false },

    transactionId: { type: String, unique: true },

    // createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Transaction", transactionSchema);
