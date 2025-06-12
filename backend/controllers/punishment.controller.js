const Punishment = require("../models/Punishment");

exports.createPunishment = async (req, res) => {
  try {
    const { userId, reason, remarks, issuedBy } = req.body;

    const punishment = await Punishment.create({
      userId,
      reason,
      remarks,
      issuedBy,
      isResolved: false,
    });

    res.status(201).json({ success: true, punishment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllPunishments = async (req, res) => {
  try {
    const punishments = await Punishment.find().populate(
      "userId",
      "username email"
    );
    res.json({ success: true, punishments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
exports.resolvePunishment = async (req, res) => {
  try {
    const { id } = req.params;

    const punishment = await Punishment.findByIdAndUpdate(
      id,
      { isResolved: true },
      { new: true }
    );

    if (!punishment)
      return res.status(404).json({ success: false, message: "Not found" });

    res.json({ success: true, punishment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// controllers/punishmentController.js
exports.getPunishmentsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const punishments = await Punishment.find({ userId }).sort({
      createdAt: -1,
    });

    res.json({ success: true, punishments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
