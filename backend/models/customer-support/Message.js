const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  chatSessionId: { type: mongoose.Schema.Types.ObjectId, ref: "ChatSession" },
  sender: { type: String, enum: ["user", "admin"] },
  content: String,
  fileUrl: String,
  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model("Message", messageSchema);
