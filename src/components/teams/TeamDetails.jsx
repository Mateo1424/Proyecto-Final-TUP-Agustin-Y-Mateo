import { useState } from 'react';
import { Link } from '../../routing/navigation';

function TeamIdentityLogo({ team }) {
  const [failed, setFailed] = useState(false);
  return <div className="team-detail-logo">
    {team.logoUrl?.trim() && !failed
      ? <img src={team.logoUrl} alt={`Logo de ${team.name}`} width="96" height="96" onError={() => setFailed(true)} />
      : <span role="img" aria-label={`Inicial de ${team.name}`}>{team.name?.charAt(0).toUpperCase() || '?'}</span>}
  </div>;
}

export function TeamIdentity({ team, members, isCaptain, isMember, joining, leaving, onEdit, onJoin, onLeave }) {
  const captain = members.find(member => member.userId === team.captainId);
  return <header className="team-detail-identity">
    <div className="team-detail-heading">
      <TeamIdentityLogo key={team.logoUrl} team={team} />
      <div><p className="arena-eyebrow">{team.tag ? `[${team.tag}]` : 'Sin etiqueta'} · {team.gameName || 'Juego sin informar'}</p><h1 className="arena-title">{team.name}</h1></div>
    </div>
    <dl className="team-detail-facts">
      <div><dt>Capitán</dt><dd>{captain?.username || 'Sin informar'}</dd></div>
      <div><dt>Acceso</dt><dd>{team.isPrivate ? 'Privado · Por invitación' : 'Público'}</dd></div>
      <div><dt>Integrantes</dt><dd>{members.length}</dd></div>
      <div><dt>Tu relación</dt><dd>{isCaptain ? 'Capitán' : isMember ? 'Integrante' : 'Visitante'}</dd></div>
    </dl>
    <div className="team-detail-actions">
      {isCaptain && <button onClick={onEdit} className="arena-button arena-button-primary">Editar equipo</button>}
      {isMember ? !isCaptain && <button onClick={onLeave} disabled={leaving} className="arena-button team-detail-danger">{leaving ? 'Saliendo...' : 'Abandonar equipo'}</button>
        : team.isPrivate ? <p className="team-detail-access">Este equipo es privado. Necesitás una invitación del capitán para ingresar. <Link to="/team-invitations" className="arena-detail-link">Ver mis invitaciones</Link></p>
          : <button onClick={onJoin} disabled={joining} className="arena-button arena-button-primary">{joining ? 'Uniéndote...' : 'Unirse al equipo'}</button>}
    </div>
  </header>;
}

export function TeamRoster({ team, members, user, isCaptain, onToggleStarter, onRemoveMember }) {
  const starters = members.filter(member => member.isStarter).length;
  return <section className="team-detail-panel" aria-labelledby="team-roster-heading">
    <div className="team-detail-section-heading"><div><p className="arena-eyebrow">Plantel</p><h2 id="team-roster-heading">Integrantes del equipo</h2></div><dl className="team-roster-counts"><div><dt>Titulares</dt><dd>{starters}</dd></div><div><dt>Suplentes</dt><dd>{members.length - starters}</dd></div></dl></div>
    {members.length ? <ul className="team-roster">{members.map(member => {
      const memberIsCaptain = member.userId === team.captainId;
      return <li key={member.userId}>
        <div className="team-roster-member"><p><strong>{member.username}</strong>{user?.id === member.userId && <span className="team-roster-self">Tú</span>}</p><p className="team-roster-role">{memberIsCaptain ? 'Capitán' : `Rol: ${member.role || 'Miembro'}`}</p></div>
        <span className={member.isStarter ? 'team-roster-position is-starter' : 'team-roster-position'}>{member.isStarter ? 'Titular' : 'Suplente'}</span>
        {isCaptain && !memberIsCaptain && <div className="team-roster-controls"><button onClick={() => onToggleStarter(member)} className="arena-button" aria-label={`Cambiar a ${member.isStarter ? 'Suplente' : 'Titular'} a ${member.username}`}>Cambiar a {member.isStarter ? 'Suplente' : 'Titular'}</button><button onClick={() => onRemoveMember(member.userId, member.username)} className="arena-button team-detail-danger" aria-label={`Expulsar a ${member.username}`}>Expulsar</button></div>}
      </li>;
    })}</ul> : <p className="arena-muted">No hay integrantes para mostrar.</p>}
  </section>;
}
