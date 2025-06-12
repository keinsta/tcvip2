import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Info } from "lucide-react";

const gameRulesData = {
  WinGo30S: {
    title: "Win Go 30S",
    intro:
      "Every 0.5 minutes a draw is held, 2880 draws are held each day. If you spend 100 to trade, after deducting service fee 2%, contract amount : 98",
    gameplay: {
      "Single Number": [
        "Choose a single number to bet on. If the drawn number matches the bet number, it's considered a win; otherwise, it's a loss.",
      ],
      Red: [
        "Bet on red. If the drawn number is 0, 2, 4, 6, or 8, it's considered a win; otherwise, it's a loss. If the drawn number is 0, the odds are 1.5.",
      ],
      Green: [
        "Bet on green. If the drawn number is 1, 3, 5, 7, or 9, it's considered a win; otherwise, it's a loss. If the drawn number is 5, the odds are 1.5.",
      ],
      Purple: [
        "Bet on purple. If the drawn number is 0 or 5, it's considered a win; otherwise, it's a loss.",
      ],
      "Big/Small": [
        "If the drawn number is greater than or equal to 5, it's big; if it's less than or equal to 4, it's small.",
      ],
    },
  },
  WinGo1Min: {
    title: "Win Go 1Min",
    intro:
      "Every 1 minutes a draw is held, 1440 draws are held each day. If you spend 100 to trade, after deducting service fee 2%, contract amount : 98",
    gameplay: {
      "Single Number": [
        "Choose a single number to bet on. If the drawn number matches the bet number, it's considered a win; otherwise, it's a loss.",
      ],
      Red: [
        "Bet on red. If the drawn number is 0, 2, 4, 6, or 8, it's considered a win; otherwise, it's a loss. If the drawn number is 0, the odds are 1.5.",
      ],
      Green: [
        "Bet on green. If the drawn number is 1, 3, 5, 7, or 9, it's considered a win; otherwise, it's a loss. If the drawn number is 5, the odds are 1.5.",
      ],
      Purple: [
        "Bet on purple. If the drawn number is 0 or 5, it's considered a win; otherwise, it's a loss.",
      ],
      "Big/Small": [
        "If the drawn number is greater than or equal to 5, it's big; if it's less than or equal to 4, it's small.",
      ],
    },
  },
  WinGo3Min: {
    title: "Win Go 3Min",
    intro:
      "Every 3 minutes a draw is held, 480 draws are held each day. If you spend 100 to trade, after deducting service fee 2%, contract amount : 98",
    gameplay: {
      "Single Number": [
        "Choose a single number to bet on. If the drawn number matches the bet number, it's considered a win; otherwise, it's a loss.",
      ],
      Red: [
        "Bet on red. If the drawn number is 0, 2, 4, 6, or 8, it's considered a win; otherwise, it's a loss. If the drawn number is 0, the odds are 1.5.",
      ],
      Green: [
        "Bet on green. If the drawn number is 1, 3, 5, 7, or 9, it's considered a win; otherwise, it's a loss. If the drawn number is 5, the odds are 1.5.",
      ],
      Purple: [
        "Bet on purple. If the drawn number is 0 or 5, it's considered a win; otherwise, it's a loss.",
      ],
      "Big/Small": [
        "If the drawn number is greater than or equal to 5, it's big; if it's less than or equal to 4, it's small.",
      ],
    },
  },
  WinGo5Min: {
    title: "Win Go 5Min",
    intro:
      "Every 5 minutes a draw is held, 288 draws are held each day. If you spend 100 to trade, after deducting service fee 2%, contract amount : 98",
    gameplay: {
      "Single Number": [
        "Choose a single number to bet on. If the drawn number matches the bet number, it's considered a win; otherwise, it's a loss.",
      ],
      Red: [
        "Bet on red. If the drawn number is 0, 2, 4, 6, or 8, it's considered a win; otherwise, it's a loss. If the drawn number is 0, the odds are 1.5.",
      ],
      Green: [
        "Bet on green. If the drawn number is 1, 3, 5, 7, or 9, it's considered a win; otherwise, it's a loss. If the drawn number is 5, the odds are 1.5.",
      ],
      Purple: [
        "Bet on purple. If the drawn number is 0 or 5, it's considered a win; otherwise, it's a loss.",
      ],
      "Big/Small": [
        "If the drawn number is greater than or equal to 5, it's big; if it's less than or equal to 4, it's small.",
      ],
    },
  },
};

function GameRules() {
  const { gameName } = useParams();
  const navigate = useNavigate();
  const [selectedGame, setSelectedGame] = useState(gameName || "WinGo30S");

  useEffect(() => {
    if (gameName) setSelectedGame(gameName);
  }, [gameName]);

  const handleGameChange = (event) => {
    const newGame = event.target.value;
    setSelectedGame(newGame);
    navigate(`/rules/${newGame}`);
  };

  const rules = gameRulesData[selectedGame] || gameRulesData["WinGo30S"];

  return (
    <>
      {/* Header */}
      <div className="w-full h-[54px] bg-gradient-yellow-headers flex items-center justify-between px-4 shadow-md text-white">
        <div className="flex justify-center">
          <ArrowLeft
            className="mr-2 cursor-pointer"
            onClick={() => navigate(-1)}
          />
          <span className="text-lg">Game Rules</span>
        </div>
      </div>
      {/* Instructional Text */}
      <div className="text-sm sm:text-base rounded-b-md border border-yellow-600">
        <div className="flex items-start gap-2 p-3 rounded-b-md border border-yellow-600">
          <Info className="text-yellow-600 mt-0.5" size={20} />
          <span className="text-white">
            Please select the game rules you want to view.
          </span>
        </div>
        <div className="flex items-start gap-2 p-3 rounded-md border border-yellow-600">
          <Info className="text-yellow-600 mt-0.5" size={20} />
          <span className="text-white">
            Mastering the rules will double your profits.
          </span>
        </div>
      </div>
      <div className="max-w-3xl mx-auto p-4 text-white rounded-lg mb-24">
        {/* Game Selector */}
        <div className="mb-4 text-center flex items-center justify-center gap-2">
          <label className="block text-lg">Select Game:</label>
          <select
            className="px-4 py-2 bg-[#595959] text-white border border-gray-600 rounded-md focus:outline-none"
            value={selectedGame}
            onChange={handleGameChange}
          >
            {Object.keys(gameRulesData).map((key) => (
              <option key={key} value={key}>
                {gameRulesData[key].title}
              </option>
            ))}
          </select>
        </div>

        {/* Rules Display */}
        <motion.div
          key={selectedGame} // Triggers animation on change
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-[#595959] p-4 rounded-md shadow-md"
        >
          <h3 className="text-2xl font-semibold">{rules.title}</h3>
          <p className="mt-2 text-gray-300">{rules.intro}</p>

          <h4 className="mt-4 text-xl font-semibold">Gameplay:</h4>
          {Object.keys(rules.gameplay).map((category) => (
            <div key={category}>
              <h5 className="mt-2 text-sm font-semibold">{category}</h5>
              <ul className="list-disc pl-5 space-y-2">
                {rules.gameplay[category].map((rule, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 }}
                    className="text-gray-300 text-sm"
                  >
                    {rule}
                  </motion.li>
                ))}
              </ul>
            </div>
          ))}
        </motion.div>
      </div>
    </>
  );
}

export default GameRules;
