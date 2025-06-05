const express = require("express");
const router = express.Router();
const punishmentController = require("../controllers/punishment.controller");

router.get("/get-all-punishments", punishmentController.getAllPunishments);
router.get(
  "/get-punishments-by-user/:userId",
  punishmentController.getPunishmentsByUser
);
router.post(
  "/create-punishments-for-user",
  punishmentController.createPunishment
);
router.patch(
  "/resolve-punishment-of-user/:userId",
  punishmentController.resolvePunishment
);

module.exports = router;
