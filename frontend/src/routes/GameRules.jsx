import React from "react";
import { Routes, Route } from "react-router-dom";

import Rules from "../pages/rules/GameRules";
const GameRules = () => {
  return (
    <Routes>
      <Route path="/:gameName" element={<Rules />} />
    </Routes>
  );
};

export default GameRules;
