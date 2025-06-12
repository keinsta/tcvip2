const UserFinanceDetail = require("../models/UserFinanceDetail");
const User = require("../models/User"); // Import the User model

// Deep merge function to update nested objects without overwriting unrelated fields
const deepMerge = (target, source) => {
  for (const key in source) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      if (!target[key]) {
        target[key] = {};
      }
      deepMerge(target[key], source[key]); // Recursively merge nested objects
    } else {
      target[key] = source[key]; // Directly update primitive values
    }
  }
  return target;
};

// Get user finance details (Admin and User)
exports.getUserFinanceDetails = async (req, res) => {
  try {
    let userId = "";

    if (req.user.role === "user") {
      userId = req.user.id;
    } else {
      userId = req.query.id;
    }

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Check if user exists using _id
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    const financeDetails = await UserFinanceDetail.findOne({ userId });

    if (!financeDetails) {
      return res.status(404).json({ message: "No finance details found" });
    }

    res.json(financeDetails);
  } catch (error) {
    console.error("Finance fetch error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Add or update user finance details (Merge Instead of Overwriting)
exports.addOrUpdateFinanceDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body.details; // Extract methodDetails from request
    const method = req.body.method;
    // console.log(updates, method);

    // Check if user exists
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    let financeAccount = await UserFinanceDetail.findOne({ userId });

    if (financeAccount) {
      // Merge updates while keeping previous data intact
      financeAccount.methodDetails = deepMerge(
        financeAccount.methodDetails,
        updates
      );
    } else {
      // Create a new entry if it doesn't exist
      financeAccount = new UserFinanceDetail({
        userId,
        methodDetails: updates,
      });
    }

    await financeAccount.save();

    if (["bankCard", "usdt", "wallet"].includes(method)) {
      const updateField = `withdrawalMethodSet.${method}`;
      await User.findByIdAndUpdate(userId, { $set: { [updateField]: true } });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Method Type" });
    }

    res.json({
      success: true,
      message: "Finance details updated successfully",
      financeAccount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Admin updates any user's finance details (Merge Instead of Overwriting)
exports.adminUpdateFinanceDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body.methodDetails; // Extract methodDetails from request

    // Check if user exists
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    let financeAccount = await UserFinanceDetail.findOne({ userId });

    if (!financeAccount) {
      return res
        .status(404)
        .json({ message: "User finance details not found" });
    }

    // Merge updates without losing previous data
    financeAccount.methodDetails = deepMerge(
      financeAccount.methodDetails,
      updates
    );
    await financeAccount.save();

    res.json({
      message: "User finance details updated successfully",
      financeAccount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin gets any user's finance details
exports.adminGetUserFinanceDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    const financeDetails = await UserFinanceDetail.findOne({ userId });

    if (!financeDetails) {
      return res
        .status(404)
        .json({ message: "No finance details found for this user" });
    }
    res.json(financeDetails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
