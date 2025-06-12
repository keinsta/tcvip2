const User = require("../models/User");
const UserActivityNotification = require("../models/UserActivityNotification");

// @desc Reward user for app download
// @route POST /api/user/download-reward
// @access Private
exports.downloadReward = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.downloadRewardClaimed) {
      return res.status(400).json({ message: "Reward already Claimed" });
    }

    let rewardAmount = 28;
    user.totalBalance += rewardAmount;
    user.downloadRewardClaimed = true;
    user.downloadRewardClaimedAt = new Date();
    await user.save();

    // Send notification for reward
    await UserActivityNotification.create({
      user: user._id,
      category: "notification",
      type: "reward",
      title: "App Download Reward",
      message: `You've successfully claimed ₹${rewardAmount} for downloading the app!`,
    });

    res.status(200).json({
      success: true,
      message: "40 reward Claimed",
      claimedAmount: rewardAmount,
      claimedAt: user.downloadRewardClaimedAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get app download reward status
// @route GET /api/user/download-reward-status
// @access Private
exports.getDownloadRewardStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      rewardClaimed: user.downloadRewardClaimed,
      claimedAt: user.downloadRewardClaimedAt || null,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
