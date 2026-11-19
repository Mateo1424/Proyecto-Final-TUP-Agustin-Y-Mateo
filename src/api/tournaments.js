import { request } from './client.js';
export const getEnrollments = (id, signal) => request(`/tournaments/${id}/enrollments`, { signal });
export const getMyEnrollments = (params, signal) => request('/users/me/tournament-enrollments', { params, signal });
export const confirmEnrollment = (id, requestId) => request(`/tournaments/${id}/enrollments/${requestId}/confirm`, { method: 'POST' });
export const cancelEnrollment = (id, requestId) => request(`/tournaments/${id}/enrollments/${requestId}/cancel`, { method: 'POST' });
export const cancelTournament = id => request(`/tournaments/${id}/cancel`, { method: 'POST' });
export const closeTournament = id => request(`/tournaments/${id}/close`, { method: 'POST' });
