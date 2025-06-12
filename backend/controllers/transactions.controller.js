const moment = require("moment");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const transactionTypes = require("../config/transactionTypes");
const UserActivityNotification = require("../models/UserActivityNotification");

const getIp = (req) => {
  return (
    req.headers["x-forwarded-for"]?.split(",").shift() || // behind proxy
    req.socket?.remoteAddress ||
    req.connection?.remoteAddress
  );
};

const getDateRanges = () => {
  const now = moment();
  return {
    todayStart: now.clone().startOf("day").toDate(),
    todayEnd: now.clone().endOf("day").toDate(),
    yesterdayStart: now.clone().subtract(1, "day").startOf("day").toDate(),
    yesterdayEnd: now.clone().subtract(1, "day").endOf("day").toDate(),
    weekStart: now.clone().startOf("week").toDate(),
    weekEnd: now.clone().endOf("week").toDate(),
    monthStart: now.clone().startOf("month").toDate(),
    monthEnd: now.clone().endOf("month").toDate(),
  };
};

const summarize = (transactions, start, end) => {
  const filtered = transactions.filter(
    (tx) => tx.createdAt >= start && tx.createdAt <= end
  );
  const total = filtered.reduce((sum, tx) => sum + tx.amount, 0);
  return { count: filtered.length, amount: total };
};

exports.deposit = async (req, res) => {
  try {
    const { amount, method, paymentOption, transactionId } = req.body;
    const userId = req.user.id;

    if (!["USDT", "Wallet", "Bank"].includes(method)) {
      return res.status(400).json({ message: "Invalid deposit method" });
    }

    const userIP = getIp(req);

    const transaction = new Transaction({
      userId,
      userIP,
      type: "Deposit",
      amount,
      method,
      paymentOption,
      status: "Pending", // in future can be change after approval
      transactionId,
    });

    await transaction.save();

    await UserActivityNotification.create({
      user: userId,
      category: "notification",
      type: "transaction",
      title: "Deposit Request",
      message: `You request for deposit ₹${amount} via ${method} has been sent.`,
    });

    res.status(200).json({
      success: true,
      message: "Deposit request submitted",
      transaction,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.withdraw = async (req, res) => {
  try {
    const { amount, method, methodDetails } = req.body;
    const userId = req.user.id;

    // 1. Check existing pending withdrawals
    const pendingCount = await Transaction.countDocuments({
      userId,
      type: "Withdrawal", // Assuming this is the correct type in your `transactionTypes`
      status: "Pending",
      isDeleted: false,
    });

    if (pendingCount >= 3) {
      return res.status(400).json({
        success: false,
        message:
          "You already have 3 pending withdrawals. Please wait until one is completed.",
      });
    }

    if (!["Bank Card", "USDT", "Wallet"].includes(method)) {
      return res.status(400).json({ message: "Invalid withdrawal method" });
    }

    const userIP = getIp(req);

    // Validate method details based on the selected method
    if (
      method === "Bank Card" &&
      (!methodDetails.bank ||
        !methodDetails.accountNumber ||
        !methodDetails.branch ||
        !methodDetails.cardholderName ||
        !methodDetails.city ||
        !methodDetails.email ||
        !methodDetails.phone ||
        !methodDetails.state ||
        !methodDetails.ifscCode)
    ) {
      return res
        .status(400)
        .json({ message: "Bank Card details are required" });
    }

    if (method === "USDT" && !methodDetails.usdtWalletAddress) {
      return res
        .status(400)
        .json({ message: "USDT Wallet Address is required" });
    }

    if (method === "Wallet" && !methodDetails.walletAddress) {
      return res.status(400).json({ message: "Wallet Address is required" });
    }

    const transaction = new Transaction({
      userId,
      userIP,
      type: "Withdrawal",
      amount,
      method,
      methodDetails,
      status: "Pending", // in future can be change after approval
      transactionId: `TXN${Date.now()}`,
    });

    await transaction.save();

    await UserActivityNotification.create({
      user: userId,
      category: "notification",
      type: "transaction",
      title: "Withdraw Request",
      message: `You request for withdrawal ₹${amount} via ${method} has been sent.`,
    });

    res.status(200).json({
      success: true,
      message: "Withdrawal request submitted",
      transaction,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/user/update-balance
// update user total balance
exports.updateUserBalance = async (req, res) => {
  try {
    const { amount, userId } = req.body;

    if (!amount) {
      return res.status(400).json({ message: "Amount is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (amount < 0 && user.totalBalance + amount < 0) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    user.totalBalance += amount;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Balance updated successfully",
      newBalance: user.totalBalance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// single user transaction history (User)
exports.getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.params; // Optional filter for transaction Type

    let filter = { userId };
    if (type && type !== "All") {
      filter.type = type; // Filter by transaction type if provided
    }

    const transactions = await Transaction.find(filter).sort({ createdAt: -1 });
    // .skip((page - 1) * limit)
    // .limit(parseInt(limit));

    const totalTransactions = await Transaction.countDocuments(filter); // Total count

    res.status(200).json({
      success: true,
      totalTransactions,
      // currentPage: parseInt(page),
      // totalPages: Math.ceil(totalTransactions / limit),
      transactions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserTransactions = async (req, res, type) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: "userId is required in query" });
    }

    const transactions = await Transaction.find({
      userId,
      type,
      isDeleted: false,
    }).sort({ createdAt: -1 });

    const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const count = transactions.length;

    const {
      todayStart,
      todayEnd,
      yesterdayStart,
      yesterdayEnd,
      weekStart,
      weekEnd,
      monthStart,
      monthEnd,
    } = getDateRanges();

    res.json({
      userId,
      count,
      totalAmount,
      today: summarize(transactions, todayStart, todayEnd),
      yesterday: summarize(transactions, yesterdayStart, yesterdayEnd),
      thisWeek: summarize(transactions, weekStart, weekEnd),
      thisMonth: summarize(transactions, monthStart, monthEnd),
      transactions,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: `Failed to fetch ${type} report`, error: err.message });
  }
};

exports.getUserDepositReports = async (req, res) => {
  try {
    const { userId, filter = "This Month", page = 1 } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "Missing userId" });
    }

    const {
      todayStart,
      todayEnd,
      yesterdayStart,
      yesterdayEnd,
      weekStart,
      weekEnd,
      monthStart,
      monthEnd,
    } = getDateRanges();

    let startDate, endDate;
    switch (filter) {
      case "Today":
        startDate = todayStart;
        endDate = todayEnd;
        break;
      case "Yesterday":
        startDate = yesterdayStart;
        endDate = yesterdayEnd;
        break;
      case "This Week":
        startDate = weekStart;
        endDate = weekEnd;
        break;
      case "This Month":
      default:
        startDate = monthStart;
        endDate = monthEnd;
    }

    const baseQuery = {
      userId,
      type: "Deposit",
      createdAt: { $gte: startDate, $lte: endDate },
    };

    // Pagination: Set limit to 12 and calculate skip based on page number
    const limit = 12;
    const skip = (page - 1) * limit;

    const allDeposits = await Transaction.find(baseQuery)
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit);

    const completedDeposits = allDeposits.filter(
      (tx) => tx.status === "Completed"
    );
    const pendingDeposits = allDeposits.filter((tx) => tx.status === "Pending");

    const cancelledDeposits = allDeposits.filter(
      (tx) => tx.status === "Cancelled"
    );
    const completedDepositAmount = completedDeposits.reduce(
      (total, deposit) => total + parseFloat(deposit.amount),
      0
    );

    const lastThreeCompletedDeposits = completedDeposits.slice(0, 3);
    const statusSummary = [
      { status: "Pending", count: pendingDeposits.length },
      { status: "Completed", count: completedDeposits.length },
      { status: "Cancelled", count: cancelledDeposits.length },
    ];
    // Get the total count of all deposits for pagination purposes
    const totalDeposits = await Transaction.countDocuments(baseQuery);

    return res.json({
      success: true,
      totalDepositCount: totalDeposits,
      completedDepositAmount,
      lastThreeCompletedDeposits,
      transactions: allDeposits,
      statusSummary,
      totalPages: Math.ceil(totalDeposits / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error("Error fetching user deposit reports:", err);
    return res.status(500).json({
      message: "Server error fetching user deposit reports",
      error: err.message,
    });
  }
};

exports.getUserWithdrawalReports = async (req, res) => {
  try {
    const { userId, filter = "This Month", page = 1 } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "Missing userId" });
    }

    const {
      todayStart,
      todayEnd,
      yesterdayStart,
      yesterdayEnd,
      weekStart,
      weekEnd,
      monthStart,
      monthEnd,
    } = getDateRanges();

    let startDate, endDate;
    switch (filter) {
      case "Today":
        startDate = todayStart;
        endDate = todayEnd;
        break;
      case "Yesterday":
        startDate = yesterdayStart;
        endDate = yesterdayEnd;
        break;
      case "This Week":
        startDate = weekStart;
        endDate = weekEnd;
        break;
      case "This Month":
      default:
        startDate = monthStart;
        endDate = monthEnd;
    }

    const baseQuery = {
      userId,
      type: "Withdrawal",
      createdAt: { $gte: startDate, $lte: endDate },
    };

    // Pagination: Set limit to 12 and calculate skip based on page number
    const limit = 12;
    const skip = (page - 1) * limit;

    const allWithdrawals = await Transaction.find(baseQuery)
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit);

    const completedWithdrawals = allWithdrawals.filter(
      (tx) => tx.status === "Completed"
    );
    const pendingWithdrawals = allWithdrawals.filter(
      (tx) => tx.status === "Pending"
    );

    const cancelledWithdrawals = allWithdrawals.filter(
      (tx) => tx.status === "Cancelled"
    );
    const completedWithdrawalAmount = completedWithdrawals.reduce(
      (total, withdraw) => total + parseFloat(withdraw.amount),
      0
    );

    const lastThreeCompletedWithdrawals = completedWithdrawals.slice(0, 3);
    const statusSummary = [
      { status: "Pending", count: pendingWithdrawals.length },
      { status: "Completed", count: completedWithdrawals.length },
      { status: "Cancelled", count: cancelledWithdrawals.length },
    ];

    // Get the total count of all deposits for pagination purposes
    const totalWithdrawals = await Transaction.countDocuments(baseQuery);

    return res.json({
      success: true,
      totalWithdrawalCount: totalWithdrawals,
      completedWithdrawalAmount,
      lastThreeCompletedWithdrawals,
      transactions: allWithdrawals,
      statusSummary,
      totalPages: Math.ceil(totalWithdrawals / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error("Error fetching user withdrawal reports:", err);
    return res.status(500).json({
      message: "Server error fetching user withdrawal reports",
      error: err.message,
    });
  }
};

// All users transaction history (Admin)
exports.getUsersTransactionsRecords = async (req, res) => {
  try {
    const {
      search,
      status, // Status filter (Completed, Pending, Cancelled)
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = req.query;

    let query = {};

    // Status filter
    if (status && ["Completed", "Pending", "Cancelled"].includes(status)) {
      query.status = status;
    }

    // Date filter
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Get total count for pagination
    const totalRequests = await Transaction.countDocuments(query);

    // Aggregation with lookup to join Users collection
    const transactions = await Transaction.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $match: {
          ...query, // Apply status and date filters
          ...(search
            ? {
                $or: [
                  { "user.email": { $regex: search, $options: "i" } },
                  { type: { $regex: search, $options: "i" } },
                  { method: { $regex: search, $options: "i" } },
                  { transactionId: { $regex: search, $options: "i" } },
                  { paymentOption: { $regex: search, $options: "i" } },
                ],
              }
            : {}),
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: Number(limit) },
      {
        $project: {
          _id: 1,
          transactionId: 1,
          type: 1,
          method: 1,
          paymentOption: 1,
          amount: 1,
          status: 1,
          createdAt: 1,
          user: {
            _id: "$user._id",
            email: "$user.email",
            nickName: "$user.nickName",
          },
        },
      },
    ]);

    return res.json({
      success: true,
      requests: transactions,
      totalRequests,
      totalPages: Math.ceil(totalRequests / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
// All deposit requests (Admin)
exports.getAllDepositRequests = async (req, res) => {
  try {
    const {
      search,
      status, // Completed, Pending, Cancelled
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = req.query;

    let query = { type: "Deposit" };

    if (status && ["Completed", "Pending", "Cancelled"].includes(status)) {
      query.status = status;
    }

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const totalRequests = await Transaction.countDocuments(query);

    const transactions = await Transaction.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $match: {
          ...query,
          ...(search
            ? {
                $or: [
                  { "user.email": { $regex: search, $options: "i" } },
                  { "user.uid": { $regex: search, $options: "i" } },
                  { method: { $regex: search, $options: "i" } },
                  { transactionId: { $regex: search, $options: "i" } },
                  { paymentOption: { $regex: search, $options: "i" } },
                ],
              }
            : {}),
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: Number(limit) },
      {
        $project: {
          _id: 1,
          userIP: 1,
          transactionId: 1,
          type: 1,
          method: 1,
          paymentOption: 1,
          amount: 1,
          status: 1,
          remarks: 1,
          isDeleted: 1,
          createdAt: 1,
          updatedAt: 1,
          user: {
            _id: "$user._id",
            email: "$user.email",
            nickName: "$user.nickName",
            uid: "$user.uid",
          },
        },
      },
    ]);

    const totalPages = Math.ceil(totalRequests / limit);

    return res.json({
      success: true,
      requests: transactions,
      totalRequests,
      totalPages,
      currentPage: Number(page),
    });
  } catch (error) {
    console.error("Error fetching deposit requests:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
// All withdrawal requests (Admin)
exports.getAllWithdrawalRequests = async (req, res) => {
  try {
    const {
      search,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = req.query;

    let query = { type: "Withdrawal" };

    if (status && ["Completed", "Pending", "Cancelled"].includes(status)) {
      query.status = status;
    }

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const totalRequests = await Transaction.countDocuments(query);

    const transactions = await Transaction.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $match: {
          ...query,
          ...(search
            ? {
                $or: [
                  { "user.email": { $regex: search, $options: "i" } },
                  { "user.uid": { $regex: search, $options: "i" } },
                  { method: { $regex: search, $options: "i" } },
                  { transactionId: { $regex: search, $options: "i" } },
                  { paymentOption: { $regex: search, $options: "i" } },
                ],
              }
            : {}),
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: Number(limit) },
      {
        $project: {
          _id: 1,
          userIP: 1,
          transactionId: 1,
          type: 1,
          method: 1,
          methodDetails: 1,
          paymentOption: 1,
          amount: 1,
          status: 1,
          remarks: 1,
          isDeleted: 1,
          createdAt: 1,
          updatedAt: 1,
          user: {
            _id: "$user._id",
            email: "$user.email",
            nickName: "$user.nickName",
            uid: "$user.uid",
          },
        },
      },
    ]);

    return res.json({
      success: true,
      requests: transactions,
      totalRequests,
      totalPages: Math.ceil(totalRequests / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    console.error("Error fetching withdrawal requests:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// to approve transaction by Admin
exports.approvalDepositWithdrawal = async (req, res) => {
  try {
    const { transactionId, status, type } = req.body;

    // Validate transaction type
    if (type && !transactionTypes.includes(type)) {
      return res.status(400).json({ message: "Invalid transaction type" });
    }

    // Find the transaction
    const transaction = await Transaction.findOne({ transactionId });
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (transaction.status !== "Pending") {
      return res.status(400).json({ message: "Transaction already processed" });
    }

    // Find the user
    const user = await User.findById(transaction.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update transaction type if provided
    if (type) {
      transaction.type = type;
    }

    // Update transaction status
    transaction.status = status;
    await transaction.save();

    let notificationTitle = "";
    let notificationMessage = "";

    if (status === "Completed") {
      if (transaction.type === "Deposit") {
        // Update user balances
        user.totalBalance += transaction.amount;
        user.totalDepositsAmount += transaction.amount;
        user.totalDepositsCounts += 1;
        notificationTitle = "Deposit Transaction Success";

        // Define all three reward tiers
        const rewardTierMap = {
          1: [
            { amount: 100, bonus: 20 },
            { amount: 300, bonus: 60 },
            { amount: 1000, bonus: 150 },
            { amount: 3000, bonus: 300 },
            { amount: 10000, bonus: 600 },
            { amount: 30000, bonus: 2000 },
            { amount: 100000, bonus: 5000 },
            { amount: 200000, bonus: 10000 },
          ],
          2: [
            { amount: 100, bonus: 15 },
            { amount: 300, bonus: 40 },
            { amount: 1000, bonus: 100 },
            { amount: 3000, bonus: 200 },
            { amount: 10000, bonus: 400 },
            { amount: 30000, bonus: 1500 },
            { amount: 100000, bonus: 3000 },
            { amount: 200000, bonus: 7000 },
          ],
          3: [
            { amount: 100, bonus: 10 },
            { amount: 300, bonus: 20 },
            { amount: 1000, bonus: 50 },
            { amount: 3000, bonus: 100 },
            { amount: 10000, bonus: 200 },
            { amount: 30000, bonus: 1000 },
            { amount: 100000, bonus: 1500 },
            { amount: 200000, bonus: 5000 },
          ],
        };

        // Determine which deposit bonus to apply
        let depositStage = 0;
        if (!user.firstDepositRewardClaimed) depositStage = 1;
        else if (!user.secondDepositRewardClaimed) depositStage = 2;
        else if (!user.thirdDepositRewardClaimed) depositStage = 3;

        if (depositStage > 0 && depositStage <= 3) {
          const rewardTiers = rewardTierMap[depositStage];
          const matchedTier = rewardTiers
            .slice()
            .reverse()
            .find((tier) => transaction.amount >= tier.amount);

          if (matchedTier) {
            const bonus = matchedTier.bonus;
            user.totalBalance += bonus;

            // Update user reward tracking fields
            if (depositStage === 1) {
              user.firstDepositAmount = transaction.amount;
              user.firstDepositRewardClaimed = true;
              user.firstDepositRewardClaimedAt = new Date();
            } else if (depositStage === 2) {
              user.secondDepositAmount = transaction.amount;
              user.secondDepositRewardClaimed = true;
              user.secondDepositRewardClaimedAt = new Date();
            } else if (depositStage === 3) {
              user.thirdDepositAmount = transaction.amount;
              user.thirdDepositRewardClaimed = true;
              user.thirdDepositRewardClaimedAt = new Date();
            }

            // Send reward notification
            await UserActivityNotification.create({
              user: user._id,
              category: "notification",
              type: "reward",
              title: `🎉 ${
                ["First", "Second", "Third"][depositStage - 1]
              } Deposit Bonus`,
              message: `You deposited ₹${
                transaction.amount
              } and received a ₹${bonus} bonus on your ${
                ["first", "second", "third"][depositStage - 1]
              } deposit. Enjoy playing!`,
            });
          }
        }
      } else if (transaction.type === "Withdrawal") {
        // user.totalBalance -= transaction.amount;
        user.totalWithdrawalsAmount += transaction.amount;
        user.totalWithdrawalsCounts += 1;
        notificationTitle = "Withdrawal Transaction Success";
      }

      await user.save();
      notificationMessage = `Your request for ${transaction.type.toLowerCase()} of ₹${
        transaction.amount
      } has been successfully processed.`;
    } else if (status === "Cancelled") {
      if (transaction.type === "Withdrawal") {
        user.totalBalance += transaction.amount;
      }
      await user.save();
      notificationTitle = "Transaction Cancelled";
      notificationMessage = `Your request for ${transaction.type.toLowerCase()} of ₹${
        transaction.amount
      } has been cancelled.`;
    }

    // Transaction notification (success or cancelled)
    await UserActivityNotification.create({
      user: user._id,
      category: "notification",
      type: "transaction",
      title: notificationTitle,
      message: notificationMessage,
    });

    res.status(200).json({
      success: true,
      message: `Transaction ${
        status === "Completed" ? "Completed" : "Cancelled"
      } Successfully (${type})`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get Transaction Stats
exports.getWeeklyTransactionStats = async (req, res) => {
  try {
    const totalTransactions = await Transaction.countDocuments();

    const currentWeekStart = moment().startOf("week").toDate();
    const lastWeekStart = moment().subtract(1, "week").startOf("week").toDate();
    const lastWeekEnd = moment().subtract(1, "week").endOf("week").toDate();

    // Get Current Week's Deposits
    const currentWeekDepositStats = await Transaction.aggregate([
      {
        $match: {
          type: "Deposit",
          status: "Completed",
          createdAt: { $gte: currentWeekStart },
        },
      },
      {
        $group: {
          _id: null,
          totalDeposits: { $sum: 1 },
          totalDepositAmount: { $sum: "$amount" },
        },
      },
    ]);

    // Get Last Week's Deposits
    const lastWeekDepositStats = await Transaction.aggregate([
      {
        $match: {
          type: "Deposit",
          status: "Completed",
          createdAt: { $gte: lastWeekStart, $lte: lastWeekEnd },
        },
      },
      {
        $group: {
          _id: null,
          totalDeposits: { $sum: 1 },
          totalDepositAmount: { $sum: "$amount" },
        },
      },
    ]);

    // Get Current Week's Withdrawals
    const currentWeekWithdrawalStats = await Transaction.aggregate([
      {
        $match: {
          type: "Withdrawal",
          status: "Completed",
          createdAt: { $gte: currentWeekStart },
        },
      },
      {
        $group: {
          _id: null,
          totalWithdrawals: { $sum: 1 },
          totalWithdrawalAmount: { $sum: "$amount" },
        },
      },
    ]);

    // Get Last Week's Withdrawals
    const lastWeekWithdrawalStats = await Transaction.aggregate([
      {
        $match: {
          type: "Withdrawal",
          status: "Completed",
          createdAt: { $gte: lastWeekStart, $lte: lastWeekEnd },
        },
      },
      {
        $group: {
          _id: null,
          totalWithdrawals: { $sum: 1 },
          totalWithdrawalAmount: { $sum: "$amount" },
        },
      },
    ]);

    // Get Cumulative Deposits
    const cumulativeDepositStats = await Transaction.aggregate([
      {
        $match: { type: "Deposit", status: "Completed" },
      },
      {
        $group: {
          _id: null,
          totalDeposits: { $sum: 1 },
          totalDepositAmount: { $sum: "$amount" },
        },
      },
    ]);

    // Get Cumulative Withdrawals
    const cumulativeWithdrawalStats = await Transaction.aggregate([
      {
        $match: { type: "Withdrawal", status: "Completed" },
      },
      {
        $group: {
          _id: null,
          totalWithdrawals: { $sum: 1 },
          totalWithdrawalAmount: { $sum: "$amount" },
        },
      },
    ]);

    // Function to calculate percentage change
    const getPercentageChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    // Calculate Percentage Changes
    const depositPercentageChange = getPercentageChange(
      currentWeekDepositStats[0]?.totalDepositAmount || 0,
      lastWeekDepositStats[0]?.totalDepositAmount || 0
    );

    const withdrawalPercentageChange = getPercentageChange(
      currentWeekWithdrawalStats[0]?.totalWithdrawalAmount || 0,
      lastWeekWithdrawalStats[0]?.totalWithdrawalAmount || 0
    );

    res.status(200).json({
      success: true,

      currentWeek: {
        totalDeposits: currentWeekDepositStats[0]?.totalDeposits || 0,
        totalDepositAmount: currentWeekDepositStats[0]?.totalDepositAmount || 0,

        totalWithdrawals: currentWeekWithdrawalStats[0]?.totalWithdrawals || 0,
        totalWithdrawalAmount:
          currentWeekWithdrawalStats[0]?.totalWithdrawalAmount || 0,
      },

      lastWeek: {
        totalDeposits: lastWeekDepositStats[0]?.totalDeposits || 0,
        totalDepositAmount: lastWeekDepositStats[0]?.totalDepositAmount || 0,

        totalWithdrawals: lastWeekWithdrawalStats[0]?.totalWithdrawals || 0,
        totalWithdrawalAmount:
          lastWeekWithdrawalStats[0]?.totalWithdrawalAmount || 0,
      },

      percentageChange: {
        depositPercentageChange: depositPercentageChange.toFixed(2) + "%",
        withdrawalPercentageChange: withdrawalPercentageChange.toFixed(2) + "%",
      },

      // Cumulative Data
      cumulativeTotalDeposits: cumulativeDepositStats[0]?.totalDeposits || 0,
      cumulativeTotalDepositAmount:
        cumulativeDepositStats[0]?.totalDepositAmount || 0,

      cumulativeTotalWithdrawals:
        cumulativeWithdrawalStats[0]?.totalWithdrawals || 0,
      cumulativeTotalWithdrawalAmount:
        cumulativeWithdrawalStats[0]?.totalWithdrawalAmount || 0,

      totalTransactions,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cumulative Transaction Stats
exports.getCumulativeFinancialStats = async (req, res) => {
  try {
    const totalTransactions = await Transaction.countDocuments();

    const statuses = ["Completed", "Pending", "Cancelled"];
    const types = ["Deposit", "Withdrawal"];
    const statusData = {};

    for (const status of statuses) {
      const deposits = await Transaction.aggregate([
        { $match: { type: "Deposit", status } },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            amount: { $sum: "$amount" },
          },
        },
      ]);

      const withdrawals = await Transaction.aggregate([
        { $match: { type: "Withdrawal", status } },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            amount: { $sum: "$amount" },
          },
        },
      ]);

      statusData[status] = {
        deposits: deposits[0] || { count: 0, amount: 0 },
        withdrawals: withdrawals[0] || { count: 0, amount: 0 },
      };
    }

    const chartHistory = await Transaction.aggregate([
      { $match: { status: "Completed" } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          deposits: {
            $sum: {
              $cond: [{ $eq: ["$_id.type", "Deposit"] }, "$total", 0],
            },
          },
          withdrawals: {
            $sum: {
              $cond: [{ $eq: ["$_id.type", "Withdrawal"] }, "$total", 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          deposits: 1,
          withdrawals: 1,
        },
      },
      { $sort: { date: 1 } },
    ]);

    const completed = statusData["Completed"];

    const stats = {
      totalTransactions,
      totalDeposits: completed.deposits.count,
      totalDepositAmount: completed.deposits.amount,
      totalWithdrawals: completed.withdrawals.count,
      totalWithdrawalAmount: completed.withdrawals.amount,
      netProfitOrLoss: completed.deposits.amount - completed.withdrawals.amount,
      pending: statusData["Pending"],
      cancelled: statusData["Cancelled"],
      chartHistory,
    };

    res.status(200).json({ success: true, stats });
  } catch (error) {
    console.error("Error fetching cumulative stats:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
