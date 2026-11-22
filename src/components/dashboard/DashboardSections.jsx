import { Link } from '../../routing/navigation.js';
import { dateTime, points } from '../../utils/format.js';
import { invitationStatus } from '../../utils/teamInvitations.js';
import { canConfirmEnrollment } from '../../utils/tournamentRules.js';

const sections = {
  pending: { title: 'Solicitudes de inscripción', href: '/tournament-enrollments', link: 'Ver mis inscripciones', empty: 'No hay solicitudes pendientes en esta vista.' },
  invitations: { title: 'Invitaciones a equipos', href: '/team-invitations', link: 'Ver mis invitaciones', empty: 'No tenés invitaciones pendientes.' },
  active: { title: 'Mis torneos', href: '/tournament-enrollments', link: 'Ver todas mis inscripciones', empty: 'No hay torneos próximos o en curso en esta vista.' },
};

export function ResourceState({ resource, children }) {
  if (resource.loading) return <p role="status" className="arena-muted">Cargando actividad…</p>;
  if (resource.error) return <div role="alert"><p>{resource.error}</p><button type="button" className="arena-button" onClick={resource.refresh}>Reintentar</button></div>;
  return children;
}

export function ActivityPreview({ kind, resource, userId, now }) {
  const section = sections[kind];
  const source = kind === 'invitations' ? resource.data ?? [] : resource.data?.items ?? [];
  const items = source.filter(item => kind === 'invitations'
    ? invitationStatus(item, now) === 'Pending'
    : !item.closedAt && (kind === 'active'
      ? item.status === 'Admitted' && ['Próximo', 'En curso'].includes(item.tournamentStatus)
      : item.status === 'Pending' && item.tournamentStatus === 'Próximo' && Date.parse(item.startDate) > now))
    .sort((a, b) => Date.parse(a.startDate ?? a.expiresAt) - Date.parse(b.startDate ?? b.expiresAt))
    .slice(0, 3);
  return <section className="arena-dashboard-panel">
    <h2>{section.title}</h2>
    <ResourceState resource={resource}>
      {items.length ? <ul className="arena-activity-list">{items.map(item => <li key={item.requestId ?? item.id}>
        <div>
          <h3>{kind === 'invitations' ? item.teamName : item.title}</h3>
          <p className="arena-muted">{kind === 'invitations' ? `Invitación de ${item.senderUsername ?? 'un capitán'}` : `${item.gameName}${item.teamName ? ` · ${item.teamName}` : ''}`}</p>
          <p className="arena-activity-status">{kind === 'pending' ? canConfirmEnrollment(item, userId) ? 'Tu confirmación pendiente' : 'Esperando al equipo' : kind === 'active' ? item.tournamentStatus : 'Pendiente'}</p>
          <p className="arena-muted">{kind === 'invitations' ? 'Vence' : 'Inicio'}: {dateTime(kind === 'invitations' ? item.expiresAt : item.startDate)}</p>
        </div>
        <Link className="arena-detail-link" to={kind === 'active' ? `/tournaments/${item.tournamentId}` : section.href}>{kind === 'active' ? 'Ver torneo' : 'Revisar'}</Link>
      </li>)}</ul> : <p className="arena-muted">{section.empty}</p>}
      {kind !== 'invitations' && <p className="arena-preview-note">Vista resumida de tus inscripciones. Una solicitud pendiente no reserva cupo.</p>}
      {kind === 'invitations' && source.length > 3 && <p className="arena-preview-note">Mostrando hasta tres invitaciones vigentes.</p>}
    </ResourceState>
    <Link className="arena-detail-link" to={section.href}>{section.link}</Link>
  </section>;
}

export function WalletSummary({ balance, loading, error, onRetry }) {
  return <section className="arena-dashboard-panel">
    <p className="arena-eyebrow">Recompensas</p><h2>Mi saldo</h2>
    {loading && balance === null ? <p role="status">Consultando saldo…</p> : <p className="arena-dashboard-balance">{balance === null ? 'Sin consultar' : points(balance)}</p>}
    {error && <div role="alert"><p>No se pudo actualizar el saldo. El valor anterior puede estar desactualizado.</p><button type="button" className="arena-button" onClick={onRetry}>Reintentar saldo</button></div>}
    <p className="arena-muted">Para entradas y canjes. Tu clasificación competitiva se mide por separado.</p>
    <Link to="/rewards" className="arena-detail-link">Ver recompensas y movimientos</Link>
  </section>;
}

export function EloValue({ current }) {
  return current?.rating == null
    ? <p className="arena-muted">Sin clasificación</p>
    : <p><strong className="arena-elo-value">{current.rating}</strong> Elo{current.position != null && <span className="arena-muted"> · Posición #{current.position}</span>}</p>;
}
