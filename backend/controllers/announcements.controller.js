const Announcement = require("../models/Announcements");

exports.createAnnouncement = async (req, res) => {
  try {
    const { icon, content, date, time, userIds = [] } = req.body;
    const announcement = new Announcement({
      icon,
      content,
      date,
      time,
      userIds, // Empty array means send to all
    });

    await announcement.save();
    res
      .status(201)
      .json({ success: true, message: "Announcement created", announcement });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
exports.getAllAnnouncements = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 5;
    const skip = (page - 1) * pageSize;

    const total = await Announcement.countDocuments();
    const announcements = await Announcement.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    res.status(200).json({
      success: true,
      announcements,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteAnnouncement = async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Announcement deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
exports.getAnnouncementsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const announcements = await Announcement.find({
      $or: [
        { userIds: { $exists: false } }, // for safety
        { userIds: { $size: 0 } }, // broadcast to all
        { userIds: userId }, // specific to this user
      ],
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, announcements });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
