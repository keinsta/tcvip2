const express = require("express");
const router = express.Router();
const ChatSession = require("../models/ChatSession");
const ChatSessionMessage = require("../models/ChatSessionMessage");

// Create or fetch session
router.post("/session", async (req, res) => {
  const { userId } = req.body;
  let session = await ChatSession.findOne({ userId, isResolved: false });
  if (!session) {
    session = await ChatSession.create({ userId });
  }
  res.json(session);
});

// Get messages
router.get("/messages/:sessionId", async (req, res) => {
  const messages = await ChatSessionMessage.find({
    chatSessionId: req.params.sessionId,
  }).sort({ createdAt: 1 });
  res.json(messages);
});

// Export chat history
router.get("/export/:sessionId", async (req, res) => {
  const messages = await ChatSessionMessage.find({
    chatSessionId: req.params.sessionId,
  });
  const data = messages
    .map((m) => `[${m.createdAt}] ${m.senderType.toUpperCase()}: ${m.message}`)
    .join("\n");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="chat-history.txt"'
  );
  res.setHeader("Content-Type", "text/plain");
  res.send(data);
});

module.exports = router;
