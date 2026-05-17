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

  createField: async (fieldData) => {
    return await apiCall("/fields", {
      method: "POST",
      body: JSON.stringify(fieldData),
    });
  },

  updateField: async (id, fieldData) => {
    return await apiCall(`/fields/${id}`, {
      method: "PUT",
      body: JSON.stringify(fieldData),
    });
  },

  deleteField: async (id) => {
    return await apiCall(`/fields/${id}`, {
      method: "DELETE",
    });
  },
};
