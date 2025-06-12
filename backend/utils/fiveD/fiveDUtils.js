// Roll 5 digits (0-9) randomly for each draw
const rollFiveDigits = () => {
  const digits = [];
  for (let i = 0; i < 5; i++) {
    digits.push(Math.floor(Math.random() * 10));
  }
  return digits;
};

// Evaluate the bets based on the drawn digits and sum
const evaluateBets = (bets, digits, sum) => {
  return bets.map((bet) => {
    let result = "Lose";
    let winningAmount = 0;

    if (bet.position === "SUM") {
      // Check for sum-based bets (Low, High, Odd, Even)
      if (bet.sumType === "Low" && sum <= 22) {
        result = "Won";
        winningAmount = bet.betAmount * 2; // Example payout ratio
      } else if (bet.sumType === "High" && sum >= 23) {
        result = "Won";
        winningAmount = bet.betAmount * 2;
      } else if (bet.sumType === "Odd" && sum % 2 !== 0) {
        result = "Won";
        winningAmount = bet.betAmount * 2;
      } else if (bet.sumType === "Even" && sum % 2 === 0) {
        result = "Won";
        winningAmount = bet.betAmount * 2;
      }
    }

    // Check for individual digit-based bets (A-E)
    if (bet.position !== "SUM") {
      const index = ["A", "B", "C", "D", "E"].indexOf(bet.position);
      if (digits[index] === bet.number) {
        result = "Won";
        winningAmount = bet.betAmount * 10; // Example payout for exact match
      }
    }

    return {
      ...bet,
      result,
      winningAmount,
    };
  });
};

module.exports = { rollFiveDigits, evaluateBets };
