import { apiFetch } from '../config.js';

async function profileRequest(path, { data, ...options } = {}) {
  const response = await apiFetch(path, {
    ...options,
    ...(data === undefined ? {} : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const failure = new Error(body?.message || body?.detail || Object.values(body?.errors ?? {}).flat()[0] || 'No se pudo completar la operación del perfil.');
    failure.status = response.status;
    throw failure;
  }
  return body;
}

export const getOwnProfile = signal => profileRequest('/profile/me', { signal });
export const getPlayerProfile = (id, signal) => profileRequest(`/profile/${encodeURIComponent(id)}`, { signal });
export const getProfileTeams = signal => profileRequest('/teams', { signal });
export const saveProfileAvatar = avatarUrl => profileRequest('/profile/avatar', { method: 'PUT', data: { AvatarUrl: avatarUrl } });
export const saveProfileStats = stats => profileRequest('/profile/stats', { method: 'PUT', data: { wins: Number(stats.wins), losses: Number(stats.losses), draws: Number(stats.draws) } });
export const saveProfileGame = (game, editing) => profileRequest('/profile/games', { method: editing ? 'PUT' : 'POST', data: game });
export const deleteProfileGame = name => profileRequest(`/profile/games/${encodeURIComponent(name)}`, { method: 'DELETE' });
