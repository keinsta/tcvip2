const mongoose = require("mongoose");

const commissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sendBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    amount: { type: Number, required: true },
    status: {
      type: String,
      required: true,
      enum: ["Pending", "Completed", "Cancelled"],
      default: "Pending",
    },
    remarks: { type: String, default: "" }, // for admin or user-facing notes
    transactionId: { type: String, unique: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Commission", commissionSchema);
