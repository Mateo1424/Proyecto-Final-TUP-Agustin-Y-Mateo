import { canCancelEnrollment, canConfirmEnrollment, enrollmentId, statusLabel } from '../../utils/tournamentRules.js';
import { points } from '../../utils/format.js';
export default function EnrollmentCard({ item, userId, busy = false, onConfirm, onCancel, frozen = false, prototype = false, confirmationOpen = true, appearance = 'default' }) {
  const requestId = enrollmentId(item);
  const mine = item.players?.find(p => p.userId === userId);
  const confirmed = item.players?.filter(p => p.confirmed).length ?? 0;
  const team = Boolean(item.teamId);
  if (appearance === 'inbox') return <section className="inbox-enrollment" aria-label={`Solicitud ${item.teamName || 'individual'}`} data-status={item.status}>
    <header className="inbox-enrollment-heading"><div><p className="inbox-caption">{team ? 'Solicitud por equipo' : 'Inscripción individual'}</p><h3>{item.teamName || 'Tu inscripción individual'}</h3></div><span className="inbox-status">{statusLabel(item.status)}</span></header>
    <div className="inbox-confirmation-summary">
      <div><span className="inbox-caption">Entrada por jugador</span><strong>{item.isFree ? 'Gratis' : points(item.entryPoints ?? 250)}</strong></div>
      <div><span className="inbox-caption">Tu confirmación</span><strong>{item.status === 'Cancelled' ? 'Solicitud cancelada' : mine?.confirmed ? 'Registrada' : mine ? 'Pendiente' : 'No sos titular'}</strong></div>
    </div>
    <div className="inbox-progress"><label htmlFor={`enrollment-progress-${requestId}`}>{team ? `${confirmed} de 5 titulares confirmados` : `${confirmed} confirmación personal`}</label><progress id={`enrollment-progress-${requestId}`} max={team ? 5 : 1} value={confirmed} /></div>
    <ul className="inbox-player-list">{item.players?.map(player => <li key={player.userId}><span>{player.username}{player.userId === userId && ' (vos)'}</span><span>{player.confirmed ? 'Confirmado' : 'Falta confirmar'}</span></li>)}</ul>
    {item.status === 'Pending' && <p className="inbox-notice">{team ? 'Esta solicitud no reserva plaza. Ingresa el primer equipo que completa cinco confirmaciones y obtiene cupo.' : 'Esta solicitud pendiente no reserva plaza. El cupo se confirma cuando el servidor admite la inscripción.'}</p>}
    {item.status === 'Cancelled' && <p className="inbox-notice">Solicitud cancelada. El backend devuelve los puntos de las confirmaciones cobradas. Consultá Movimientos en Recompensas para ver el reembolso.</p>}
    {item.status === 'Admitted' && <p className="inbox-notice">Inscripción admitida y cupo confirmado.</p>}
    {mine?.confirmed && item.status === 'Pending' && <p className="inbox-notice">Ya confirmaste tu presencia. Esperá al resto de los titulares.</p>}
    {frozen && <p className="inbox-notice">{item.closedAt ? 'Torneo cerrado definitivamente.' : 'Torneo cancelado.'} Las acciones de esta solicitud están bloqueadas.</p>}
    {!frozen && item.status === 'Pending' && !confirmationOpen && <p className="inbox-notice">La confirmación no está disponible fuera de la ventana de inscripción o cuando el cupo está completo.</p>}
    <div className="inbox-enrollment-actions">
      {!frozen && confirmationOpen && canConfirmEnrollment(item,userId) && <button type="button" disabled={busy} onClick={() => onConfirm(requestId)} className="arena-button arena-button-primary">Confirmar mi presencia{item.isFree ? ' gratis' : ` · ${points(item.entryPoints ?? 250)}`}</button>}
      {!frozen && canCancelEnrollment(item,userId) && <button type="button" disabled={busy} onClick={() => onCancel(requestId)} className="arena-button inbox-cancel">Cancelar solicitud y devolver pagos</button>}
    </div>
  </section>;
  return <section className={`rounded-xl border p-4 text-white ${prototype ? "border-[#424a40] bg-[#151b17]" : "border-gray-700 bg-[#161b22]"}`} aria-label={`Solicitud ${item.teamName || 'individual'}`}>
    <div className="flex flex-wrap justify-between gap-2"><h3 className="font-semibold">{item.teamName || 'Tu inscripción individual'}</h3><span>{statusLabel(item.status)}</span></div>
    <p className="my-2 text-sm text-gray-400">{team ? `${confirmed} de 5 titulares confirmados` : `${confirmed} confirmación personal`}</p>
    <ul className="space-y-1 text-sm">{item.players?.map(p => <li key={p.userId}>{p.username}{p.userId === userId ? ' (vos)' : ''} · {p.confirmed ? 'Confirmado' : 'Falta confirmar'}</li>)}</ul>
    {item.status === 'Pending' && <p className="mt-3 text-sm text-amber-200">Esta solicitud no reserva plaza ni cuenta como equipo inscripto. Ingresa el primero que completa cinco confirmaciones y obtiene cupo.</p>}
    {item.status === 'Cancelled' && <p className="mt-3 text-sm text-gray-300">Solicitud cancelada. El backend devuelve los puntos de las confirmaciones cobradas; consultá Movimientos para ver el reembolso.</p>}
    {item.status === 'Admitted' && <p className="mt-3 text-sm text-emerald-300">Inscripción admitida y cupo confirmado.</p>}
    {mine?.confirmed && item.status === 'Pending' && <p className="mt-2 text-sm">Ya confirmaste tu presencia. Esperá al resto de los titulares.</p>}
    <div className="mt-3 flex flex-wrap gap-3">
      {!frozen && confirmationOpen && canConfirmEnrollment(item, userId) && <button disabled={busy} onClick={() => onConfirm(requestId)} className={`rounded-lg px-4 py-2 font-semibold disabled:opacity-50 ${prototype ? "bg-[#c4e988] text-[#151b17]" : "bg-purple-600"}`}>Confirmar mi presencia{item.isFree ? ' gratis' : ` · ${points(item.entryPoints ?? 250)}`}</button>}
      {!frozen && canCancelEnrollment(item, userId) && <button disabled={busy} onClick={() => onCancel(requestId)} className="rounded-lg border border-red-800 px-4 py-2 text-red-300 disabled:opacity-50">Cancelar solicitud y devolver pagos</button>}
    </div>
  </section>;
}
