const mongoose = require("mongoose");

const UserActivityNotificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: {
      type: String,
      enum: ["activity", "notification"], // Distinguishes between logs and notifications
      required: true,
    },
    type: {
      type: String,
      enum: [
        "login",
        "register",
        "transaction",
        "commission",
        "game",
        "security",
        "general",
        "promotion",
        "reward",
      ],
      required: true,
    },
    title: { type: String }, // Used for notifications
    message: { type: String, required: true }, // Description of activity or notification content
    data: { type: mongoose.Schema.Types.Mixed }, // Additional metadata (e.g., game ID, transaction ID)
    isRead: { type: Boolean, default: false }, // Relevant for notifications
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "UserActivityNotification",
  UserActivityNotificationSchema
);
