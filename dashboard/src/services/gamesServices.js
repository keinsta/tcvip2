import axiosInstance from "../config/axiosInstance";
/**
 * Get all categories from the server.
 * @returns {Promise<Object>} Response data containing all categories.
 */
export const getCategories = async () => {
  try {
    const response = await axiosInstance.get("/admin/games/categories");
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

/**
 * Create a new category with the provided details.
 * @param {Object} categoryDetails The category name and image.
 * @returns {Promise<Object>} The created category.
 */
export const createCategory = async ({ categoryName, categoryImage }) => {
  const formData = new FormData();
  formData.append("categoryName", categoryName);
  formData.append("categoryImage", categoryImage);

  try {
    const response = await axiosInstance.post(
      "/admin/games/category",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};

/**
 * Add a game to an existing category.
 * @param {string} categoryId The ID of the category to add the game to.
 * @param {Object} gameDetails The game name, image, and status (active/inactive).
 * @returns {Promise<Object>} The added game.
 */
export const addGameToCategory = async (
  categoryId,
  { gameName, gameImage, status }
) => {
  const formData = new FormData();
  formData.append("name", gameName);
  formData.append("gameImage", gameImage);
  formData.append("status", status);

  try {
    const response = await axiosInstance.post(
      `/admin/games/category/${categoryId}/game`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding game to category:", error);
    throw error;
  }
};

/**
 * Update the status of a game inside a category.
 * @param {string} categoryId The ID of the category containing the game.
 * @param {string} gameId The ID of the game whose status needs to be updated.
 * @param {string} newStatus The new status ('active', 'inactive', or 'suspended').
 * @returns {Promise<Object>} The updated game data.
 */
export const updateGameStatus = async (categoryId, gameId, newStatus) => {
  try {
    const response = await axiosInstance.put(
      `/admin/games/category/${categoryId}/game/${gameId}/status`,
      { status: newStatus }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating game status:", error);
    throw error;
  }
};

/**
 * Delete a category by its ID.
 * @param {string} categoryId The ID of the category to be deleted.
 * @returns {Promise<Object>} The response after deleting the category.
 */
export const deleteCategory = async (categoryId) => {
  try {
    const response = await axiosInstance.delete(
      `/admin/games/category/${categoryId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
};

/**
 * Delete a game from a category.
 * @param {string} categoryId The ID of the category containing the game.
 * @param {string} gameId The ID of the game to be deleted.
 * @returns {Promise<Object>} The response after deleting the game.
 */
export const deleteGameFromCategory = async (categoryId, gameId) => {
  try {
    const response = await axiosInstance.delete(
      `/admin/games/category/${categoryId}/game/${gameId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting game from category:", error);
    throw error;
  }
};
