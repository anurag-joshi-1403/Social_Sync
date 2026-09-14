import api, { getErrorMessage } from './api.js';

export const authService = {
  // Register a new user
  register: async ({ name, email, password }) => {
    try {
      const { data } = await api.post('/auth/register', {
        name,
        email,
        password,
      });
      return data; // { success, token, user }
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Login an existing user
  login: async ({ email, password }) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      return data; // { success, token, user }
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Get the currently logged-in user (requires token)
  me: async () => {
    try {
      const { data } = await api.get('/auth/me');
      return data; // { success, user }
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};