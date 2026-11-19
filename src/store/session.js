import { create } from 'zustand';
import { useWalletStore } from './wallet.js';
export const useSessionStore = create(set => ({
  user: null,
  accept(user) {
    if (user) { localStorage.setItem('user', JSON.stringify(user)); localStorage.setItem('username', user.username); }
    else { localStorage.removeItem('user'); localStorage.removeItem('username'); useWalletStore.getState().reset(); }
    localStorage.removeItem('token'); set({ user });
  },
}));
