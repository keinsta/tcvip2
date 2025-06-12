const GameCategory = require("../../models/Games/Games");
const cloudinary = require("../../config/cloudinaryConfig");
const fs = require("fs");

// Create new Category
exports.createCategory = async (req, res) => {
  try {
    const { categoryName } = req.body;
    let categoryImage = null;

    // If there's an image file, upload it to Cloudinary
    if (req.file) {
      const cloudinaryResult = await cloudinary.uploader.upload(req.file.path);
      categoryImage = cloudinaryResult.secure_url; // Get the secure URL of the uploaded image

      // Remove the file from the local filesystem after uploading
      fs.unlinkSync(req.file.path);
    }

    const newCategory = new GameCategory({ categoryName, categoryImage });
    await newCategory.save();
    res.status(201).json({
      success: true,
      message: "Category created",
      category: newCategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating category",
      error: error.message,
    });
  }
};

// Get all Categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await GameCategory.find();
    res.status(200).json({ success: true, categories });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching categories",
      error: error.message,
    });
  }
};

// Add a Game to a Category
exports.addGameToCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, status } = req.body;

    // console.log(categoryId, name, status);
    let gameImage = null;

    // If there's an image file, upload it to Cloudinary
    if (req.file) {
      const cloudinaryResult = await cloudinary.uploader.upload(req.file.path);
      gameImage = cloudinaryResult.secure_url; // Get the secure URL of the uploaded image

      // Remove the file from the local filesystem after uploading
      fs.unlinkSync(req.file.path);
    }

    const category = await GameCategory.findById(categoryId);
    if (!category)
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });

    category.games.push({ name, image: gameImage, status });
    await category.save();

    res.status(201).json({ success: true, message: "Game added", category });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding game",
      error: error.message,
    });
  }
};
// Update Game Status (Active/Inactive)
exports.updateGameStatus = async (req, res) => {
  try {
    const { categoryId, gameId } = req.params;

    const category = await GameCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const game = category.games.id(gameId);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: "Game not found",
      });
    }

    // Toggle the status
    game.status = game.status === "active" ? "inactive" : "active";

    await category.save();

    res.status(200).json({
      success: true,
      message: `Game status updated to ${game.status}`,
      updatedGame: game,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating game status",
      error: error.message,
    });
  }
};

// Update Category (Name/Image/Status)
exports.updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const updateData = req.body;
    let categoryImage = updateData.categoryImage;

    // If there's an image file, upload it to Cloudinary
    if (req.file) {
      const cloudinaryResult = await cloudinary.uploader.upload(req.file.path);
      categoryImage = cloudinaryResult.secure_url; // Get the secure URL of the uploaded image

      // Remove the file from the local filesystem after uploading
      fs.unlinkSync(req.file.path);
    }

    const updatedCategory = await GameCategory.findByIdAndUpdate(
      categoryId,
      { ...updateData, categoryImage }, // Update the category with new data
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Category updated",
      category: updatedCategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating category",
      error: error.message,
    });
  }
};

// Delete Category
exports.deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    await GameCategory.findByIdAndDelete(categoryId);
    res.status(200).json({ success: true, message: "Category deleted" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting category",
      error: error.message,
    });
  }
};

// Delete a Game from a Category
exports.deleteGameFromCategory = async (req, res) => {
  try {
    const { categoryId, gameId } = req.params;

    const category = await GameCategory.findById(categoryId);
    if (!category)
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });

    category.games = category.games.filter(
      (game) => game._id.toString() !== gameId
    );
    await category.save();

    res.status(200).json({ success: true, message: "Game deleted", category });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting game",
      error: error.message,
    });
  }
};
