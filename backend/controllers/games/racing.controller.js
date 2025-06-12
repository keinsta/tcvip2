const CarRaceGame = require("../../models/Games/RacingGame");
const GameRevenue = require("../../models/GameRevenue");
const User = require("../../models/User");
const Bet = require("../../models/Bet");

const timers = {};
const countdowns = {};
const currentGameRounds = {};
const gameIntervals = {
  "30s": 30000,
  "1min": 60000,
  "3min": 180000,
  "5min": 300000,
};

// Generate Round ID
const generateRoundId = async () => {
  const now = new Date();
  const shortDate = now
    .toISOString()
    .slice(2, 10) // Get YY-MM-DD
    .replace(/-/g, ""); // => "250511"

  // Find latest round for today
  const lastBet = await CarRaceGame.findOne({
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

// Generate Race Result (1st to 3rd place randomly from 10 cars)
const generateRaceResult = () => {
  const shuffled = [...Array(10).keys()]
    .map((i) => i + 1)
    .sort(() => Math.random() - 0.5);
  return {
    rankings: shuffled.slice(0, 3), // Top 3
    firstPlace: shuffled[0],
    oddEven: shuffled[0] % 2 === 0 ? "Even" : "Odd",
    bigSmall: shuffled[0] <= 5 ? "Small" : "Big",
  };
};

// Process a Bet
const processRaceBet = (bet, result) => {
  let { betAmount, betValue, oddEven, bigSmall } = bet;
  const finalAmount = betAmount * 0.98; // Deduct 2% for system fee

  let resultStatus = "Lose"; // Default result is "Lose"
  let multiplier = 1;

  // Handling different bet types based on presence of oddEven or bigSmall
  if (oddEven) {
    // User bet on Odd/Even, check if it matches the result
    if (oddEven === result.oddEven) {
      resultStatus = "Won";
      multiplier = 2; // 2x payout for Odd/Even bet
    }
  } else if (bigSmall) {
    // User bet on Big/Small, check if it matches the result
    if (bigSmall === result.bigSmall) {
      resultStatus = "Won";
      multiplier = 2; // 2x payout for Big/Small bet
    }
  } else if (parseInt(betValue) === result.firstPlace) {
    // If there's no oddEven or bigSmall, it's a rank bet
    resultStatus = "Won";
    multiplier = 9; // 9x payout for exact winner
  }

  return {
    result: resultStatus,
    payoutAmount: resultStatus === "Won" ? finalAmount * multiplier : 0,
  };
};

// Start Race Timer
// Start Race Timer (Updated)
const startCarRaceTimer = (mode, io) => {
  if (timers[mode]) clearInterval(timers[mode]);

  let interval = gameIntervals[mode];
  let nextRoundEndTime = Date.now() + interval;

  timers[mode] = setInterval(async () => {
    const now = Date.now();
    const timeLeft = Math.max(0, Math.floor((nextRoundEndTime - now) / 1000));

    io.to(mode).emit("timerUpdate", {
      mode,
      timeLeft,
      endTime: nextRoundEndTime,
    });

    if (timeLeft <= 0) {
      const roundId = await generateRoundId(mode);
      const raceResult = generateRaceResult();

      currentGameRounds[mode] = {
        roundId,
        mode,
        ...raceResult,
      };

      // console.log(`🚗 New race created - Mode: ${mode}, Round: ${roundId}`);
      // console.log("🏁 Race Result:", raceResult);

      io.to(mode).emit("newRaceRound", currentGameRounds[mode]);
      io.to(mode).emit("currentRaceRound", {
        latestRace: currentGameRounds[mode],
        activeBet: true,
      });

      // Reset end time for the next round
      nextRoundEndTime = Date.now() + interval;
    }
  }, 1000);
};

// Setup Car Race Sockets
const configureCarRaceSockets = (io) => {
  const raceNamespace = io.of("/game/racing");

  raceNamespace.on("connection", (socket) => {
    // console.log("User connected to Car Race:", socket.id);

    socket.on("joinRaceMode", (mode) => {
      socket.join(mode);

      socket.emit("timerUpdate", {
        mode,
        timeLeft: countdowns[mode] || gameIntervals[mode] / 1000,
      });

      const latestRace = currentGameRounds[mode];

      if (latestRace) {
        socket.emit("currentRaceRound", { latestRace, activeBet: true });
      } else {
        socket.emit("checkRaceActive", {
          message: `⚠️ No active race found for mode: ${mode}`,
          activeBet: false,
        });
      }
    });

    socket.on("placeRaceBet", async (betData) => {
      const { userId, betAmount, oddEven, bigSmall, betValue, mode } = betData;
      // console.log(betData);

      if (
        !mode ||
        !userId ||
        !betAmount ||
        !oddEven ||
        !bigSmall ||
        !betValue
      ) {
        // console.log("⚠️ Invalid car race bet data:", betData);
        return;
      }

      if (!currentGameRounds[mode]) {
        // console.log("⚠️ No active round for race mode:", mode);
        return;
      }

      const game = currentGameRounds[mode];
      const betOutcome = processRaceBet(
        { betAmount, oddEven, bigSmall, betValue },
        game
      );

      const winningPrice =
        betOutcome.result === "Won" ? betOutcome.payoutAmount : 0;

      await CarRaceGame.updateOne(
        { roundId: game.roundId, mode },
        {
          $push: {
            bets: {
              userId,
              betAmount,
              oddEven,
              bigSmall,
              betValue,
              result: betOutcome.result,
              payoutAmount: betOutcome.payoutAmount,
              winningPrice,
            },
          },
          $set: {
            rankings: game.rankings,
            firstPlace: game.firstPlace,
            oddEven: game.oddEven,
            bigSmall: game.bigSmall,
          },
        },
        { upsert: true }
      );

      const user = await User.findById(userId);
      user.exp += betAmount;
      await user.save();

      // await Bet.create({
      //   userId,
      //   gameName: "Car Racing",
      //   roundId: game.roundId,
      //   mode,
      //   betAmount,
      //   // betColor: gameResult.color,
      //   // betCategory: gameResult.category,
      //   // betNumber,
      //   result: betOutcome.result,
      //   // payoutAmount: betOutcome.payoutAmount,
      //   // winningPrice,
      //   // drawnNumber: gameResult.drawnNumber,
      // });

      // ✅ Create a GameRevenue entry
      const serviceFee = betAmount * 0.02; // 2% service fee
      const revenueData = {
        gameName: "Car Racing",
        userId,
        userUID: user.uid,
        betAmount,
        serviceFee,
      };

      await GameRevenue.create(revenueData); // Save the revenue data

      socket.emit("raceBetResult", {
        roundId: game.roundId,
        ...betOutcome,
        raceResult: {
          rankings: game.rankings,
          firstPlace: game.firstPlace,
          oddEven: game.oddEven,
          bigSmall: game.bigSmall,
        },
      });
    });

    socket.on("leaveRaceMode", (mode) => {
      socket.leave(mode);
    });

    socket.on("disconnect", () => {
      // console.log("User disconnected from Car Race:", socket.id);
    });
  });

  // Start all timers once
  Object.keys(gameIntervals).forEach((mode) => {
    if (!timers[mode]) {
      startCarRaceTimer(mode, raceNamespace);
    }
  });
};

module.exports = { configureCarRaceSockets };
