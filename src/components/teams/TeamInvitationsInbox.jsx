import { Link } from '../../routing/navigation';
import { invitationLabels, invitationStatus } from '../../utils/teamInvitations';

function InvitationRow({ invitation, busy, onAction }) {
  const status = invitationStatus(invitation);
  const date = new Date(invitation.expiresAt);
  return <li className="team-invitation-row">
    <div className="team-invitation-identity">
      <p className="team-invitation-status" data-status={status}>{invitationLabels[status] || status}</p>
      <h2><Link to={`/teams/${invitation.teamId}`}>{invitation.teamName}</Link></h2>
      <p className="arena-muted">Invitado por <strong>{invitation.senderUsername}</strong></p>
    </div>
    <div className="team-invitation-expiry"><span>Vencimiento</span>{Number.isNaN(date.getTime()) ? <p>Fecha sin informar</p> : <time dateTime={invitation.expiresAt}>{date.toLocaleString('es-AR')}</time>}</div>
    {status === 'Pending' && <div className="team-invitation-actions" aria-busy={busy === invitation.id}>
      <button disabled={Boolean(busy)} onClick={() => onAction(invitation, 'accept')} className="arena-button arena-button-primary" aria-label={`Aceptar invitación de ${invitation.teamName}`}>{busy === invitation.id ? 'Procesando...' : 'Aceptar'}</button>
      <button disabled={Boolean(busy)} onClick={() => onAction(invitation, 'reject')} className="arena-button" aria-label={`Rechazar invitación de ${invitation.teamName}`}>Rechazar</button>
    </div>}
  </li>;
}

export default function TeamInvitationsInbox({ invitations, loading, busy, error, success, acceptedTeam, load, onAction }) {
  return <div className="team-invitations-page">
    <header className="arena-page-heading"><div><p className="arena-eyebrow">Equipos</p><h1 className="arena-title">Mis invitaciones</h1><p className="team-invitations-intro">Propuestas para unirte a un equipo y el estado de cada respuesta.</p></div><button disabled={loading || Boolean(busy)} onClick={load} className="arena-button">{loading ? 'Cargando...' : 'Actualizar'}</button></header>
    <aside className="team-invitations-requirements" aria-label="Requisitos para aceptar"><p>Las invitaciones vencen a los siete días. Para aceptar, necesitás el videojuego y rango en tu perfil y no pertenecer a otro equipo.</p><Link to="/profile" className="arena-detail-link">Revisar mi perfil</Link></aside>
    {error && <p role="alert" className="team-invitations-error">{error}</p>}
    {success && <div role="status" className="team-invitations-success"><p>{success}</p>{acceptedTeam && <Link to={`/teams/${acceptedTeam}`} className="arena-detail-link">Ver equipo</Link>}</div>}
    {loading ? <p role="status" className="arena-state">Cargando invitaciones...</p> : invitations.length ? <ul className="team-invitations-list">{invitations.map(invitation => <InvitationRow key={invitation.id} invitation={invitation} busy={busy} onAction={onAction} />)}</ul> : !error && <div className="team-invitations-empty"><h2>No tenés invitaciones recibidas</h2><p className="arena-muted">Cuando un capitán te invite, la propuesta aparecerá acá.</p></div>}
    <Link to="/teams" className="arena-detail-link team-invitations-back">← Volver a equipos</Link>
  </div>;
}
