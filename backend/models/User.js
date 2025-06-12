const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: function () {
        return this.authBy === "email";
      },
      sparse: true,
    },
    phone: {
      type: String,
      unique: function () {
        return this.authBy === "phone";
      },
      sparse: true,
    },
    avatar: { type: String, default: "one" },
    password: { type: String, required: true },

    withdrawalMethodSet: {
      bankCard: { type: Boolean, default: false },
      usdt: { type: Boolean, default: false },
      wallet: { type: Boolean, default: false },
    },
    withdrawalPassword: { type: String }, // Stores withdrawal password (hashed)
    withdrawalPasswordStatus: { type: Boolean, default: false }, // Status if withdrawal password is set

    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    uid: { type: String, unique: true, required: true }, // Unique user ID
    nickName: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    authBy: { type: String, required: true },

    totalBalance: { type: Number, default: 0 }, // Tracks user's total money
    attendanceBonus: { type: Number, default: 0 },
    lastAttendedDate: { type: Date },
    consecutiveDays: { type: Number, default: 0 },
    totalDeposits: { type: Number, default: 0 },
    totalWithdrawals: { type: Number, default: 0 },
    betsPlaced: { type: Number, default: 0 },
    winnings: { type: Number, default: 0 },

    isVerified: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["active", "suspended", "banned"],
      default: "active",
    },
    statusRemarks: {
      type: String,
      default: "",
    },
    inviteCode: { type: String, unique: true },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // default: null,
    },
    parentUID: {
      type: String,
    },
    level: {
      type: Number,
      default: 0,
    },
    exp: { type: Number, default: 0 },
    registerTimeIP: { type: String, default: null },
    downloadRewardClaimed: { type: Boolean, default: false }, // Track app reward claim
    downloadRewardClaimedAt: { type: Date },
    firstDepositAmount: { type: Number, default: 0 },
    firstDepositRewardClaimed: { type: Boolean, default: false },
    firstDepositRewardClaimedAt: { type: Date },
    secondDepositAmount: { type: Number, default: 0 },
    secondDepositRewardClaimed: { type: Boolean, default: false },
    secondDepositRewardClaimedAt: { type: Date },
    thirdDepositAmount: { type: Number, default: 0 },
    thirdDepositRewardClaimed: { type: Boolean, default: false },
    thirdDepositRewardClaimedAt: { type: Date },
    totalDepositsAmount: { type: Number, default: 0 },
    totalDepositsCounts: { type: Number, default: 0 },
    totalWithdrawalsAmount: { type: Number, default: 0 },
    totalWithdrawalsCounts: { type: Number, default: 0 },
    winningsAmount: { type: Number, default: 0 },
    totalCommission: { type: Number, default: 0 },
    ChildrenCount: { type: Number, default: 0 },

    loginHistory: [
      {
        ip: { type: String },
        userAgent: { type: String },
        loginAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Pre-save hook to ensure 'totalBalance' has at most 2 decimal places
UserSchema.pre("save", function (next) {
  if (this.totalBalance !== undefined) {
    // Round to 2 decimal places
    this.totalBalance = Math.round(this.totalBalance * 100) / 100;
  }
  next();
});

module.exports = mongoose.model("User", UserSchema);
