const axios = require("axios");
const TrxWinGoGame = require("../../models/Games/TrxWinGoGame");
const GameRevenue = require("../../models/GameRevenue");
const User = require("../../models/User");
const Bet = require("../../models/Bet");
const crypto = require("crypto");
const timers = {}; // Store running timers
const countdowns = {}; // Store remaining countdowns for each mode
const currentGameRounds = {}; // Store ongoing game rounds per mode
const gameIntervals = {
  "1min": 60000, // 1 minute
};

// Generate Round ID
const generateRoundId = async () => {
  const now = new Date();
  const shortDate = now
    .toISOString()
    .slice(2, 10) // Get YY-MM-DD
    .replace(/-/g, ""); // => "250511"

  // Find latest round for today
  const lastBet = await TrxWinGoGame.findOne({
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

// Fetch TRX Block Hash from TRON API
const getTRXBlockHash = async () => {
  try {
    // Generate a random 64-character hexadecimal hash
    const randomHash = crypto.randomBytes(32).toString("hex");

    // Generate a random block number between 60,000,000 and 70,000,000
    const randomBlockNumber =
      Math.floor(Math.random() * 10_000_000) + 60_000_000;

    return {
      hash: randomHash,
      sequentialNumber: randomBlockNumber,
    };
  } catch (error) {
    console.error("Error generating mock TRX block hash:", error);
    return null;
  }
};

// Generate Game Result Based on Block Hash
// Extract only the last digit from the hex hash that falls within 0–9
const generateGameResult = (blockHash) => {
  // Find the last character in the hash that is a number (0–9)
  const numericDigits = blockHash.match(/[0-9]/g);
  const drawnDigit = numericDigits
    ? parseInt(numericDigits[numericDigits.length - 1])
    : Math.floor(Math.random() * 10);

  let color = [0, 2, 4, 6, 8].includes(drawnDigit) ? "Red" : "Green";
  if ([0, 5].includes(drawnDigit)) color = "Purple";

  const category = drawnDigit >= 5 ? "Big" : "Small";

  return {
    drawnNumber: drawnDigit,
    color,
    category,
  };
};

// Start TRX WinGo Timer for Real-Time Sync with System Time
const startTrxWinGoTimer = (mode, io) => {
  if (timers[mode]) clearInterval(timers[mode]);

  // Calculate the time until the start of the next minute
  const updateCountdown = () => {
    const now = new Date();
    const nextMinute = new Date(now.getTime() + (60 - now.getSeconds()) * 1000); // Time for next full minute
    const remainingTime = (nextMinute.getTime() - now.getTime()) / 1000;

    countdowns[mode] = remainingTime;

    io.to(mode).emit("timerUpdate", { mode, timeLeft: countdowns[mode] });
  };

  // Run this to keep track of time and trigger events at the start of the next minute
  timers[mode] = setInterval(async () => {
    updateCountdown();

    // If we're close to the next minute, set a timeout to generate a new round
    const now = new Date();
    const nextMinute = new Date(now.getTime() + (60 - now.getSeconds()) * 1000);
    const timeToNextMinute = nextMinute.getTime() - now.getTime();

    if (timeToNextMinute <= 1000) {
      // Within 1 second of the next minute
      // Fetch TRX Block Hash and generate the new round
      const blockDetails = await getTRXBlockHash();
      if (blockDetails) {
        const { hash, sequentialNumber } = blockDetails;
        const gameResult = generateGameResult(hash);
        const roundId = await generateRoundId();

        currentGameRounds[mode] = {
          roundId,
          mode,
          drawnNumber: gameResult.drawnNumber,
          color: gameResult.color,
          category: gameResult.category,
          tronBlockDetails: {
            hash,
            sequentialNumber,
          },
        };

        // console.log(
        //   `🔹 TRX Win Go [NEW BET ROUND] Mode: ${mode} | Round ID: ${roundId}`
        // );
        // console.log("Generated Game Result:", gameResult);

        // Emit the new bet round to all players in this mode
        io.to(mode).emit("newBetRound", currentGameRounds[mode]);
      } else {
        console.log("⚠️ Failed to fetch TRX Block Hash.");
      }

      // Reset countdown after each minute
      updateCountdown();
    }
  }, 1000); // Check every second to sync with real-time minute
};

// Configure Socket.IO for TrxWinGo
const configureTrxWinGoSockets = (io) => {
  const trxWinGoNamespace = io.of("/game/trxwingo");

  trxWinGoNamespace.on("connection", (socket) => {
    // console.log("User connected to Trx WinGo:", socket.id);

    socket.on("joinGameMode", async (mode) => {
      socket.join(mode);
      // console.log(`User joined Trx WinGo mode: ${mode}`);

      socket.emit("timerUpdate", {
        mode,
        timeLeft: countdowns[mode] || gameIntervals[mode] / 1000,
      });

      const latestGame = currentGameRounds[mode];
      if (latestGame) {
        socket.emit("currentBetRound", { latestGame, activeBet: true });
      } else {
        socket.emit("checkBetActive", {
          message: `⚠️ No active game found for mode: ${mode}`,
          activeBet: false,
        });
      }
    });

    // Instant Bet Processing
    socket.on("placeBet", async (betData) => {
      // console.log("Received Bet Data:", betData);

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

      // Process the bet logic and emit result
      const betOutcome = processBet(
        { betAmount, betColor, betCategory, betNumber },
        gameResult
      );
      // console.log("Bet Outcome:", betOutcome);

      // Store bet immediately
      await TrxWinGoGame.updateOne(
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
              winningPrice: betOutcome.winningPrice,
            },
          },
          $set: {
            drawnNumber: gameResult.drawnNumber,
            color: gameResult.color,
            category: gameResult.category,
            tronBlockDetails: currentGameRounds[mode]?.tronBlockDetails || {},
          },
        },
        { upsert: true }
      );

      const user = await User.findById(userId);
      user.exp += betAmount;
      await user.save();

      // await Bet.create({
      //   userId,
      //   gameName: "Trx WIn Go",
      //   roundId,
      //   mode,
      //   betAmount,
      //   betColor: gameResult.color,
      //   betCategory: gameResult.category,
      //   betNumber,
      //   result: betOutcome.result,
      //   payoutAmount: betOutcome.payoutAmount,
      //   winningPrice: betOutcome.winningPrice,
      //   drawnNumber: gameResult.drawnNumber,
      // });

      // ✅ Create a GameRevenue entry
      const serviceFee = betAmount * 0.02; // 2% service fee
      const revenueData = {
        gameName: "TRXWinGo",
        userId,
        userUID: user.uid,
        betAmount,
        serviceFee,
      };

      await GameRevenue.create(revenueData); // Save the revenue data

      // Send result instantly
      socket.emit("betResult", {
        roundId,
        ...betOutcome,
        gameResult,
        tronBlockDetails: currentGameRounds[mode]?.tronBlockDetails || {},
      });
    });

    socket.on("leaveGameMode", (mode) => {
      socket.leave(mode);
      // console.log(`User left Trx WinGo mode: ${mode}`);
    });

    socket.on("disconnect", () => {
      // console.log("User disconnected from Trx WinGo:", socket.id);
    });
  });

  // Start the 1-minute game timer
  if (!timers["1min"]) {
    startTrxWinGoTimer("1min", trxWinGoNamespace);
  }
};

// Process bet outcome based on bet data and game result
const processBet = (betData, gameResult) => {
  const { betAmount, betColor, betCategory, betNumber } = betData;
  const { drawnNumber, color, category } = gameResult;

  let result = "Lost";
  let winningPrice = 0;

  if (betNumber === drawnNumber) {
    result = "Won";
    winningPrice = betAmount * 10;
  } else if (betColor === color) {
    result = "Won";
    winningPrice = betAmount * 2;
  } else if (betCategory === category) {
    result = "Won";
    winningPrice = betAmount * 1.5;
  }

  return { result, winningPrice };
};

module.exports = { configureTrxWinGoSockets };
