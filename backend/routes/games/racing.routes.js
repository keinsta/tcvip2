const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const CarRaceGame = require("../../models/Games/RacingGame");

// Get paginated race history by mode
router.get("/history/:mode", async (req, res) => {
  const { mode } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  try {
    const history = await CarRaceGame.find({ mode })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-bets");

    const totalRecords = await CarRaceGame.countDocuments({ mode });

    res.json({
      history,
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords,
    });
  } catch (error) {
    console.error("Error fetching car race history:", error);
    res.status(500).json({ error: "Failed to fetch race history" });
  }
});

// Get user-specific betting history
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
          rankings: 1,
          firstPlace: 1,
          oddEven: 1,
          bigSmall: 1,
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
      CarRaceGame.aggregate(pipeline),
      CarRaceGame.aggregate(totalCountPipeline),
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
    console.error("Error fetching user race history:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;
