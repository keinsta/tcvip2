const express = require("express");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { Types } = require("mongoose");
const UserChild = require("../models/UserChild");
const Transaction = require("../models/Transaction");
const Bet = require("../models/Bet");
const User = require("../models/User");
const router = express.Router();

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
    childrenLength: node?.children?.length || 0, // Add number of direct children
    children: [],
  };

  if (node?.children?.length > 0) {
    for (const child of node.children) {
      const childNode = await buildUserTree(child.childId);

      result.children.push({
        ...childNode,
        label: child.childUID || childNode.label,
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
        totalAmount: { $sum: "$amount" }, // 👈 total amount
      },
    },
  ]);

  // Map childId to their filtered completed deposits and count
  const depositsMap = allCompletedDeposits.reduce(
    (acc, { _id, deposits, count, totalAmount }) => {
      acc[_id.toString()] = { deposits, count, totalAmount };
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
      totalAmount: 0,
    };

    const subTree = await getCompletedDepositsTree(child.childId);

    childrenData.push({
      id: child.childId,
      uid: child.childUID,
      completedDeposits: childDeposits.deposits,
      count: childDeposits.count,
      totalAmount: childDeposits.totalAmount,
      children: subTree ? subTree.children : [],
    });
  }

  return {
    id: node.parentId,
    uid: node.parentUID,
    children: childrenData,
  };
};

router.get("/parent-to-child/:parentId", async (req, res) => {
  const { parentId } = req.params;
  try {
    const tree = await buildUserTree(parentId);
    res.json(tree);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/child-deposit-history/:parentId", async (req, res) => {
  try {
    const parentId = req.params.parentId;
    const result = await getCompletedDepositsTree(parentId);
    if (!result) {
      return res.status(404).json({ message: "User has no children." });
    }
    res.status(200).json({ childrenDeposits: result });
  } catch (err) {
    console.error("Error fetching child deposit history:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
router.get("/child-deposit-daily/:parentId", async (req, res) => {
  try {
    const parentId = req.params.parentId;

    const node = await UserChild.findOne({ parentId });

    if (!node || !node.children.length) {
      return res.status(404).json({ message: "No children found" });
    }

    const childIds = node.children.map((c) => c.childId);

    const depositsByDay = await Transaction.aggregate([
      {
        $match: {
          userId: { $in: childIds },
          type: "Deposit",
          status: "Completed",
        },
      },
      {
        $project: {
          amount: 1,
          userId: 1,
          date: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
        },
      },
      {
        $group: {
          _id: { userId: "$userId", date: "$date" },
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          userId: "$_id.userId",
          date: "$_id.date",
          totalAmount: 1,
          count: 1,
        },
      },
      {
        $sort: { date: -1 },
      },
    ]);

    res.status(200).json({ dailyBreakdown: depositsByDay });
  } catch (err) {
    console.error("Error in daily deposit breakdown:", err);
    res.status(500).json({ error: err.message });
  }
});
router.get("/child-deposit-daily-per-user/:parentId", async (req, res) => {
  try {
    const parentId = req.params.parentId;

    const node = await UserChild.findOne({ parentId });

    if (!node || !node.children.length) {
      return res.status(404).json({ message: "No children found" });
    }

    // Build UID map
    const uidMap = {};
    const childIds = node.children.map((c) => {
      uidMap[c.childId.toString()] = c.childUID;
      return c.childId;
    });

    const deposits = await Transaction.aggregate([
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
          date: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
        },
      },
      {
        $group: {
          _id: {
            userId: "$userId",
            date: "$date",
          },
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.date": -1 },
      },
    ]);

    // Attach UID to each entry
    const response = deposits.map((entry) => ({
      uid: uidMap[entry._id.userId.toString()] || "Unknown",
      userId: entry._id.userId,
      date: entry._id.date,
      totalAmount: entry.totalAmount,
      count: entry.count,
    }));

    res.status(200).json({ dailyPerUserBreakdown: response });
  } catch (err) {
    console.error("Error in per-user daily deposit breakdown:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/direct-children/:parentId", async (req, res) => {
  try {
    const parentUID = req.params.parentId;
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : null;
    // const end = endDate ? new Date(endDate) : null;
    const end = endDate
      ? new Date(new Date(endDate).setHours(23, 59, 59, 999))
      : null;

    const node = await UserChild.findOne({ parentUID });
    if (!node || !node.children.length) {
      return res.status(404).json({ message: "No direct children found." });
    }

    const allChildIds = node.children.map(
      (child) => new Types.ObjectId(child.childId)
    );
    const totalChildren = allChildIds.length;
    const paginatedChildIds = allChildIds.slice(skip, skip + limit);

    const userProfiles = await User.find({ _id: { $in: paginatedChildIds } })
      .select("-password")
      .lean();

    // Common date filter
    const createdAtFilter = {};
    if (start) createdAtFilter.$gte = start;
    if (end) createdAtFilter.$lte = end;

    // Utility function for aggregation
    const getTransactionMap = async (type) => {
      const matchStage = {
        userId: { $in: paginatedChildIds },
        type,
        status: "Completed",
      };
      if (start || end) matchStage.createdAt = createdAtFilter;

      const txs = await Transaction.aggregate([
        { $match: matchStage },
        {
          $project: {
            userId: 1,
            amount: 1,
            date: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
          },
        },
        {
          $group: {
            _id: { userId: "$userId", date: "$date" },
            totalAmount: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            userId: "$_id.userId",
            date: "$_id.date",
            totalAmount: 1,
            count: 1,
          },
        },
      ]);

      const map = {};
      for (const tx of txs) {
        const key = tx.userId.toString();
        if (!map[key]) map[key] = [];
        map[key].push({
          date: tx.date,
          totalAmount: tx.totalAmount,
          count: tx.count,
        });
      }
      return map;
    };

    const [depositMap, withdrawalMap] = await Promise.all([
      getTransactionMap("Deposit"),
      getTransactionMap("Withdraw"),
    ]);

    const childrenWithTransactions = userProfiles.map((user) => {
      const uid = user._id.toString();
      return {
        ...user,
        deposits: depositMap[uid] || [],
        withdrawals: withdrawalMap[uid] || [],
      };
    });

    return res.status(200).json({
      parentId: node.parentId,
      currentPage: page,
      totalPages: Math.ceil(totalChildren / limit),
      totalChildren,
      children: childrenWithTransactions,
    });
  } catch (err) {
    console.error("Error fetching direct children with transactions:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});
// GET /api/subordinate-stats/:parentId
router.get("/subordinate-stats/:parentId", async (req, res) => {
  try {
    const parentId = req.params.parentId;
    const { date } = req.query; // optional: filter by day

    const userChild = await UserChild.findOne({ parentId });

    if (!userChild || !userChild.children.length) {
      return res.status(200).json({
        depositAccounts: 0,
        depositAmount: 0,
        betAccounts: 0,
        betAmount: 0,
        newDepositAccounts: 0,
        firstDepositAmount: 0,
      });
    }

    const childIds = userChild.children.map((c) => c.childId);

    // Optional date filter (start of day to end of day)
    const startOfDay = date ? new Date(date + "T00:00:00.000Z") : null;
    const endOfDay = date ? new Date(date + "T23:59:59.999Z") : null;

    // Filter for deposits
    const depositMatch = {
      userId: { $in: childIds },
      type: "Deposit",
      status: "Completed",
    };
    if (startOfDay && endOfDay) {
      depositMatch.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }

    const depositStats = await Transaction.aggregate([
      { $match: depositMatch },
      {
        $group: {
          _id: "$userId",
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    const depositAccounts = depositStats.length;
    const depositAmount = depositStats.reduce(
      (sum, d) => sum + d.totalAmount,
      0
    );

    // Fetch first deposit per child to check "new deposit accounts"
    const firstDeposits = await Transaction.aggregate([
      {
        $match: {
          userId: { $in: childIds },
          type: "Deposit",
          status: "Completed",
        },
      },
      {
        $sort: { createdAt: 1 },
      },
      {
        $group: {
          _id: "$userId",
          firstDeposit: { $first: "$$ROOT" },
        },
      },
    ]);

    const newDepositAccounts = firstDeposits.filter((fd) => {
      if (!startOfDay || !endOfDay) return false;
      const created = new Date(fd.firstDeposit.createdAt);
      return created >= startOfDay && created <= endOfDay;
    });

    const firstDepositAmount = newDepositAccounts.reduce(
      (sum, acc) => sum + acc.firstDeposit.amount,
      0
    );

    // Bet stats (optional)
    const betStats = await Bet.aggregate([
      {
        $match: {
          userId: { $in: childIds },
          ...(startOfDay && endOfDay
            ? { createdAt: { $gte: startOfDay, $lte: endOfDay } }
            : {}),
        },
      },
      {
        $group: {
          _id: "$userId",
          totalAmount: { $sum: "$betAmount" },
        },
      },
    ]);

    const betAccounts = betStats.length;
    const betAmount = betStats.reduce((sum, b) => sum + b.totalAmount, 0);

    return res.status(200).json({
      depositAccounts,
      depositAmount,
      betAccounts,
      betAmount,
      newDepositAccounts: newDepositAccounts.length,
      firstDepositAmount,
    });
  } catch (err) {
    console.error("Subordinate stats error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/subordinate-stats2/:parentId", async (req, res) => {
  try {
    const parentUID = req.params.parentId;
    const { startDate, endDate } = req.query;

    const userChild = await UserChild.findOne({ parentUID });
    if (!userChild || !userChild.children.length) {
      return res.status(200).json({
        newRegistrationAccounts: 0,
        depositAccounts: 0,
        depositAmount: 0,
        withdrawalAccounts: 0,
        withdrawalAmount: 0,
        betAccounts: 0,
        betAmount: 0,
        firstDepositAccounts: 0,
        firstDepositAmount: 0,
        secondDepositAccounts: 0,
        secondDepositAmount: 0,
        thirdDepositAccounts: 0,
        thirdDepositAmount: 0,
      });
    }

    const childIds = userChild.children.map((c) => c.childId);

    // Handle optional date filtering
    const createdAtFilter = {};
    if (startDate)
      createdAtFilter.$gte = new Date(`${startDate}T00:00:00.000Z`);
    if (endDate) createdAtFilter.$lte = new Date(`${endDate}T23:59:59.999Z`);

    const baseMatch = { userId: { $in: childIds } };
    if (startDate || endDate) baseMatch.createdAt = createdAtFilter;

    // Deposit Stats
    const depositStats = await Transaction.aggregate([
      { $match: { ...baseMatch, type: "Deposit", status: "Completed" } },
      {
        $group: {
          _id: "$userId",
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);
    const depositAccounts = depositStats.length;
    const depositAmount = depositStats.reduce(
      (sum, d) => sum + d.totalAmount,
      0
    );

    // Withdrawal Stats
    const withdrawalStats = await Transaction.aggregate([
      { $match: { ...baseMatch, type: "Withdraw", status: "Completed" } },
      {
        $group: {
          _id: "$userId",
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);
    const withdrawalAccounts = withdrawalStats.length;
    const withdrawalAmount = withdrawalStats.reduce(
      (sum, w) => sum + w.totalAmount,
      0
    );

    // First, Second, Third Deposit Stats
    const depositsPerUser = await Transaction.aggregate([
      { $match: { ...baseMatch, type: "Deposit", status: "Completed" } },
      { $sort: { createdAt: 1 } },
      {
        $group: {
          _id: "$userId",
          deposits: { $push: "$amount" },
        },
      },
      {
        $project: {
          first: { $arrayElemAt: ["$deposits", 0] },
          second: { $arrayElemAt: ["$deposits", 1] },
          third: { $arrayElemAt: ["$deposits", 2] },
        },
      },
    ]);

    let firstDepositAccounts = 0,
      firstDepositAmount = 0,
      secondDepositAccounts = 0,
      secondDepositAmount = 0,
      thirdDepositAccounts = 0,
      thirdDepositAmount = 0;

    depositsPerUser.forEach(({ first, second, third }) => {
      if (first !== undefined) {
        firstDepositAccounts++;
        firstDepositAmount += first;
      }
      if (second !== undefined) {
        secondDepositAccounts++;
        secondDepositAmount += second;
      }
      if (third !== undefined) {
        thirdDepositAccounts++;
        thirdDepositAmount += third;
      }
    });

    // Bet Stats
    const betStats = await Bet.aggregate([
      { $match: { ...baseMatch } },
      {
        $group: {
          _id: "$userId",
          totalBet: { $sum: "$amount" },
        },
      },
    ]);
    const betAccounts = betStats.length;
    const betAmount = betStats.reduce((sum, b) => sum + b.totalBet, 0);

    // New Registration Accounts
    const registrationMatch = { uid: { $in: childIds } };
    if (startDate || endDate) registrationMatch.createdAt = createdAtFilter;
    const newAccounts = await User.countDocuments(registrationMatch);

    return res.status(200).json({
      newRegistrationAccounts: newAccounts,
      depositAccounts,
      depositAmount,
      withdrawalAccounts,
      withdrawalAmount,
      betAccounts,
      betAmount,
      firstDepositAccounts,
      firstDepositAmount,
      secondDepositAccounts,
      secondDepositAmount,
      thirdDepositAccounts,
      thirdDepositAmount,
    });
  } catch (error) {
    console.error("Error fetching subordinate stats:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/subordinate-team-stats/:parentId", async (req, res) => {
  try {
    const parentId = req.params.parentId;

    // Step 1: Get direct children
    const directNode = await UserChild.findOne({ parentId });
    const directIds =
      directNode?.children.map((c) => c.childId.toString()) || [];

    // Step 2: Get full user-child relationship data
    const allTeamNode = await UserChild.find({});

    // Step 3: Build recursive map of parent -> children
    const getTeamChildren = (id, allLinks) => {
      const map = new Map();

      for (let link of allLinks) {
        const pid = link.parentId.toString();
        if (!map.has(pid)) map.set(pid, []);
        map.get(pid).push(...link.children.map((c) => c.childId.toString()));
      }

      // console.log("Map built for traversal:", map);

      const result = new Set();

      const dfs = (pid) => {
        const children = map.get(pid) || [];
        for (let cid of children) {
          if (!result.has(cid)) {
            result.add(cid);
            dfs(cid);
          }
        }
      };

      dfs(id.toString());
      return Array.from(result);
    };

    // Step 4: Traverse all subordinate nodes recursively
    const indirectTeamIds = getTeamChildren(parentId, allTeamNode); // excludes directIds

    // Step 5: Merge direct + indirect for full team stats
    const teamIds = Array.from(new Set([...directIds, ...indirectTeamIds]));

    // console.log("Direct IDs:", directIds);
    // console.log("Team IDs (direct + indirect):", teamIds);

    // Step 6: Deposit aggregation logic
    const aggregateDepositStats = async (userIds) => {
      if (!userIds.length)
        return {
          registrationAccounts: 0,
          depositAccounts: 0,
          depositAmount: 0,
          newDepositAccounts: 0,
        };

      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      const [depositData, firstDeposits] = await Promise.all([
        Transaction.aggregate([
          {
            $match: {
              userId: { $in: userIds.map((id) => new ObjectId(id)) },
              type: "Deposit",
              status: "Completed",
            },
          },
          {
            $group: {
              _id: "$userId",
              totalAmount: { $sum: "$amount" },
            },
          },
        ]),
        Transaction.aggregate([
          {
            $match: {
              userId: { $in: userIds.map((id) => new ObjectId(id)) },
              type: "Deposit",
              status: "Completed",
            },
          },
          { $sort: { createdAt: 1 } },
          {
            $group: {
              _id: "$userId",
              firstDeposit: { $first: "$createdAt" },
            },
          },
        ]),
      ]);

      const depositAccounts = depositData.length;
      const depositAmount = depositData.reduce(
        (sum, u) => sum + u.totalAmount,
        0
      );
      const newDepositAccounts = firstDeposits.filter((d) => {
        const dDate = new Date(d.firstDeposit);
        dDate.setUTCHours(0, 0, 0, 0);
        return dDate.getTime() === today.getTime();
      }).length;

      return {
        registrationAccounts: userIds.length,
        depositAccounts,
        depositAmount,
        newDepositAccounts,
      };
    };

    // Step 7: Run both aggregations in parallel
    const [directStats, teamStats] = await Promise.all([
      aggregateDepositStats(directIds),
      aggregateDepositStats(teamIds),
    ]);

    // Step 8: Return response
    res.json({
      directSubordinates: {
        totalSubordinates: directIds.length,
        ...directStats,
      },
      teamSubordinates: {
        totalSubordinates: teamIds.length,
        ...teamStats,
      },
    });
  } catch (err) {
    console.error("Team stats error:", err);
    res.status(500).json({ error: err.message });
  }
});
router.get("/team-subordinate-stats-per-node/:parentId", async (req, res) => {
  try {
    const parentId = req.params.parentId;
    const dateQuery = req.query.date;

    const targetDate = dateQuery ? new Date(dateQuery) : null;
    if (targetDate) targetDate.setUTCHours(0, 0, 0, 0);
    const nextDate = targetDate
      ? new Date(targetDate.getTime() + 86400000)
      : null;

    const allLinks = await UserChild.find({});
    const childMap = new Map();

    for (let link of allLinks) {
      const pid = link.parentId.toString();
      const childIds = link.children.map((c) => c.childId.toString());
      if (!childMap.has(pid)) childMap.set(pid, []);
      childMap.get(pid).push(...childIds);
    }

    const buildTree = (currentId) => {
      const children = childMap.get(currentId) || [];
      return {
        id: currentId,
        children: children.map((cid) => buildTree(cid)),
      };
    };

    const rootTree = buildTree(parentId);

    const collectSubordinatesMap = (node) => {
      const result = new Map();

      const dfs = (current) => {
        const subordinates = [];

        const recurse = (n) => {
          for (const child of n.children) {
            subordinates.push(child.id);
            recurse(child);
          }
        };

        recurse(current);
        result.set(current.id, subordinates);
        for (const child of current.children) {
          dfs(child);
        }
      };

      dfs(node);
      return result;
    };

    const subordinatesMap = collectSubordinatesMap(rootTree);

    const aggregateStats = async (userIds) => {
      if (!userIds.length)
        return {
          depositAccounts: 0,
          depositAmount: 0,
          firstDepositAmount: 0,
          newDepositAccounts: 0,
          betAccounts: 0,
          betAmount: 0,
        };

      const matchBase = {
        userId: { $in: userIds.map((id) => new ObjectId(id)) },
        status: "Completed",
      };

      // Deposit Aggregation
      const depositMatch = {
        ...matchBase,
        type: "Deposit",
      };

      if (targetDate) {
        depositMatch.createdAt = { $gte: targetDate, $lt: nextDate };
      }

      const [depositData, firstDeposits] = await Promise.all([
        Transaction.aggregate([
          { $match: depositMatch },
          {
            $group: {
              _id: "$userId",
              totalAmount: { $sum: "$amount" },
            },
          },
        ]),
        Transaction.aggregate([
          {
            $match: {
              ...matchBase,
              type: "Deposit",
            },
          },
          { $sort: { createdAt: 1 } },
          {
            $group: {
              _id: "$userId",
              firstDeposit: { $first: "$createdAt" },
              firstAmount: { $first: "$amount" },
            },
          },
        ]),
      ]);

      const depositAccounts = depositData.length;
      const depositAmount = depositData.reduce(
        (sum, u) => sum + u.totalAmount,
        0
      );

      const newDepositAccounts = firstDeposits.filter((d) => {
        if (!targetDate) return false;
        const dDate = new Date(d.firstDeposit);
        dDate.setUTCHours(0, 0, 0, 0);
        return dDate.getTime() === targetDate.getTime();
      }).length;

      const firstDepositAmount = targetDate
        ? firstDeposits
            .filter((d) => {
              const dDate = new Date(d.firstDeposit);
              dDate.setUTCHours(0, 0, 0, 0);
              return dDate.getTime() === targetDate.getTime();
            })
            .reduce((sum, d) => sum + d.firstAmount, 0)
        : 0;

      // Bet Aggregation
      const betMatch = {
        ...matchBase,
        type: "Bet",
      };

      if (targetDate) {
        betMatch.createdAt = { $gte: targetDate, $lt: nextDate };
      }

      const betData = await Transaction.aggregate([
        { $match: betMatch },
        {
          $group: {
            _id: "$userId",
            totalAmount: { $sum: "$amount" },
          },
        },
      ]);

      const betAccounts = betData.length;
      const betAmount = betData.reduce((sum, u) => sum + u.totalAmount, 0);

      return {
        depositAccounts,
        depositAmount,
        firstDepositAmount,
        newDepositAccounts,
        betAccounts,
        betAmount,
      };
    };

    const nodeIds = Array.from(subordinatesMap.keys());

    const nodeStats = await Promise.all(
      nodeIds.map(async (nodeId) => {
        const subordinateIds = subordinatesMap.get(nodeId);
        const stats = await aggregateStats(subordinateIds);
        return {
          nodeId,
          totalSubordinates: subordinateIds.length,
          ...stats,
        };
      })
    );

    res.json({
      root: parentId,
      date: dateQuery || "cumulative",
      nodes: nodeStats,
    });
  } catch (err) {
    console.error("Error in subordinate stats:", err);
    res.status(500).json({ error: err.message });
  }
});
router.get("/team-subordinate-stats/:parentId", async (req, res) => {
  try {
    const parentId = req.params.parentId;
    const dateQuery = req.query.date;

    const targetDate = dateQuery ? new Date(dateQuery) : null;
    if (targetDate) targetDate.setUTCHours(0, 0, 0, 0);
    const nextDate = targetDate
      ? new Date(targetDate.getTime() + 86400000)
      : null;

    const allLinks = await UserChild.find({});
    const childMap = new Map();

    for (let link of allLinks) {
      const pid = link.parentId.toString();
      const childIds = link.children.map((c) => c.childId.toString());
      if (!childMap.has(pid)) childMap.set(pid, []);
      childMap.get(pid).push(...childIds);
    }

    // Collect all subordinate IDs recursively
    const collectSubordinates = (startId) => {
      const visited = new Set();
      const stack = [startId];

      while (stack.length) {
        const current = stack.pop();
        const children = childMap.get(current) || [];
        for (let cid of children) {
          if (!visited.has(cid)) {
            visited.add(cid);
            stack.push(cid);
          }
        }
      }

      return Array.from(visited);
    };

    const subordinateIds = collectSubordinates(parentId);

    const aggregateStats = async (userIds) => {
      if (!userIds.length)
        return {
          depositAccounts: 0,
          depositAmount: 0,
          betAccounts: 0,
          betAmount: 0,
          newDepositAccounts: 0,
          firstDepositAmount: 0,
        };

      const userObjectIds = userIds.map((id) => new ObjectId(id));

      // Deposit Aggregation
      const depositMatch = {
        userId: { $in: userObjectIds },
        type: "Deposit",
        status: "Completed",
      };

      if (targetDate) {
        depositMatch.createdAt = { $gte: targetDate, $lt: nextDate };
      }

      const [depositData, firstDeposits] = await Promise.all([
        Transaction.aggregate([
          { $match: depositMatch },
          {
            $group: {
              _id: "$userId",
              totalAmount: { $sum: "$amount" },
            },
          },
        ]),
        Transaction.aggregate([
          {
            $match: {
              userId: { $in: userObjectIds },
              type: "Deposit",
              status: "Completed",
            },
          },
          { $sort: { createdAt: 1 } },
          {
            $group: {
              _id: "$userId",
              firstDeposit: { $first: "$createdAt" },
              firstAmount: { $first: "$amount" },
            },
          },
        ]),
      ]);

      const depositAccounts = depositData.length;
      const depositAmount = depositData.reduce(
        (sum, u) => sum + u.totalAmount,
        0
      );

      const newDepositAccounts = firstDeposits.filter((d) => {
        if (!targetDate) return false;
        const dDate = new Date(d.firstDeposit);
        dDate.setUTCHours(0, 0, 0, 0);
        return dDate.getTime() === targetDate.getTime();
      }).length;

      const firstDepositAmount = targetDate
        ? firstDeposits
            .filter((d) => {
              const dDate = new Date(d.firstDeposit);
              dDate.setUTCHours(0, 0, 0, 0);
              return dDate.getTime() === targetDate.getTime();
            })
            .reduce((sum, d) => sum + d.firstAmount, 0)
        : 0;

      // ✅ Bet Aggregation from Bet collection
      const betMatch = {
        userId: { $in: userObjectIds },
      };

      if (targetDate) {
        betMatch.createdAt = { $gte: targetDate, $lt: nextDate };
      }

      const betData = await Bet.aggregate([
        { $match: betMatch },
        {
          $group: {
            _id: "$userId",
            totalAmount: { $sum: "$betAmount" },
          },
        },
      ]);

      const betAccounts = betData.length;
      const betAmount = betData.reduce((sum, u) => sum + u.totalAmount, 0);

      return {
        depositAccounts,
        depositAmount,
        betAccounts,
        betAmount,
        newDepositAccounts,
        firstDepositAmount,
      };
    };

    const summary = await aggregateStats(subordinateIds);

    res.json(summary);
  } catch (err) {
    console.error("Error in team summary:", err);
    res.status(500).json({ error: err.message });
  }
});
// GET /api/subordinate-team-stats/:parentId?date=YYYY-MM-DD
router.get("/subordinate-team-stats-daily/:parentId", async (req, res) => {
  try {
    const parentId = req.params.parentId;
    const { date } = req.query;

    // Set start and end of the day in UTC
    const startOfDay = date
      ? new Date(date + "T00:00:00.000Z")
      : new Date(new Date().setUTCHours(0, 0, 0, 0));
    const endOfDay = new Date(startOfDay);
    endOfDay.setUTCHours(23, 59, 59, 999);

    // Get direct children
    const directNode = await UserChild.findOne({ parentId });
    const directIds =
      directNode?.children.map((c) => c.childId.toString()) || [];

    // Build full user-child map to traverse tree
    const allTeamNode = await UserChild.find({});
    const getTeamChildren = (rootId, allLinks) => {
      const idMap = new Map(); // parentId => [childIds]
      for (const link of allLinks) {
        const pid = link.parentId.toString();
        if (!idMap.has(pid)) idMap.set(pid, []);
        const children = link.children.map((c) => c.childId.toString());
        idMap.get(pid).push(...children);
      }

      const visited = new Set();
      const result = new Set();

      const dfs = (currentId) => {
        const children = idMap.get(currentId) || [];
        for (const childId of children) {
          if (!visited.has(childId)) {
            visited.add(childId);
            result.add(childId);
            dfs(childId); // recursive
          }
        }
      };

      dfs(rootId.toString());
      return Array.from(result);
    };

    // All team children (direct + indirect)
    const allTeamChildren = getTeamChildren(parentId, allTeamNode).map(String);

    // Shared function to compute stats
    const aggregateDepositStats = async (userIds) => {
      if (!userIds.length)
        return {
          registrationAccounts: 0,
          depositAccounts: 0,
          depositAmount: 0,
          newDepositAccounts: 0,
        };

      const [depositData, firstDeposits, registeredUsers] = await Promise.all([
        // Total deposit amounts for the day
        Transaction.aggregate([
          {
            $match: {
              userId: { $in: userIds.map((id) => new ObjectId(id)) },
              type: "Deposit",
              status: "Completed",
              createdAt: { $gte: startOfDay, $lte: endOfDay },
            },
          },
          {
            $group: {
              _id: "$userId",
              totalAmount: { $sum: "$amount" },
            },
          },
        ]),
        // First-time deposits
        Transaction.aggregate([
          {
            $match: {
              userId: { $in: userIds.map((id) => new ObjectId(id)) },
              type: "Deposit",
              status: "Completed",
            },
          },
          { $sort: { createdAt: 1 } },
          {
            $group: {
              _id: "$userId",
              firstDeposit: { $first: "$createdAt" },
            },
          },
        ]),
        // Users registered today
        User.find({
          _id: { $in: userIds.map((id) => new ObjectId(id)) },
          createdAt: { $gte: startOfDay, $lte: endOfDay },
        }).select("_id"),
      ]);

      const depositAccounts = depositData.length;
      const depositAmount = depositData.reduce(
        (sum, u) => sum + u.totalAmount,
        0
      );
      const newDepositAccounts = firstDeposits.filter((d) => {
        const created = new Date(d.firstDeposit);
        return created >= startOfDay && created <= endOfDay;
      }).length;

      return {
        registrationAccounts: registeredUsers.length,
        depositAccounts,
        depositAmount,
        newDepositAccounts,
      };
    };

    // Get stats for direct and full team (includes direct + indirect)
    const [directStats, teamStats] = await Promise.all([
      aggregateDepositStats(directIds),
      aggregateDepositStats(allTeamChildren),
    ]);

    res.json({
      directSubordinates: {
        totalSubordinates: directIds.length,
        ...directStats,
      },
      teamSubordinates: {
        totalSubordinates: allTeamChildren.length,
        ...teamStats,
      },
    });
  } catch (err) {
    console.error("Team stats error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
