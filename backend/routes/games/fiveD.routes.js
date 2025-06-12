const express = require("express");
const mongoose = require("mongoose");
const FiveDGame = require("../../models/Games/FiveD");
const router = express.Router();

// GET /api/fiveD/history/:mode
router.get("/history/:mode", async (req, res) => {
  const { mode } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  try {
    const history = await FiveDGame.find({ mode })
      .sort({ drawTime: -1 })
      .skip(skip)
      .limit(limit)
      .select("-bets"); // Exclude bets

    const totalRecords = await FiveDGame.countDocuments({ mode });

    res.json({
      history,
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords,
    });
  } catch (err) {
    console.error("Failed to fetch 5D history:", err);
    res.status(500).json({ error: "Failed to fetch 5D game history" });
  }
});

// GET /api/fiveD/my-history/:userId
router.get("/my-history/:userId", async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.params.userId);
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const matchUserBets = { "bets.userId": userId };

    const pipeline = [
      { $match: matchUserBets },
      { $sort: { drawTime: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          roundId: 1,
          mode: 1,
          drawTime: 1,
          drawResult: 1,
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
      FiveDGame.aggregate(pipeline),
      FiveDGame.aggregate(totalCountPipeline),
    ]);

    const totalBets = totalResult[0]?.count || 0;

    res.json({
      history,
      currentPage: page,
      totalPages: Math.ceil(totalBets / limit),
      totalBets,
    });
  } catch (err) {
    console.error("Error fetching 5D user history:", err);
    res.status(500).json({ error: "Failed to fetch user bet history" });
  }
});

module.exports = router;
