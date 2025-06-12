const { v4: uuidv4 } = require("uuid");
const FiveDGameRoundSchema = require("../../models/Games/FiveD");
const GameRevenue = require("../../models/GameRevenue");
const Bet = require("../../models/Bet");
const User = require("../../models/User");

const GAME_MODES = {
  "30s": 30,
  "1min": 60,
  "3min": 180,
  "5min": 300,
};

const activeRounds = {}; // { mode: { roundId, bets } }
const timers = {}; // { mode: countdown }

const generateRoundId = async () => {
  const now = new Date();
  const shortDate = now
    .toISOString()
    .slice(2, 10) // Get YY-MM-DD
    .replace(/-/g, ""); // => "250511"

  // Find latest round for today
  const lastBet = await FiveDGameRoundSchema.findOne({
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

function generateDrawNumber() {
  const digits = Array.from({ length: 5 }, () =>
    Math.floor(Math.random() * 10)
  );
  const sum = digits.reduce((a, b) => a + b, 0);
  return {
    number: digits.join(""),
    digits,
    sum,
  };
}
function getBigSmallOddEven(position, result) {
  const val =
    position === "SUM" ? result.sum : result.digits["ABCDE".indexOf(position)];

  const bigSmall =
    position === "SUM"
      ? val >= 23
        ? "Big"
        : "Small"
      : val >= 5
      ? "Big"
      : "Small";

  const oddEven = val % 2 === 0 ? "Even" : "Odd";

  return { bigSmall, oddEven };
}

function evaluateBet(bet, result) {
  const { position, type, number } = bet;
  const val =
    position === "SUM" ? result.sum : result.digits["ABCDE".indexOf(position)];

  switch (type) {
    case "Number":
      return val === number;
    case "Small":
      return val <= 4;
    case "Big":
      return val >= 5;
    case "Odd":
      return val % 2 === 1;
    case "Even":
      return val % 2 === 0;
    case "Low":
      return result.sum <= 22;
    case "High":
      return result.sum >= 23;
    default:
      return false;
  }
}

function calculatePayout(bet) {
  const base = bet.contractAmount;
  const multiplier = 1.9;
  return Math.floor(base * multiplier);
}

function startGameLoop(io, mode, interval) {
  const namespace = io.of("/game/fiveD");

  const startRound = async () => {
    const roundId = await generateRoundId();
    activeRounds[mode] = {
      roundId,
      bets: [],
    };

    let timer = interval;
    timers[mode] = timer;

    namespace.to(mode).emit("roundStart", { roundId, timer });

    const countdown = setInterval(async () => {
      timer--;
      timers[mode] = timer;
      namespace.to(mode).emit("timer", { timer });

      if (timer <= 0) {
        clearInterval(countdown);
        await finishRound(namespace, mode);
        startRound(); // start next round
      }
    }, 1000);
  };

  const finishRound = async (namespace, mode) => {
    const round = activeRounds[mode];
    const result = generateDrawNumber();

    const evaluatedBets = round.bets.map((bet) => {
      const won = evaluateBet(bet, result);
      const { bigSmall, oddEven } = getBigSmallOddEven(bet.position, result);

      return {
        ...bet,
        won,
        payout: won ? calculatePayout(bet) : 0,
        bigSmall,
        oddEven,
      };
    });

    if (evaluatedBets.length > 0) {
      try {
        await FiveDGameRoundSchema.create({
          roundId: round.roundId,
          mode,
          drawTime: new Date(),
          drawResult: {
            fullNumber: result.number,
            A: result.digits[0],
            B: result.digits[1],
            C: result.digits[2],
            D: result.digits[3],
            E: result.digits[4],
            sum: result.sum,
            bigSmall: result.sum >= 23 ? "Big" : "Small",
            oddEven: result.sum % 2 === 0 ? "Even" : "Odd",
          },
          bets: evaluatedBets,
        });
      } catch (err) {
        console.error("Mongo insert error:", err);
      }

      // 🔁 Send personal result only to users who placed a bet
      const groupedBySocket = {};

      for (const bet of evaluatedBets) {
        if (!groupedBySocket[bet.socketId]) {
          groupedBySocket[bet.socketId] = [];
        }
        groupedBySocket[bet.socketId].push(bet);
      }

      for (const socketId in groupedBySocket) {
        const socket = namespace.sockets.get(socketId);
        if (socket) {
          socket.emit("roundResult", {
            roundId: round.roundId,
            result: groupedBySocket[socketId],
          });
        }
      }
    }

    // 🔕 Do NOT emit anything to the room
  };

  startRound(); // Initialize first round
}

function configureFiveDSockets(io) {
  const namespace = io.of("/game/fiveD");

  // Start game loops for each mode
  Object.entries(GAME_MODES).forEach(([mode, interval]) => {
    startGameLoop(io, mode, interval);
  });

  namespace.on("connection", (socket) => {
    // console.log("User connected to /game/fiveD");

    // User selects game mode
    socket.on("joinMode", (mode) => {
      if (GAME_MODES[mode]) {
        Object.keys(GAME_MODES).forEach((m) => socket.leave(m)); // Leave all rooms
        socket.join(mode);

        const round = activeRounds[mode];
        if (round) {
          socket.emit("roundStart", {
            roundId: round.roundId,
            timer: timers[mode],
          });
        }
      }
    });

    // Handle bet placement
    socket.on("placeBet", async ({ mode, bet }) => {
      const round = activeRounds[mode];
      const timer = timers[mode];

      const user = await User.findById(bet.userId);
      user.exp += bet.amount;
      await user.save();

      // ✅ Create a GameRevenue entry
      const serviceFee = bet.amount * 0.02; // 2% service fee
      const revenueData = {
        gameName: "Five D",
        userId: bet.userId,
        userUID: user.uid,
        betAmount: bet.amount,
        serviceFee,
      };

      await GameRevenue.create(revenueData); // Save the revenue data

      if (round && timer > 3) {
        const finalBet = {
          ...bet,
          socketId: socket.id,
          userId: bet.userId, // ✅ Add this line
          contractAmount: bet.amount * 0.98,
          originalAmount: bet.amount,
        };
        round.bets.push(finalBet);
        socket.emit("betConfirmed", { roundId: round.roundId });
      } else {
        socket.emit("betRejected", { message: "Betting closed" });
      }
    });

    socket.on("disconnect", () => {
      // console.log("User disconnected from /game/fiveD");
    });
  });
}

module.exports = { configureFiveDSockets };
