const rollDice = () => [
  Math.ceil(Math.random() * 6),
  Math.ceil(Math.random() * 6),
  Math.ceil(Math.random() * 6),
];

const evaluateBets = (bets, dice) => {
  const sum = dice.reduce((a, b) => a + b, 0);
  const results = [];
  const isTriple = dice[0] === dice[1] && dice[1] === dice[2];
  const counts = {};
  dice.forEach((d) => (counts[d] = (counts[d] || 0) + 1));
  const combinations = new Set([
    `${dice[0]}${dice[1]}`,
    `${dice[0]}${dice[2]}`,
    `${dice[1]}${dice[2]}`,
  ]);

  for (const bet of bets) {
    let win = false;
    let payout = 0;

    switch (bet.betType) {
      case "Sum":
        if (sum === bet.betValue) win = true;
        break;
      case "SingleDice":
        if (dice.includes(bet.betValue)) win = true;
        break;
      case "DoubleDice":
        if (counts[bet.betValue] >= 2) win = true;
        break;
      case "Triple":
        if (isTriple && dice[0] === bet.betValue) win = true;
        break;
      case "AllTriple":
        if (isTriple) win = true;
        break;
      case "TwoDiceCombination":
        if (
          combinations.has(`${bet.betValue[0]}${bet.betValue[1]}`) ||
          combinations.has(`${bet.betValue[1]}${bet.betValue[0]}`)
        )
          win = true;
        break;
    }

    const oddEvenMatch =
      (sum % 2 === 0 && bet.betOddEven === "Even") ||
      (sum % 2 === 1 && bet.betOddEven === "Odd");

    const bigSmallMatch =
      !isTriple &&
      ((sum >= 11 && bet.betBigSmall === "Big") ||
        (sum <= 10 && bet.betBigSmall === "Small"));

    const categoryBonus =
      (bet.betOddEven !== "None" && oddEvenMatch) ||
      (bet.betBigSmall !== "None" && bigSmallMatch);

    if (win || categoryBonus) {
      win = true;
      payout = bet.betAmount * (win && categoryBonus ? 2.5 : 2);
    }

    results.push({
      ...bet,
      result: win ? "Won" : "Lose",
      winningAmount: win ? payout : 0,
      matchedCategory: {
        oddEven: oddEvenMatch,
        bigSmall: bigSmallMatch,
        isTriple,
      },
    });
  }

  return { results, sum };
};

module.exports = { rollDice, evaluateBets };
