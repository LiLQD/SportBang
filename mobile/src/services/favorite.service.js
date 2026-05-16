import { apiCall } from "./api";

export const favoriteService = {
  getFavorites: async () => {
    return await apiCall("/favorites", {
      method: "GET",
    });
  },

  toggleFavorite: async (fieldId) => {
    return await apiCall("/favorites/toggle", {
      method: "POST",
      body: JSON.stringify({ fieldId }),
    });
  },
};
