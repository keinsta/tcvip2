const UserActivityNotification = require("../models/UserActivityNotification");
const UserGift = require("../models/UserGifts");
const User = require("../models/User");
const transporter = require("../config/mail");

// Gifts
// get use gift history
exports.getAllUserGifts = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch all gifts for the user
    const gifts = await UserGift.find({ claimedBy: userId }).sort({
      createdAt: -1,
    });

    // Update expired gifts if necessary
    const updatedGifts = await Promise.all(
      gifts.map(async (gift) => {
        if (!gift.isClaimed && new Date() > new Date(gift.expiresAt)) {
          gift.status = "expired";
          await gift.save();
        }
        return gift;
      })
    );

    res.status(200).json({ success: true, gifts: updatedGifts });
  } catch (error) {
    console.error("Error fetching user gifts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Generate and Send Gift Code (Admin or Automated System)
exports.generateGiftCode = async (req, res) => {
  try {
    const { userId, rewardAmount } = req.body;

    // Generate a unique 8-character gift code
    const code = Math.random().toString(36).substr(2, 8).toUpperCase();

    // Set expiration (5 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 5);

    // Create the gift code in the database
    await UserGift.create({
      code,
      rewardAmount,
      expiresAt,
      userId,
      isClaimed: false,
    });

    // Find user to send the email
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Email details
    const mailOptions = {
      to: user.email,
      subject: "🎁 You've Received a Gift!",
      text: `Congratulations! 🎉 You have received a special gift.  
Use the following code to redeem your gift: **${code}**  
This code will expire on **${expiresAt.toDateString()}**.  
Redeem it soon and enjoy your reward! 🚀`,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    await UserActivityNotification.create({
      user: userId,
      category: "notification",
      type: "general",
      title: "Gift Reward",
      message:
        "Congratulations! You have received a gift reward. Check your email account to see your bonus.",
    }).catch(console.error);

    res
      .status(200)
      .json({ success: true, message: "Gift code sent successfully" });
  } catch (error) {
    console.error("Error generating gift code:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// User to redeem Gift
exports.redeemGift = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;

    // Find the gift by code
    const redeemCode = await UserGift.findOne({ code });

    if (!redeemCode) {
      return res.status(400).json({ message: "Invalid or Expired Code" });
    }

    // Check if the gift has expired
    if (new Date() > new Date(redeemCode.expiresAt)) {
      redeemCode.status = "expired";
      await redeemCode.save();
      return res.status(400).json({ message: "Code has expired" });
    }

    // Check if the gift is already claimed
    if (redeemCode.isClaimed) {
      return res.status(400).json({ message: "Code already used" });
    }

    // Update user balance
    const user = await User.findById(userId);
    user.totalBalance += redeemCode.rewardAmount;
    await user.save();

    // Update gift status
    redeemCode.isClaimed = true;
    redeemCode.claimedBy = userId;
    redeemCode.claimedAt = new Date();
    redeemCode.status = "redeemed";
    await redeemCode.save();

    res
      .status(200)
      .json({ success: true, message: "Gift Redeemed successfully" });
  } catch (error) {
    console.error("Error redeeming gift:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Notifications
// @desc Get user notifications
// @route GET /api/notifications
exports.getNotifications = async (req, res) => {
  try {
    const { userId, type, isRead } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Build query filters
    let filter = { user: userId };
    if (type) filter.type = type;
    if (isRead !== undefined) filter.isRead = isRead === "true";

    // Fetch notifications
    const notifications = await UserActivityNotification.find(filter)
      .sort({ createdAt: -1 }) // Sort by latest notifications
      .limit(50); // Limit the number of notifications retrieved

    res.json({ success: true, notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Mark a single notification as read
// @route   PATCH /api/notifications/mark-as-read/:id
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await UserActivityNotification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ success: true, notification });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Mark all notifications as read for a user
// @route   PATCH /api/notifications/mark-all-as-read
// @access  Private
exports.markAllRead = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    await UserActivityNotification.updateMany(
      { user: userId, isRead: false },
      { isRead: true }
    );

    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ message: "Server error" });
  }
};
