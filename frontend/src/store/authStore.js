import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('gco_user') || 'null'),
  token: localStorage.getItem('gco_token'),
  isAuthenticated: !!localStorage.getItem('gco_token'),

  login: (token, user) => {
    localStorage.setItem('gco_token', token);
    localStorage.setItem('gco_user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('gco_token');
    localStorage.removeItem('gco_user');
    set({ token: null, user: null, isAuthenticated: false });
  },

  updateUser: (user) => {
    localStorage.setItem('gco_user', JSON.stringify(user));
    set({ user });
  }
}));

export default useAuthStore;