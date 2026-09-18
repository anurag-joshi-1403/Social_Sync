import api, { getErrorMessage } from './api.js';

export const analyticsService = {
  // Engagement aggregated from the user's own published posts.
  summary: async (range = 30) => {
    try {
      const { data } = await api.get('/analytics', { params: { range } });
      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error), { cause: error });
    }
  },
};
