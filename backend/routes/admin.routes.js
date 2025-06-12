const express = require("express");
const rateLimit = require("express-rate-limit");
const UserChild = require("../models/UserChild");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Commission = require("../models/Commission");
const UserActivityNotification = require("../models/UserActivityNotification");

const { v4: uuidv4 } = require("uuid");
const {
  getUserProfile,
  getAllUsers,
  getAllUsers2,
  getUsersStats,
  getUserGrowth,
  updateUserProfile,
  deleteUser,
  updateUserProfileStatus,
} = require("../controllers/auth.controller");
const {
  getUserFinanceDetails,
} = require("../controllers/userFinance.controller");
const {
  getUsersTransactionsRecords,
  getAllDepositRequests,
  getAllWithdrawalRequests,
  getUserDepositReports,
  getUserWithdrawalReports,
} = require("../controllers/transactions.controller");
const gamesRoutes = require("./games/gamesCategory.routes");
const depositPaymentMethods = require("./depositPaymentMethod.routes");
const withdrawalPaymentMethods = require("./withdrawalPaymentMethod.routes");
const {
  getAllFeedbacksAdmin,
  acknowledgeFeedback,
} = require("../controllers/feedback.controller");
const {
  adminMiddleware,
  authMiddleware,
} = require("../middleware/authMiddleware");
const parentChild = require("../routes/parentChild.routes");
const ChatSession = require("../models/customer-support/ChatSession");

const router = express.Router();

// Iterative tree traversal
const traverseUserTreeIterative = async (startParentId) => {
  const stack = [startParentId];
  const idToNodeMap = {};

  while (stack.length > 0) {
    const currentId = stack.pop();
    const node = await UserChild.findOne({ parentId: currentId }).populate(
      "children"
    );

    if (!node) continue;

    idToNodeMap[currentId.toString()] = {
      parentId: node.parentId,
      parentUID: node.parentUID,
      children: [],
    };

    for (const child of node.children) {
      stack.push(child._id);
      idToNodeMap[currentId.toString()].children.push(child._id.toString());
    }
  }

  const buildNestedTree = (parentId) => {
    const node = idToNodeMap[parentId];
    if (!node) return null;

    node.children = node.children
      .map((childId) => buildNestedTree(childId))
      .filter((child) => child !== null); // Remove nulls from children array

    return node;
  };

  return buildNestedTree(startParentId.toString());
};
// const buildUserTree = async (startParentId) => {
//   const stack = [startParentId];
//   const idToNodeMap = {};
//   const visited = new Set(); // To track visited nodes

//   // Use DFS to traverse through the tree
//   while (stack.length > 0) {
//     const currentId = stack.pop();

//     if (visited.has(currentId)) continue; // Skip already processed nodes
//     visited.add(currentId); // Mark the current node as visited

//     // Fetch all children for the current parentId
//     const nodes = await UserChild.find({ parentId: currentId });

//     // If no nodes are found for the currentId, this is a leaf node
//     if (!nodes.length) {
//       idToNodeMap[currentId] = {
//         parentId: null, // No parent for leaf nodes
//         parentUID: null, // No parentUID for leaf nodes
//         children: [], // No children for leaf nodes
//       };
//     } else {
//       // Add the current node's details to the map
//       idToNodeMap[currentId] = {
//         parentId: nodes[0].parentId, // Assuming all children have the same parentId
//         parentUID: nodes[0].parentUID, // You might need to adjust if they differ
//         children: [], // Initialize empty children array
//       };

//       // Process the children of the current node
//       for (const node of nodes) {
//         for (const childId of node.children) {
//           if (!visited.has(childId)) {
//             // Only push if the child hasn't been visited
//             stack.push(childId); // Add the child to the stack for future processing
//             idToNodeMap[currentId].children.push(childId); // Add the child to the parent's children list
//           }
//         }
//       }
//     }
//   }

//   // Recursive function to build the tree structure from the idToNodeMap
//   const buildNested = (id) => {
//     const n = idToNodeMap[id];
//     if (!n) return null;

//     return {
//       id,
//       label: n.parentUID || "No Children UID", // Using parentUID as the label (or you can adjust this)
//       children: n.children.map(buildNested).filter(Boolean), // Recursively build nested children
//     };
//   };

//   // Build the tree starting from the root node
//   return buildNested(startParentId);
// };
// Recursive Tree Builder
const buildUserTree = async (parentId) => {
  const node = await UserChild.findOne({ parentId });

  const result = {
    id: parentId,
    label: node?.parentUID || "Unknown",
    children: [],
  };

  if (node?.children?.length > 0) {
    for (const child of node.children) {
      const childNode = await buildUserTree(child.childId);

      result.children.push({
        ...childNode,
        label: child.childUID || childNode.label, // Prefer stored UID
      });
    }
  }

  return result;
};
// Recursive function to build the tree with deposit info
const getCompletedDepositsTree = async (parentId) => {
  const node = await UserChild.findOne({ parentId });

  if (!node) return null;

  const childIds = node.children.map((child) => child.childId);

  // Fetch only required fields of completed deposits in one query
  const allCompletedDeposits = await Transaction.aggregate([
    {
      $match: {
        userId: { $in: childIds },
        type: "Deposit",
        status: "Completed",
      },
    },
    {
      $project: {
        userId: 1,
        amount: 1,
        type: 1,
        _id: 0,
      },
    },
    {
      $group: {
        _id: "$userId",
        deposits: {
          $push: { userId: "$userId", amount: "$amount", type: "$type" },
        },
        count: { $sum: 1 },
      },
    },
  ]);

  // Map childId to their filtered completed deposits and count
  const depositsMap = allCompletedDeposits.reduce(
    (acc, { _id, deposits, count }) => {
      acc[_id.toString()] = { deposits, count };
      return acc;
    },
    {}
  );

  const childrenData = [];

  for (const child of node.children) {
    const childIdStr = child.childId.toString();
    const childDeposits = depositsMap[childIdStr] || {
      deposits: [],
      count: 0,
    };

    const subTree = await getCompletedDepositsTree(child.childId);

    childrenData.push({
      id: child.childId,
      uid: child.childUID,
      completedDeposits: childDeposits.deposits,
      count: childDeposits.count,
      children: subTree ? subTree.children : [],
    });
  }

  return {
    id: node.parentId,
    uid: node.parentUID,
    children: childrenData,
  };
};

const getUsersLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 10, // Limit each IP to 10 requests per windowMs
  message: { error: "Too many requests, please try again later." },
});

router.get("/get-agent-profile/:agentUID", async (req, res) => {
  const agentUID = req.params.agentUID;
  try {
    const agent = await User.findOne({ uid: agentUID });

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent not found", // this will be caught in frontend
      });
    }

    res.status(200).json({
      success: true,
      agentProfile: agent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
});

router.post("/send-commission-to-agent", async (req, res) => {
  const { userId, sendBy, type, amount, remarks } = req.body;

  try {
    // Verify both users exist
    const user = await User.findById(userId);
    const sender = await User.findById(sendBy);
    if (!user || !sender) {
      return res
        .status(404)
        .json({ success: false, message: "User or sender not found" });
    }

    user.totalBalance += amount;
    user.totalCommission += amount;
    await user.save();

    const transactionId = uuidv4(); // Generate unique transaction ID

    const commission = new Commission({
      userId,
      sendBy,
      type,
      amount,
      remarks,
      transactionId,
    });

    await commission.save();

    await UserActivityNotification.create({
      user: userId,
      category: "notification",
      type: "commission",
      title: type,
      message: `Commission Salary of amount: ₹${amount} has been added.`,
    });

    res.status(201).json({ success: true, commission });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to send commission", error });
  }
});

router.get(
  "/get-user-profile/:id",
  authMiddleware,
  adminMiddleware,
  getUserProfile
);

router.put(
  "/update-user-profile-status/:id",
  authMiddleware,
  adminMiddleware,
  updateUserProfileStatus
);

router.get(
  "/get-all-users",
  getUsersLimiter,
  authMiddleware,
  adminMiddleware,
  getAllUsers
);
router.get(
  "/get-all-users2",
  getUsersLimiter,
  authMiddleware,
  adminMiddleware,
  getAllUsers2
);
router.get(
  "/get-user-financial-details",
  authMiddleware,
  adminMiddleware,
  getUserFinanceDetails
);

router.get("/get-users-stats", authMiddleware, adminMiddleware, getUsersStats);
router.get("/get-users-growth", authMiddleware, adminMiddleware, getUserGrowth);
router.put(
  "/update-profile/:id",
  authMiddleware,
  adminMiddleware,
  updateUserProfile
);
router.delete("/delete-user/:id", authMiddleware, adminMiddleware, deleteUser);

router.get(
  "/get-user-transactions-requests",
  authMiddleware,
  adminMiddleware,
  getUsersTransactionsRecords
);

router.get(
  "/get-all-users-deposit-requests",
  authMiddleware,
  adminMiddleware,
  getAllDepositRequests
);
router.get(
  "/get-all-users-withdrawal-requests",
  authMiddleware,
  adminMiddleware,
  getAllWithdrawalRequests
);

router.get(
  "/get-user-deposit-report",
  authMiddleware,
  adminMiddleware,
  getUserDepositReports
);
router.get(
  "/get-user-withdrawal-report",
  authMiddleware,
  adminMiddleware,
  getUserWithdrawalReports
);

router.use("/games", gamesRoutes);

// Deposit Payment Methods
router.use("/deposit-payment-methods", depositPaymentMethods);
router.use("/withdrawal-payment-methods", withdrawalPaymentMethods);
router.use(parentChild);

// Get all feedbacks
router.get(
  "/get-all-feedbacks",
  authMiddleware,
  adminMiddleware,
  getAllFeedbacksAdmin
);

// Acknowledge a feedback
router.patch(
  "/acknowledge-feedback/:id",
  authMiddleware,
  adminMiddleware,
  acknowledgeFeedback
);

router.get("/chat-session/users", async (req, res) => {
  const sessions = await ChatSession.find()
    .populate("userId")
    .sort({ createdAt: -1 });
  const userMap = new Map();
  sessions.forEach((session) => {
    const user = session.userId;
    if (!userMap.has(user._id.toString())) {
      userMap.set(user._id.toString(), user);
    }
  });
  res.json(Array.from(userMap.values()));
});

// router.get("/parent-to-child/:parentId", async (req, res) => {
//   const { parentId } = req.params;
//   try {
//     const tree = await buildUserTree(parentId);
//     res.json(tree);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });
// router.get("/child-deposit-history/:parentId", async (req, res) => {
//   try {
//     const parentId = req.params.parentId;
//     const result = await getCompletedDepositsTree(parentId);
//     if (!result) {
//       return res.status(404).json({ message: "User has no children." });
//     }
//     res.status(200).json({ childrenDeposits: result });
//   } catch (err) {
//     console.error("Error fetching child deposit history:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });
module.exports = router;
