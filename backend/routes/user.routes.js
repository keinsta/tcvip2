const express = require("express");
const User = require("../models/User");
const ChatSession = require("../models/customer-support/ChatSession");
const Message = require("../models/customer-support/Message");
const upload = require("../config/multerConfig");
const cloudinary = require("../config/cloudinaryConfig");

const router = express.Router();

router.post("/session", async (req, res) => {
  const { email } = req.body;
  let user = await User.findOne({ email });
  if (!user) user = await User.create({ email });
  const session = await ChatSession.create({ userId: user._id });
  res.json({ sessionId: session._id });
});

router.get("/:userId/sessions", async (req, res) => {
  const sessions = await ChatSession.find({ userId: req.params.userId }).sort({
    createdAt: -1,
  });
  res.json(sessions);
});

router.get("/session/:sessionId/messages", async (req, res) => {
  const messages = await Message.find({
    chatSessionId: req.params.sessionId,
  }).sort({ createdAt: 1 });
  res.json(messages);
});

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const localPath = req.file.path;
    const result = await cloudinary.uploader.upload(localPath, {
      resource_type: "auto",
    });

    fs.unlinkSync(localPath); // Delete local file

    // Save metadata in DB
    const saved = await Attachment.create({
      name: req.file.originalname,
      url: result.secure_url,
      type: req.file.mimetype,
    });

    return res.status(200).json({ url: saved.url });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Upload failed" });
  }
});

module.exports = router;
