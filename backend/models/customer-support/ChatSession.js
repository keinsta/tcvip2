// backend/models/Chat.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
  fileUrl: String,
});

const chatSchema = new mongoose.Schema(
  {
    userId: String,
    messages: [messageSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatSupport", chatSchema);
