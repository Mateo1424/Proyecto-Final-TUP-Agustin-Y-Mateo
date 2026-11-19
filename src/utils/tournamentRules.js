export const enrollmentId = item => item.requestId ?? item.id;
export const statusLabel = status => ({ Pending: 'Pendiente', Admitted: 'Inscripto', Cancelled: 'Cancelado' }[status] ?? status);
export const canConfirmEnrollment = (item, userId) => item.status === 'Pending' && item.players?.some(p => p.userId === userId && !p.confirmed) === true;
export const canCancelEnrollment = (item, userId) => item.status === 'Pending' && item.players?.some(p => p.userId === userId) === true;
export const canEditTournament = (item, staff) => Boolean(staff && !item.closedAt && ['En curso', 'Finalizado'].includes(item.status));
export function registrationState(item, now = Date.now()) {
  const start = new Date(item.startDate).getTime();
  if (item.closedAt || item.status !== 'Próximo' || !Number.isFinite(start) || now >= start) return 'closed';
  if ((item.participants?.length ?? 0) >= item.maxParticipants) return 'full';
  return now < start - 30 * 60 * 1000 ? 'early' : 'open';
}
