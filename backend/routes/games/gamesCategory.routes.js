const express = require("express");
const router = express.Router();
const upload = require("../../config/multerConfig"); // Multer configuration
const gameCategoryController = require("../../controllers/games/games.controller");
const {
  adminMiddleware,
  authMiddleware,
} = require("../../middleware/authMiddleware");

// Create new Category
router.post(
  "/category",
  authMiddleware, // Auth middleware to check if the user is authenticated
  adminMiddleware, // Admin middleware to check if the user is an admin
  upload.single("categoryImage"), // Multer middleware to handle image upload
  gameCategoryController.createCategory
);

// Get all Categories
router.get("/categories", gameCategoryController.getCategories);

// Add a Game to a Category
router.post(
  "/category/:categoryId/game",
  authMiddleware, // Auth middleware to check if the user is authenticated
  adminMiddleware, // Admin middleware to check if the user is an admin
  upload.single("gameImage"), // Multer middleware to handle image upload
  gameCategoryController.addGameToCategory
);

// Update Category (Name/Image/Status)
router.put(
  "/category/:categoryId",
  authMiddleware, // Auth middleware to check if the user is authenticated
  adminMiddleware, // Admin middleware to check if the user is an admin
  upload.single("categoryImage"), // Multer middleware to handle image upload
  gameCategoryController.updateCategory
);

router.put(
  "/category/:categoryId/game/:gameId/status",
  authMiddleware,
  adminMiddleware,
  gameCategoryController.updateGameStatus
);

// Delete Category
router.delete(
  "/category/:categoryId",
  authMiddleware, // Auth middleware to check if the user is authenticated
  adminMiddleware, // Admin middleware to check if the user is an admin
  gameCategoryController.deleteCategory
);

// Delete a Game from a Category
router.delete(
  "/category/:categoryId/game/:gameId",
  authMiddleware, // Auth middleware to check if the user is authenticated
  adminMiddleware, // Admin middleware to check if the user is an admin
  gameCategoryController.deleteGameFromCategory
);

module.exports = router;
