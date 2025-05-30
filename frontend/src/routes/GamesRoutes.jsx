import React from "react";
import { Routes, Route } from "react-router-dom";

import WinGoGame from "../pages/games/WinGo";
import TrxWinGoGame from "../pages/games/TrxWinGo";
import RacingGame from "../pages/games/Racing";
import K3Game from "../pages/games/K3";
import FiveDGame from "../pages/games/FiveD";
const GamesRoutes = () => {
  return (
    <Routes>
      <Route path="win-go" element={<WinGoGame />} />
      <Route path="trx-win-go" element={<TrxWinGoGame />} />
      <Route path="racing" element={<RacingGame />} />
      <Route path="k3" element={<K3Game />} />
      <Route path="five-d" element={<FiveDGame />} />
    </Routes>
  );
};

export default GamesRoutes;
