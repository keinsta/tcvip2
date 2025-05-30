const mongoose = require("mongoose");

const GameSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  status: {
    type: String,
    enum: ["active", "inactive", "suspended"],
    default: "active",
  },
});

const GameCategorySchema = new mongoose.Schema({
  categoryName: { type: String, required: true },
  categoryImage: { type: String, required: true },
  games: [GameSchema],
});

module.exports = mongoose.model("GameCategory", GameCategorySchema);
