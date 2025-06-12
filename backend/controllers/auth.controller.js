const moment = require("moment");
const crypto = require("crypto");
const User = require("../models/User");
const UserChild = require("../models/UserChild");
const UserActivityNotification = require("../models/UserActivityNotification");
const Transaction = require("../models/Transaction");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const transporter = require("../config/mail");
require("dotenv").config();

// Function to generate a unique entity
const generateUniqueMemberUID = async () => {
  let uid;
  let exists = true;

  while (exists) {
    uid = "MEMBER-" + Math.random().toString(36).substr(2, 9).toUpperCase(); // Example: ENT-X9G3A7J
    exists = await User.findOne({ uid });
  }

  return uid;
};
// ⏳ Rate Limiting (Max 10 requests per 1 min)
const getUsersLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { error: "Too many requests, please try again later." },
});
const date = new Date();
const formatted = date.toLocaleString("en-US", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});
const getIp = (req) => {
  return (
    req.headers["x-forwarded-for"]?.split(",").shift() || // behind proxy
    req.socket?.remoteAddress ||
    req.connection?.remoteAddress
  );
};

const generateInviteCode = (uid) => {
  const cleanUid = uid.replace(/^MEMBER-/, ""); // Remove "MEMBER-" prefix if present
  const last4Timestamp = Date.now().toString().slice(-4); // Get last 4 digits of current timestamp
  return cleanUid + last4Timestamp;
};
// @desc Register User
// @route POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { email, phone, password, inviteCode } = req.body;
    const { authBy } = req.query;
    const ipAddress = getIp(req);

    if (!email && !phone) {
      return res
        .status(400)
        .json({ message: "Please provide either an email or phone number" });
    }

    let user;
    if (email) {
      user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ message: "Email already in use" });
      }
    } else if (phone) {
      user = await User.findOne({ phone });
      if (user) {
        return res.status(400).json({ message: "Phone Number already in use" });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const uid = await generateUniqueMemberUID();
    const generatedInviteCode = generateInviteCode(uid);

    user = new User({
      authBy,
      email,
      phone,
      totalBalance: 28,
      password: hashedPassword,
      uid,
      registerTimeIP: ipAddress,
      inviteCode: generatedInviteCode,
    });

    // === HANDLE REFERRAL LOGIC ===
    if (inviteCode) {
      const parent = await User.findOne({ inviteCode });

      if (!parent) {
        return res.status(400).json({ message: "Invalid invitation code." });
      }

      const userLevel = parent.level + 1;
      if (userLevel > 6) {
        return res
          .status(400)
          .json({ message: "Referral level limit exceeded (max 6)." });
      }

      user.parentId = parent._id;
      user.parentUID = parent.uid;
      user.level = userLevel;
      await user.save();

      await UserChild.findOneAndUpdate(
        { parentId: parent._id },
        {
          $addToSet: { children: { childId: user._id, childUID: user.uid } },
          $set: { parentUID: parent.uid },
        },
        { upsert: true }
      );
    } else {
      // No invite code provided
      const rootUser = await User.findOne({ level: 1 });
      if (!rootUser) {
        // First-ever user = root
        user.level = 1;
        await user.save();
      } else {
        // Default to placing under root user
        user.parentId = rootUser._id;
        user.parentUID = rootUser.uid;
        user.level = 2;
        await user.save();

        await UserChild.findOneAndUpdate(
          { parentId: rootUser._id },
          {
            $addToSet: { children: { childId: user._id, childUID: user.uid } },
            $set: { parentUID: rootUser.uid },
          },
          { upsert: true }
        );
      }
    }

    // Log user activity
    await UserActivityNotification.create({
      user: user._id,
      category: "activity",
      type: "register",
      title: "Sign Up",
      message:
        "Congratulations on your successful registration. You are now our member! Enjoy our industry-leading gaming platform and earn rewards.",
    });

    res.status(201).json({ success: true, user, uid });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log("Error", error);
  }
};
// @desc Login User
// @route POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    const { authBy } = req.query;

    if (!authBy)
      return res
        .status(400)
        .json({ message: "Please provide authBy as 'email' or 'phone'" });
    if (authBy === "email" && !email)
      return res
        .status(400)
        .json({ message: "Please provide an email address" });
    if (authBy === "phone" && !phone)
      return res.status(400).json({ message: "Please provide a phone number" });

    // Use indexed queries for faster lookup
    const user = await User.findOne(
      authBy === "email" ? { email } : { phone }
    ).lean();
    if (!user) return res.status(400).json({ message: "User Not Found" });

    // ✅ Check user status
    if (user.status !== "active") {
      return res.status(403).json({
        message: `Your account is currently ${user.status}. Contact with Customer Support`,
      });
    }

    // Perform password comparison and JWT generation in parallel
    const [isMatch, token] = await Promise.all([
      bcrypt.compare(password, user.password),
      jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      }),
    ]);

    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // ✅ Get IP and User-Agent
    const ip = getIp(req);
    const userAgent = req.headers["user-agent"];
    const loginAt = new Date();

    // ✅ Fetch and update loginHistory manually (last 3 entries only)
    const existingUser = await User.findById(user._id).select("loginHistory");
    const newLogin = { ip, userAgent, loginAt };

    let updatedHistory = existingUser.loginHistory || [];
    if (updatedHistory.length >= 3) {
      updatedHistory = updatedHistory.slice(1); // Remove the oldest entry
    }
    updatedHistory.push(newLogin);

    await User.findByIdAndUpdate(user._id, { loginHistory: updatedHistory });

    // Log user activity asynchronously (doesn't delay response)
    await UserActivityNotification.create({
      user: user._id,
      category: "activity",
      type: "login",
      title: "Login Notification",
      message: `Your account was logged in at ${formatted}. If this wasn't you, contact support.`,
    }).catch(console.error);

    // Set HTTP-only cookie
    res.cookie("token", token, { httpOnly: true });

    return res.json({ success: true, token, role: user.role, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
// Get All Users (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      search,
      sortBy = "createdAt",
      order = "desc",
      status,
    } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    // Search & Filters
    const query = {};
    // if (search) {
    //   query.email = new RegExp(search, "i"); // Case-insensitive search by email
    // }
    if (search) {
      query.$or = [
        { email: new RegExp(search, "i") },
        { uid: new RegExp(search, "i") },
        { phone: new RegExp(search, "i") },
      ];
    }
    if (status) {
      query.status = status;
    }

    // Sorting
    const sortOrder = order === "asc" ? 1 : -1;

    // Fetch Users with Pagination
    const users = await User.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("-password"); // Exclude sensitive fields

    const totalUsers = await User.countDocuments(query);

    res.json({
      success: true,
      message: "All User fetched successfully",
      totalUsers: totalUsers || 0,
      totalPages: Math.ceil(totalUsers / limit) || 1,
      currentPage: page,
      users,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getAllUsers2 = async (req, res) => {
  try {
    const users = await User.find({}, "_id uid name email"); // select only needed fields
    res.json({ users });
  } catch (error) {
    // console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
// Get Total Users (Admin) count
exports.getUsersStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    res.status(200).json({ success: true, totalUsers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Get User Growth (Admin)
exports.getUserGrowth = async (req, res) => {
  try {
    // Get total users
    const totalUsers = await User.countDocuments();

    // Get user registrations grouped by month
    const userGrowthData = await User.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" }, // Group by month of registration
          totalUsers: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 }, // Sort by month (Jan -> Dec)
      },
    ]);

    // Convert numeric months to names
    const userGrowth = {};
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    let cumulativeUsers = 0; // To track cumulative growth

    userGrowthData.forEach(({ _id, totalUsers }) => {
      cumulativeUsers += totalUsers;
      userGrowth[monthNames[_id - 1]] = cumulativeUsers; // Convert month number to name
    });

    res.status(200).json({
      success: true,
      totalUsers, // Add total user count
      userGrowth,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Update Any User Profile (Admin)
exports.updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params; // Get user ID from URL
    const selectedUser = req.body; // New user data

    // Find the user by ID
    let user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // If password is being updated, hash it
    if (selectedUser.password) {
      const salt = await bcrypt.genSalt(10);
      selectedUser.password = await bcrypt.hash(selectedUser.password, salt);
    }

    // console.log(user, "ab", selectedUser);
    // Merge new data with existing user data
    Object.assign(user, selectedUser);

    // Save updated user
    await user.save();

    res.json({
      success: true,
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// Delete a user from DB (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// @desc Get User Profile
// @route GET /api/auth/profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
// Get User's Profile (Admin)
exports.getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
// Put Update User Profile Status (Admin)
exports.updateUserProfileStatus = async (req, res) => {
  const { status, statusRemarks } = req.body;

  if (!["active", "suspended", "banned"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value." });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status, statusRemarks },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found." });

    // Optionally: Send notification to user here

    res.json({ message: `User status updated to ${status}.`, user });
  } catch (error) {
    res.status(500).json({ message: "Error updating status." });
  }
};

// @desc Logout User
// @route GET /api/auth/logout
exports.logout = async (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};
exports.updateMemberAvatar = async (req, res) => {
  try {
    const { avatar } = req.body; // Get avatar from request body
    const userId = req.user.id; // Get user ID from auth middleware

    if (!avatar) {
      return res.status(400).json({ message: "Avatar URL is required" });
    }

    // Update user's avatar in the database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatar },
      { new: true, select: "avatar" }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Avatar updated successfully",
      avatar: updatedUser.avatar,
    });
  } catch (error) {
    console.error("Error updating avatar:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
// if user has email then add phone and vice versa
// @desc Update user contact info (add phone if email exists, add email if phone exists)
// @route PUT /api/user/update-contact
// @access Private (requires authentication)
exports.updateUserContact = async (req, res) => {
  try {
    const { email, phone } = req.body;
    const userId = req.user.id; // Extract user ID from auth middleware

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user already has both email and phone
    if (user.email && user.phone) {
      return res
        .status(400)
        .json({ message: "User already has email and phone" });
    }

    // Validate uniqueness before updating
    if (email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = email;
    }

    if (phone) {
      const phoneExists = await User.findOne({ phone });
      if (phoneExists) {
        return res.status(400).json({ message: "Phone number already in use" });
      }
      user.phone = phone;
    }

    // Save updated user
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "User contact info updated", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
exports.updataMemberNickname = async (req, res) => {
  try {
    const { nickName } = req.body;
    const userId = req.user.id;

    if (!nickName) {
      return res.status(400).json({ message: "Nickname is required" });
    }

    // Update nickname in the database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { nickName },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Nickname updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
// @desc Change User Password
// @route POST /api/auth/change-password
// @access Private (Authenticated User)
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id; // Extract user ID from auth middleware

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare the current password with stored hashed password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in database
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
// forget password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiry
    await user.save();

    const resetURL = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    const mailOptions = {
      to: user.email,
      subject: "Password Reset Request",
      text: `You requested a password reset. Click the link to reset your password: ${resetURL}`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Password reset email sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
// reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: "Password reset successful. You can now log in." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
exports.updateWithdrawalPassword = async (req, res) => {
  try {
    const { oldWithdrawalPassword, newWithdrawalPassword } = req.body;
    const userId = req.user.id;

    // Validate new password
    if (!newWithdrawalPassword || newWithdrawalPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Withdrawal password must be at least 6 characters" });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If user already has a withdrawal password, require old password to update
    if (user.withdrawalPasswordStatus) {
      if (!oldWithdrawalPassword) {
        return res
          .status(400)
          .json({ message: "Old withdrawal password is required to update" });
      }

      // Verify old password
      const isMatch = await bcrypt.compare(
        oldWithdrawalPassword,
        user.withdrawalPassword
      );
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Old withdrawal password is incorrect" });
      }
    }

    // Hash new withdrawal password
    const hashedPassword = await bcrypt.hash(newWithdrawalPassword, 10);

    // Update withdrawal password
    user.withdrawalPassword = hashedPassword;
    user.withdrawalPasswordStatus = true; // Mark as set
    await user.save();

    res.status(200).json({
      success: true,
      message: user.withdrawalPasswordStatus
        ? "Withdrawal password updated successfully"
        : "Withdrawal password set successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
exports.resetWithdrawalPassword = async (req, res) => {
  try {
    const { newWithdrawalPassword } = req.body;
    const userId = req.user.id;

    if (!newWithdrawalPassword || newWithdrawalPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Withdrawal password must be at least 6 characters" });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash the new withdrawal password
    const hashedPassword = await bcrypt.hash(newWithdrawalPassword, 10);

    // Update user withdrawal password
    user.withdrawalPassword = hashedPassword;
    user.withdrawalPasswordStatus = true; // Mark as set
    await user.save();

    res.status(200).json({
      success: true,
      message: "Withdrawal password reset successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
exports.validateWithdrawalPassword = async (req, res) => {
  try {
    const { withdrawalPassword } = req.body;
    const userId = req.user.id;

    if (!withdrawalPassword) {
      return res
        .status(400)
        .json({ message: "Withdrawal password is required" });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user has set a withdrawal password
    if (!user.withdrawalPasswordStatus) {
      return res.status(400).json({ message: "Withdrawal password not set" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(
      withdrawalPassword,
      user.withdrawalPassword
    );
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect withdrawal password" });
    }

    res.status(200).json({
      success: true,
      message: "Withdrawal password is correct",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
