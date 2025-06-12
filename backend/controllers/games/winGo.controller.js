const WinGoGame = require("../../models/Games/WinGoGame");
const GameRevenue = require("../../models/GameRevenue");
const Bet = require("../../models/Bet");
const User = require("../../models/User");

const timers = {}; // Store running timers
const countdowns = {}; // Store remaining countdowns for each mode
const currentGameRounds = {}; // Store ongoing game rounds per mode
const gameIntervals = {
  "30s": 30000,
  "1min": 60000,
  "3min": 180000,
  "5min": 300000,
};

// Generate Unique Round ID
const generateRoundId = async () => {
  const now = new Date();
  const shortDate = now
    .toISOString()
    .slice(2, 10) // Get YY-MM-DD
    .replace(/-/g, ""); // => "250511"

  // Find latest round for today
  const lastBet = await WinGoGame.findOne({
    roundId: { $regex: `^${shortDate}` },
  })
    .sort({ roundId: -1 }) // highest roundId first
    .exec();

  let nextSeq = 1;

  if (lastBet) {
    const lastRoundId = lastBet.roundId; // e.g., 2505110037
    const lastSeq = parseInt(lastRoundId.slice(6), 10); // get "0037" → 37
    nextSeq = lastSeq + 1;
  }

  const paddedSeq = String(nextSeq).padStart(4, "0"); // "0001", "0002", etc.
  return `${shortDate}${paddedSeq}`; // e.g., "2505110001"
};

// Generate Game Result
const generateGameResult = () => {
  const drawnNumber = Math.floor(Math.random() * 10);
  let color = [0, 2, 4, 6, 8].includes(drawnNumber) ? "Red" : "Green";
  if ([0, 5].includes(drawnNumber)) color = "Purple";
  const category = drawnNumber >= 5 ? "Big" : "Small";

  return { drawnNumber, color, category };
};

// Start WinGo Timer for a Mode
const startWinGoTimer = (mode, io) => {
  if (timers[mode]) clearInterval(timers[mode]);

  countdowns[mode] = gameIntervals[mode] / 1000;

  timers[mode] = setInterval(async () => {
    if (countdowns[mode] > 0) {
      countdowns[mode] -= 1;
      io.to(mode).emit("timerUpdate", { mode, timeLeft: countdowns[mode] });
    } else {
      countdowns[mode] = gameIntervals[mode] / 1000;

      // ✅ Generate a new round
      const roundId = await generateRoundId();
      const gameResult = generateGameResult();

      currentGameRounds[mode] = {
        roundId,
        mode,
        drawnNumber: gameResult.drawnNumber,
        color: gameResult.color,
        category: gameResult.category,
      };

      io.to(mode).emit("newBetRound", currentGameRounds[mode]);
      // console.log(`🔹 [NEW BET ROUND] Mode: ${mode} | Round ID: ${roundId}`);

      // After the round ends, send the activeBet status to all users in the mode
      const latestGame = currentGameRounds[mode];
      if (latestGame) {
        io.to(mode).emit("currentBetRound", { latestGame, activeBet: true });
      } else {
        io.to(mode).emit("checkBetActive", {
          message: `⚠️ No active game found for mode: ${mode}`,
          activeBet: false,
        });
      }
    }
  }, 1000);
};

// Process Bet Outcome **Instantly**
const processBet = (bet, game) => {
  let { betAmount, betColor, betCategory, betNumber } = bet;

  // Deduct 2% service fee
  const finalAmount = betAmount * 0.98;

  let result = "Lose";
  let payoutMultiplier = 1;

  // **Single Number Bet**
  if (betNumber !== undefined && betNumber === game.drawnNumber) {
    result = "Won";
    payoutMultiplier = 9; // Single number bet has 9x payout
  }
  // **Red Bet**
  else if (
    betColor &&
    betColor === "Red" &&
    [0, 2, 4, 6, 8].includes(game.drawnNumber)
  ) {
    result = "Won";
    payoutMultiplier = game.drawnNumber === 0 ? 1.5 : 2; // Purple number (0) pays 1.5x, others pay 2x
  }
  // **Green Bet**
  else if (
    betColor &&
    betColor === "Green" &&
    [1, 3, 5, 7, 9].includes(game.drawnNumber)
  ) {
    result = "Won";
    payoutMultiplier = game.drawnNumber === 5 ? 1.5 : 2; // Green number (5) pays 1.5x, others pay 2x
  }
  // **Purple Bet**
  else if (
    betColor &&
    betColor === "Purple" &&
    [0, 5].includes(game.drawnNumber)
  ) {
    result = "Won";
    payoutMultiplier = 1.5; // Purple pays 1.5x
  }
  // **Big/Small Bet**
  else if (betCategory && betCategory === "Big" && game.drawnNumber >= 5) {
    result = "Won";
    payoutMultiplier = 2;
  } else if (betCategory && betCategory === "Small" && game.drawnNumber <= 4) {
    result = "Won";
    payoutMultiplier = 2;
  }

  return {
    result,
    payoutAmount: result === "Won" ? finalAmount * payoutMultiplier : 0,
  };
};

// Configure Socket.IO for WinGo
const configureWinGoSockets = (io) => {
  const winGoNamespace = io.of("/game/wingo");

  winGoNamespace.on("connection", (socket) => {
    // console.log("User connected to WinGo:", socket.id);

    socket.on("joinGameMode", async (mode) => {
      socket.join(mode);
      // console.log(`User joined WinGo mode: ${mode}`);

      socket.emit("timerUpdate", {
        mode,
        timeLeft: countdowns[mode] || gameIntervals[mode] / 1000,
      });

      // ✅ Send latest game round
      const latestGame = currentGameRounds[mode];

      if (latestGame) {
        socket.emit("currentBetRound", { latestGame, activeBet: true });
      } else {
        // console.log(`⚠️ No active game found for mode: ${mode}`);
        socket.emit("checkBetActive", {
          message: `⚠️ No active game found for mode: ${mode}`,
          activeBet: false,
        });
      }
    });

    // ✅ Instant Bet Processing
    socket.on("placeBet", async (betData) => {
      const { mode, userId, betAmount, betColor, betCategory, betNumber } =
        betData;

      if (!mode || !userId || !betAmount) {
        console.log("⚠️ Invalid bet data received:", betData);
        return;
      }

      // console.log(`🎲 User ${userId} placed a bet in ${mode}:`, betData);
      if (!currentGameRounds[mode]) {
        console.log("⚠️ No active round found for this bet.");
        return;
      }

      const roundId = currentGameRounds[mode].roundId;
      const gameResult = {
        drawnNumber: currentGameRounds[mode].drawnNumber,
        color: currentGameRounds[mode].color,
        category: currentGameRounds[mode].category,
      };

      // ✅ Process bet immediately
      const betOutcome = processBet(
        { betAmount, betColor, betCategory, betNumber },
        gameResult
      );
      // Calculate the winningPrice (if user won, it's the payoutAmount, if user lost, it's 0)
      const winningPrice =
        betOutcome.result === "Won" ? betOutcome.payoutAmount : 0;

      // ✅ Store bet immediately
      await WinGoGame.updateOne(
        { roundId, mode },
        {
          $push: {
            bets: {
              userId,
              betAmount,
              betColor,
              betCategory,
              betNumber,
              result: betOutcome.result,
              payoutAmount: betOutcome.payoutAmount,
              winningPrice,
            },
          },
          $set: {
            drawnNumber: gameResult.drawnNumber,
            color: gameResult.color,
            category: gameResult.category,
          },
        },
        { upsert: true }
      );

      // ✅ Also store the bet in the general Bet collection
      // await Bet.create({
      //   userId,
      //   gameName: "WinGo",
      //   roundId,
      //   mode,
      //   betAmount,
      //   betColor: gameResult.color,
      //   betCategory: gameResult.category,
      //   betNumber,
      //   result: betOutcome.result,
      //   payoutAmount: betOutcome.payoutAmount,
      //   winningPrice,
      //   drawnNumber: gameResult.drawnNumber,
      // });

      const user = await User.findById(userId);
      user.exp += betAmount;
      await user.save();

      // ✅ Create a GameRevenue entry
      const serviceFee = betAmount * 0.02; // 2% service fee
      const revenueData = {
        gameName: "WinGo",
        userId,
        userUID: user.uid,
        betAmount,
        serviceFee,
      };

      await GameRevenue.create(revenueData); // Save the revenue data

      // ✅ Send result instantly
      socket.emit("betResult", { roundId, ...betOutcome, gameResult });

      // console.log(
      //   `✅ Bet processed instantly! User ${userId} ${betOutcome.result} with payout: ${betOutcome.payoutAmount}`
      // );
    });

    socket.on("leaveGameMode", (mode) => {
      socket.leave(mode);
      // console.log(`User left WinGo mode: ${mode}`);
    });

    socket.on("disconnect", () => {
      // console.log("User disconnected from WinGo:", socket.id);
    });
  });

  // ✅ Start all game mode timers **only once**
  Object.keys(gameIntervals).forEach((mode) => {
    if (!timers[mode]) {
      startWinGoTimer(mode, winGoNamespace);
    }
  });
};

module.exports = { configureWinGoSockets };
