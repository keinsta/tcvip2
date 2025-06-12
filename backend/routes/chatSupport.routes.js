// routes/upload.js or any router file
const express = require("express");
const router = express.Router();
const upload = require("../config/multerConfig"); // your multer config
const cloudinary = require("../config/cloudinaryConfig"); // your cloudinary config
const ChatSUpport = require("../models/customer-support/ChatSession");
const fs = require("fs");

// Upload image + message
router.post("/message/:userId", upload.single("file"), async (req, res) => {
  try {
    const { message, sender } = req.body;
    const { userId } = req.params;
    let fileUrl = null;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      fileUrl = result.secure_url;
    }

    let chat = await ChatSUpport.findOne({ userId });
    if (!chat) {
      chat = new Chat({ userId, messages: [] });
    }

    chat.messages.push({ sender, message, fileUrl });
    await chat.save();

    res.status(200).json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all user chats
router.get("/all", async (req, res) => {
  const chats = await ChatSUpport.find({}, { userId: 1 });
  res.json(chats);
});

// Get chat by user
router.get("/:userId", async (req, res) => {
  const chat = await ChatSUpport.findOne({ userId: req.params.userId });
  res.json(chat || { messages: [] });
});

router.get("/chat/:userId/download", async (req, res) => {
  const chat = await ChatSUpport.findOne({ userId: req.params.userId });
  if (!chat) return res.status(404).send("No chat found");
  res.setHeader("Content-Disposition", "attachment; filename=chat.json");
  res.json(chat.messages);
});
module.exports = router;
