const Feedback = require("../models/Feedback");

exports.getAllFeedbacks = async (req, res) => {
  try {
    const userId = req.user.id;
    const feedbacks = await Feedback.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, feedbacks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.addFeedback = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, description } = req.body;

    if (!type || !description) {
      return res
        .status(400)
        .json({ message: "Type and Description are required" });
    }

    const feedback = new Feedback({ userId, type, description });
    await feedback.save();

    res
      .status(201)
      .json({ success: true, message: "Feedback Submitted Successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Feedbacks (Admin View) with Pagination
exports.getAllFeedbacksAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // default page = 1
    const limit = parseInt(req.query.limit) || 10; // default limit = 10
    const skip = (page - 1) * limit;

    const [feedbacks, totalCount] = await Promise.all([
      Feedback.find()
        .populate("userId", "nickName email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Feedback.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      feedbacks,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Acknowledge a Feedback
exports.acknowledgeFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    feedback.acknowledged = true;
    await feedback.save();

    res.status(200).json({ success: true, message: "Feedback acknowledged" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
