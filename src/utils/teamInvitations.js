import { apiFetch } from '../config.js';

export function invitationStatus(invitation, now = Date.now()) {
  return invitation.status === 'Pending' && Date.parse(invitation.expiresAt) <= now
    ? 'Expired'
    : invitation.status;
}

export const invitationLabels = {
  Pending: 'Pendiente', Accepted: 'Aceptada', Rejected: 'Rechazada',
  Cancelled: 'Cancelada', Expired: 'Vencida',
};

export async function teamRequest(path, { body, ...options } = {}) {
  const response = await apiFetch(path, {
    ...options,
    ...(body === undefined ? {} : {
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    }),
  });
  const data = await response.json().catch(() => null);
  if (response.status === 401) throw new Error('Tu sesión expiró. Volvé a iniciar sesión.');
  if (!response.ok) throw new Error(data?.message || `No se pudo completar la operación (error ${response.status}).`);
  return data;
}
