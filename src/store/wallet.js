import { create } from 'zustand';
import { getBalance } from '../api/rewards.js';
let generation = 0;
export const useWalletStore = create((set) => ({
  balance: null, loading: false, error: null,
  async refresh() {
    const revision = ++generation; set({ loading: true, error: null });
    try { const { balance } = await getBalance(); if (revision === generation) set({ balance, loading: false }); return balance; }
    catch (error) { if (revision === generation) set({ loading: false, error: error.message }); return null; }
  },
  reset() { generation++; set({ balance: null, loading: false, error: null }); },
}));
