// models/Announcement.js
const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
  icon: { type: String, default: "🔔" },
  content: { type: String, required: true }, // HTML formatted string
  date: { type: String }, // e.g. March 5, 2025
  time: { type: String }, // e.g. 10:30 AM
  createdAt: { type: Date, default: Date.now },
  userIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // optional
});

module.exports = mongoose.model("Announcement", announcementSchema);
