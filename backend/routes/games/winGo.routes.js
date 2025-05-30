const express = require("express");
const router = express.Router();
const WinGoGame = require("../../models/Games/WinGoGame");

// Get game history
router.get("/history/:mode", async (req, res) => {
  const { mode } = req.params;
  const page = parseInt(req.query.page) || 1; // Default to page 1
  const limit = 10; // Number of history records per page
  const skip = (page - 1) * limit;

  try {
    const history = await WinGoGame.find({ mode })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-bets");

    const totalRecords = await WinGoGame.countDocuments({ mode });

    res.json({
      history,
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch game history" });
  }
});

// Get user-specific betting history
const mongoose = require("mongoose");

router.get("/my-history/:userId", async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.params.userId); // 👈 convert to ObjectId
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const matchUserBets = { "bets.userId": userId };

    const pipeline = [
      { $match: matchUserBets },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          roundId: 1,
          mode: 1,
          drawnNumber: 1,
          color: 1,
          category: 1,
          createdAt: 1,
          __v: 1,
          bets: {
            $filter: {
              input: "$bets",
              as: "bet",
              cond: { $eq: ["$$bet.userId", userId] }, // 👈 match by ObjectId
            },
          },
        },
      },
    ];

    const totalCountPipeline = [{ $match: matchUserBets }, { $count: "count" }];

    const [history, totalResult] = await Promise.all([
      WinGoGame.aggregate(pipeline),
      WinGoGame.aggregate(totalCountPipeline),
    ]);

    const totalBets = totalResult[0]?.count || 0;
    const totalPages = Math.ceil(totalBets / limit);

    res.json({
      history,
      currentPage: page,
      totalPages,
      totalBets,
    });
  } catch (error) {
    console.error("Error fetching user bet history:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;
