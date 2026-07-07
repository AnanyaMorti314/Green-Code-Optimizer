import API from './api';

export const authService = {
  login: (email, password) =>
    API.post('/auth/login', { email, password }),

  register: (name, email, password) =>
    API.post('/auth/register', { name, email, password }),

  getProfile: () => API.get('/auth/profile'),
};