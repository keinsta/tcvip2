import React, { useEffect, useState, useRef } from "react";
import {
  getCategories,
  createCategory,
  addGameToCategory,
  updateGameStatus,
  deleteCategory,
  deleteGameFromCategory,
} from "../services/gamesServices";
import toast from "react-hot-toast";

const GameCategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const categoryFileInputRef = useRef(null);
  const gameFileInputRef = useRef(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryImage, setCategoryImage] = useState(null);
  const [gameName, setGameName] = useState("");
  const [gameImage, setGameImage] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [status, setStatus] = useState("active");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch categories and games on page load
  useEffect(() => {
    const fetchCategories = async () => {
      const data = await getCategories();
      setCategories(data.categories);
    };
    fetchCategories();
    // window.location.reload();
  }, []);

  // Handle category creation
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    const result = await createCategory({ categoryName, categoryImage });
    if (result.success) {
      setCategoryName("");
      setCategoryImage(null);
      setCategories([...categories, result.category]);

      if (categoryFileInputRef.current) {
        categoryFileInputRef.current.value = "";
      }
      toast.success("Category Added Successfully!");
    }
  };

  // Handle adding game to category
  const handleAddGameToCategory = async (e) => {
    e.preventDefault();
    const result = await addGameToCategory(selectedCategoryId, {
      gameName,
      gameImage,
      status,
    });

    if (result.success) {
      toast.success("Game Added Successfully!");
      setGameName("");
      setGameImage(null);
      if (gameFileInputRef.current) {
        gameFileInputRef.current.value = "";
      }
      const updatedCategories = categories.map((category) =>
        category._id === selectedCategoryId
          ? { ...category, games: [...category.games, result.game] }
          : category
      );
      setCategories(updatedCategories);
      window.location.reload();
    }
  };

  const handleActivateGame = async (gameId) => {
    if (!selectedCategory) return;

    try {
      await updateGameStatus(selectedCategory._id, gameId, "active");
      toast.success("Game activated successfully!");

      // Update UI locally without page reload
      const updatedCategories = categories.map((category) =>
        category._id === selectedCategory._id
          ? {
              ...category,
              games: category.games.map((game) =>
                game._id === gameId ? { ...game, status: "active" } : game
              ),
            }
          : category
      );
      setCategories(updatedCategories);
      setIsModalOpen(false);
      window.location.reload();
    } catch (error) {
      toast.error("Failed to activate game!");
      console.error(error);
    }
  };

  const handleDeactivateGame = async (gameId) => {
    if (!selectedCategory) return;

    try {
      await updateGameStatus(selectedCategory._id, gameId, "inactive");
      toast.success("Game deactivated successfully!");

      // Update UI locally without page reload
      const updatedCategories = categories.map((category) =>
        category._id === selectedCategory._id
          ? {
              ...category,
              games: category.games.map((game) =>
                game._id === gameId ? { ...game, status: "inactive" } : game
              ),
            }
          : category
      );
      setCategories(updatedCategories);
      setIsModalOpen(false);
      window.location.reload();
    } catch (error) {
      toast.error("Failed to deactivate game!");
      console.error(error);
    }
  };

  // Handle category deletion
  const handleDeleteCategory = async (categoryId) => {
    const result = await deleteCategory(categoryId);
    if (result.success) {
      setCategories(categories.filter((cat) => cat._id !== categoryId));
      setSelectedCategory(null); // Deselect the category after deletion
    }
  };

  // Handle game deletion from category
  const handleDeleteGameFromCategory = async (categoryId, gameId) => {
    const result = await deleteGameFromCategory(categoryId, gameId);
    if (result.success) {
      toast.success("Game Deleted Successfully");
      setIsModalOpen(false);
      const updatedCategories = categories.map((category) =>
        category._id === categoryId
          ? {
              ...category,
              games: category.games.filter((game) => game._id !== gameId),
            }
          : category
      );
      setCategories(updatedCategories);
      window.location.reload();
    }
  };

  // Handle category click to display games
  const handleCategoryClick = (categoryId) => {
    const category = categories.find((cat) => cat._id === categoryId);
    setSelectedCategory(category);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Games & Categories Management</h2>

      <div className="w-full flex flex-col md:flex-row md:space-x-4">
        {/* Category Form */}
        <form
          onSubmit={handleCreateCategory}
          className="mb-6 space-y-4 md:w-1/2 w-full"
        >
          <h3 className="text-xl">Create Category</h3>
          <input
            type="text"
            placeholder="Category Name"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            className="border p-2 w-full bg-transparent"
          />
          <input
            type="file"
            ref={categoryFileInputRef}
            onChange={(e) => setCategoryImage(e.target.files[0])}
            className="border p-2 w-full"
          />

          <button type="submit" className="bg-blue-500 text-white p-2 w-full">
            Create Category
          </button>
        </form>

        {/* Add Game Form */}
        <form
          onSubmit={handleAddGameToCategory}
          className="mb-6 space-y-4 md:w-1/2 w-full"
        >
          <h3 className="text-xl">Add Game to Category</h3>
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="border p-2 w-full bg-transparent text-gray-400"
          >
            <option className="bg-white text-black" value="">
              Select Category
            </option>
            {categories.map((category) => (
              <option
                key={category._id}
                value={category._id}
                className="bg-white text-black"
              >
                {category.categoryName}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Game Name"
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            className="border p-2 w-full bg-transparent"
          />
          <input
            type="file"
            ref={gameFileInputRef}
            onChange={(e) => setGameImage(e.target.files[0])}
            className="border p-2 w-full"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border p-2 w-full bg-transparent text-gray-400"
          >
            <option className="bg-white text-black" value="active">
              Active
            </option>
            <option className="bg-white text-black" value="inactive">
              Inactive
            </option>
          </select>
          <button type="submit" className="bg-blue-500 text-white p-2 w-full">
            Add Game
          </button>
        </form>
      </div>

      <div className="border-t-2 border-gray-300 my-6"></div>

      {/* Category and Game List */}
      <div>
        <h3 className="text-xl mb-4">Categories & Games</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          {categories.map((category) => (
            <div
              key={category._id}
              className={`p-4 rounded-lg shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer ${
                selectedCategory && selectedCategory._id === category._id
                  ? "bg-blue-100" // Change background of selected category
                  : ""
              }`}
              onClick={() => handleCategoryClick(category._id)}
            >
              <div className="flex flex-col items-center text-center">
                {/* Category Image */}
                {category.categoryImage && (
                  <img
                    src={category.categoryImage}
                    alt={category.categoryName}
                    className="w-24 h-24 object-contain mb-2 transition-all duration-300 transform hover:scale-110"
                  />
                )}
                {/* Category Name */}
                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                  {category.categoryName}
                </h4>

                {/* Delete Category Button */}
                {selectedCategory && selectedCategory._id === category._id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent click from triggering game view
                      handleDeleteCategory(category._id);
                    }}
                    className="text-red-500 hover:text-white hover:bg-red-500 border border-red-500 py-1 px-4 rounded-full transition-all duration-300"
                  >
                    Delete Category
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Show games for the selected category */}
        {selectedCategory && (
          <div>
            <h5 className="text-md font-medium mb-2">
              Games in {selectedCategory.categoryName}
            </h5>
            {selectedCategory?.games.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {selectedCategory.games.map((game, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setSelectedGame(game);
                      setIsModalOpen(true);
                    }}
                    className="bg-white p-4 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
                  >
                    {/* Game Image */}
                    <div className="flex justify-center mb-4">
                      <img
                        src={game?.image}
                        alt={game?.name}
                        className="w-24 h-24 object-contain transition-all duration-300 transform hover:scale-110"
                      />
                    </div>

                    {/* Game Name */}
                    <h4 className="text-center font-semibold text-lg text-gray-800 mb-2">
                      {game?.name}
                    </h4>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">
                No games in this category.
              </p>
            )}
          </div>
        )}
      </div>
      {isModalOpen && selectedGame && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 relative">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
            >
              ✕
            </button>

            {/* Game Image */}
            <div className="flex justify-center mb-4">
              <img
                src={selectedGame?.image}
                alt={selectedGame?.name}
                className="w-32 h-32 object-contain"
              />
            </div>

            {/* Game Name */}
            <h2 className="text-center text-2xl font-bold mb-4">
              {selectedGame?.name}
            </h2>

            {/* Status */}
            <p
              className={`text-center mb-4 font-semibold ${
                selectedGame.status === "active"
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {selectedGame.status === "active"
                ? "Game is Activated"
                : "Game is Deactivated"}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() =>
                  handleDeleteGameFromCategory(
                    selectedCategory._id,
                    selectedGame._id
                  )
                }
                className="bg-red-500 text-white py-2 rounded hover:bg-red-600 transition"
              >
                Delete Game
              </button>

              {selectedGame.status === "active" ? (
                <button
                  onClick={() => handleDeactivateGame(selectedGame._id)}
                  className="bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600 transition"
                >
                  Deactivate Game
                </button>
              ) : (
                <button
                  onClick={() => handleActivateGame(selectedGame._id)}
                  className="bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
                >
                  Activate Game
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameCategoryManagement;
