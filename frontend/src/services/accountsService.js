import api, { getErrorMessage } from './api.js';

export const accountsService = {
  // List connected accounts
  list: async () => {
    try {
      const { data } = await api.get('/accounts');
      return data; // { success, count, accounts }
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Connect a platform (mock OAuth — sends token directly)
  connect: async ({ platform, username, accessToken }) => {
    try {
      const { data } = await api.post('/accounts/connect', {
        platform,
        username,
        accessToken,
      });
      return data; // { success, message, account }
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Disconnect a platform
  disconnect: async (platform) => {
    try {
      const { data } = await api.delete(`/accounts/${platform}`);
      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};