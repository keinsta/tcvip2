const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // Reference to User
    type: {
      type: String,
      enum: ["Suggestion", "Function", "Bug", "Other"],
      required: true,
    }, // Feedback Type
    description: { type: String, required: true }, // Feedback Description
    createdAt: { type: Date, default: Date.now }, // Timestamp of Feedback
    acknowledged: { type: Boolean, default: false }, // ✅ NEW FIELD
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", FeedbackSchema);
