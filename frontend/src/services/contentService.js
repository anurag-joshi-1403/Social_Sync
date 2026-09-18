import api, { getErrorMessage } from './api.js';

export const contentService = {
  // Generate AI content
  generate: async ({ topic, platform, tone }) => {
    try {
      const { data } = await api.post('/content/generate', {
        topic,
        platform,
        tone,
      });
      return data; // { success, count, options }
    } catch (error) {
      throw new Error(getErrorMessage(error), { cause: error });
    }
  },
};