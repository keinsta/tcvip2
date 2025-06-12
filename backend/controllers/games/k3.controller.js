const K3GameRound = require("../../models/Games/K3Game");
const GameRevenue = require("../../models/GameRevenue");
const User = require("../../models/User");
const Bet = require("../../models/Bet");

const { rollDice, evaluateBets } = require("../../utils/k3/diceUtils");

const { v4: uuidv4 } = require("uuid");

const INTERVALS = {
  "30s": 30 * 1000,
  "1min": 60 * 1000,
  "3min": 3 * 60 * 1000,
  "5min": 5 * 60 * 1000,
};

const activeBets = {
  "30s": [],
  "1min": [],
  "3min": [],
  "5min": [],
};

const generateRoundId = async () => {
  const now = new Date();
  const shortDate = now
    .toISOString()
    .slice(2, 10) // Get YY-MM-DD
    .replace(/-/g, ""); // => "250511"

  // Find latest round for today
  const lastBet = await K3GameRound.findOne({
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

const configureK3Sockets = (io) => {
  const raceNamespace = io.of("/game/k3");

  raceNamespace.on("connection", (socket) => {
    // console.log("Client connected:", socket.id);

    socket.on("place_bet", async (data) => {
      const { mode, userId, betAmount } = data;
      if (!INTERVALS[mode]) return;

      const user = await User.findById(userId);
      user.exp += betAmount;
      await user.save();

      // ✅ Create a GameRevenue entry
      const serviceFee = betAmount * 0.02; // 2% service fee
      const revenueData = {
        gameName: "K3",
        userId,
        userUID: user.uid,
        betAmount,
        serviceFee,
      };

      await GameRevenue.create(revenueData); // Save the revenue data

      activeBets[mode].push({
        ...data,
        socketId: socket.id,
        result: "Pending",
        winningAmount: 0,
      });
    });

    socket.on("disconnect", () => {
      // console.log("Client disconnected:", socket.id);
    });
  });

  // Handle intervals per game mode
  for (const mode of Object.keys(INTERVALS)) {
    setInterval(async () => {
      const roundId = await generateRoundId();
      const bets = activeBets[mode];

      let timeLeft = INTERVALS[mode] / 1000;
      const tickTimer = setInterval(() => {
        if (timeLeft <= 0) {
          clearInterval(tickTimer);
        } else {
          raceNamespace.emit("timer_tick", { mode, timeLeft });
          timeLeft--;
        }
      }, 1000);

      // console.log(`[${mode}] Running round:`, roundId);

      if (bets.length === 0) {
        // console.log(`[${mode}] No bets placed this round.`);
        activeBets[mode] = [];
        return;
      }

      const dice = rollDice();
      const { results, sum } = evaluateBets(bets, dice);

      const isTriple = dice[0] === dice[1] && dice[1] === dice[2];
      const oddEven = sum % 2 === 0 ? "Even" : "Odd";
      const bigSmall = !isTriple ? (sum >= 11 ? "Big" : "Small") : null;

      // Save round to DB
      const newRound = new K3GameRound({
        roundId,
        mode,
        diceResult: dice,
        sum,
        bigSmall,
        oddEven,
        bets: results.map((r) => ({
          userId: r.userId,
          result: r.result,
          betAmount: r.betAmount,
          betType: r.betType,
          betValue: r.betValue,
          betOddEven: r.betOddEven,
          betBigSmall: r.betBigSmall,
          winningAmount: r.winningAmount,
        })),
      });

      await newRound.save();

      // Send results to users who bet
      for (const result of results) {
        const userSocket = raceNamespace.sockets.get(result.socketId);
        if (userSocket) {
          userSocket.emit("round_result", {
            mode,
            roundId,
            dice,
            sum,
            result,
          });
        }
      }

      activeBets[mode] = [];
    }, INTERVALS[mode]);
  }
};

module.exports = configureK3Sockets;
