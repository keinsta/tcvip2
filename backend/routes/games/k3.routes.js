const express = require("express");
const mongoose = require("mongoose");
const K3Game = require("../../models/Games/K3Game");
const router = express.Router();

// GET /api/k3/history/:mode
router.get("/history/:mode", async (req, res) => {
  const { mode } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  try {
    const history = await K3Game.find({ mode })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-bets"); // Exclude bets

    const totalRecords = await K3Game.countDocuments({ mode });

    res.json({
      history,
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch game history" });
  }
});

// GET /api/k3/my-history/:userId
router.get("/my-history/:userId", async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.params.userId);
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
          result: 1, // Assuming dice result
          sum: 1,
          createdAt: 1,
          bets: {
            $filter: {
              input: "$bets",
              as: "bet",
              cond: { $eq: ["$$bet.userId", userId] },
            },
          },
        },
      },
    ];

    const totalCountPipeline = [{ $match: matchUserBets }, { $count: "count" }];

    const [history, totalResult] = await Promise.all([
      K3Game.aggregate(pipeline),
      K3Game.aggregate(totalCountPipeline),
    ]);

    const totalBets = totalResult[0]?.count || 0;
    const totalPages = Math.ceil(totalBets / limit);

    res.json({
      history,
      currentPage: page,
      totalPages,
      totalBets,
    });
  } catch (err) {
    console.error("Error fetching user bet history:", err);
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;
