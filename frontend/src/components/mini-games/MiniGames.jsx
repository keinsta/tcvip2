import React from "react";
import { images } from "../../assets/images/mini-games/index";

const MiniGames = () => {
  return (
    <div className="w-full max-w-[500px] grid grid-cols-3 gap-4 p-4">
      {Object.values(images).map((image, index) => (
        <div key={index} className="w-full h-full cursor-pointer">
          <img
            src={image}
            alt={`mini-game-${index}`}
            className="w-full h-full object-cover rounded-lg shadow-md"
          />
        </div>
      ))}
    </div>
  );
};

export default MiniGames;
