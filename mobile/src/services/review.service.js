import { apiCall } from "./api";

export const reviewService = {
  getFieldReviews: async (fieldId) => {
    return await apiCall(`/reviews/field/${fieldId}`, {
      method: "GET",
    });
  },

  createReview: async (reviewData) => {
    return await apiCall("/reviews", {
      method: "POST",
      body: JSON.stringify(reviewData),
    });
  },

  deleteReview: async (id) => {
    return await apiCall(`/reviews/${id}`, {
      method: "DELETE",
    });
  },
};
