const User = require("../models/User");

exports.getAttendanceStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const today = new Date().toDateString();
    const lastDate = user.lastAttendedDate?.toDateString();

    res.json({
      consecutiveDays: user.consecutiveDays || 0,
      attendedToday: lastDate === today,
      totalReward: user.attendanceBonus || 0,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching attendance", error: err });
  }
};

exports.markAttendance = async (req, res) => {
  try {
    const rewards = [5, 10, 15, 20, 25, 30, 50];
    const user = await User.findById(req.params.userId);
    const today = new Date().toDateString();
    const lastDate = user.lastAttendedDate?.toDateString();

    if (lastDate === today) {
      return res.status(400).json({ message: "Already marked today" });
    }

    let newConsecutiveDays = 1;
    if (
      user.lastAttendedDate &&
      new Date(user.lastAttendedDate).getDate() ===
        new Date(new Date().setDate(new Date().getDate() - 1)).getDate()
    ) {
      newConsecutiveDays = user.consecutiveDays + 1;
    }

    const reward = rewards[Math.min(newConsecutiveDays - 1, 6)];

    user.consecutiveDays = newConsecutiveDays;
    user.attendanceBonus += reward;
    user.totalBalance += reward;
    user.lastAttendedDate = new Date();

    await user.save();

    res.json({
      consecutiveDays: user.consecutiveDays,
      attendedToday: true,
      totalReward: user.attendanceBonus,
      rewardCollected: reward,
    });
  } catch (err) {
    res.status(500).json({ message: "Error marking attendance", error: err });
  }
};
