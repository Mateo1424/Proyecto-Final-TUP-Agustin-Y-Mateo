import { request } from './client.js';
export const getBalance = signal => request('/users/me/points', { signal });
export const getMovements = (page = 1, signal) => request('/users/me/points/history', { params: { page, pageSize: 20 }, signal });
export const getCatalog = signal => request('/rewards/catalog', { signal });
export const redeemReward = (productId, idempotencyKey) => request('/rewards/redemptions', { method: 'POST', data: { productId, idempotencyKey } });
export const getRedemptions = (page = 1, signal) => request('/rewards/redemptions', { params: { page, pageSize: 20 }, signal });
