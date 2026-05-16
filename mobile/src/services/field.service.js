import { apiCall } from "./api";

export const fieldService = {
  getAllFields: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return await apiCall(`/fields?${query}`, {
      method: "GET",
    });
  },

  getFieldById: async (id) => {
    return await apiCall(`/fields/${id}`, {
      method: "GET",
    });
  },

  getFieldsByOwner: async () => {
    return await apiCall("/fields/owner/my-fields", {
      method: "GET",
    });
  },
};
