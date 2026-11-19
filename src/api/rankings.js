import { request } from './client.js';
export const GAMES = ['League of Legends', 'Valorant', 'CS:GO', 'Rocket League'];
export const getRankings = (kind, gameName, page = 1, signal) => request(`/rankings/${kind}`, { params: { gameName, page, pageSize: 20 }, signal });
export const getCurrentElo = (kind, id, gameName, signal) => request(`/rankings/${kind}/${id}`, { params: { gameName }, signal });
export const getEloHistory = (kind, id, gameName, page = 1, signal) => request(`/rankings/${kind}/${id}/history`, { params: { gameName, page, pageSize: 20 }, signal });
