import { useState } from 'react';
import { Link } from '../../routing/navigation.js';

function TeamLogo({url,name}) {
  const [failed,setFailed]=useState(false);
  return <div className="directory-team-logo">
    {url?.trim() && !failed ? <img src={url} width="64" height="64" loading="lazy" alt={`Logo de ${name}`} onError={() => setFailed(true)} /> : <span role="img" aria-label={`Inicial de ${name}`}>{name?.charAt(0).toUpperCase() || '?'}</span>}
  </div>;
}

export default function TeamCard({team}) {
  const members=Array.isArray(team.members) ? team.members.length : null;
  return <article className="directory-team-card">
    <Link to={`/teams/${team.id}`} className="directory-team-link" aria-label={`Ver detalles de ${team.name}`}>
      <div className="directory-team-identity"><TeamLogo key={team.logoUrl} url={team.logoUrl} name={team.name} /><div><p className="directory-team-tag">{team.tag ? `[${team.tag}]` : 'Sin etiqueta'}</p><h2>{team.name}</h2></div></div>
      <p className="directory-team-game">{team.gameName || 'Juego sin informar'}</p>
      <dl className="directory-team-facts"><div><dt>Acceso</dt><dd>{team.isPrivate === true ? 'Privado · Por invitación' : team.isPrivate === false ? 'Público' : 'Privacidad sin informar'}</dd></div><div><dt>Integrantes</dt><dd>{members === null ? 'Integrantes sin informar' : `${members} ${members === 1 ? 'integrante' : 'integrantes'}`}</dd></div></dl>
      <span className="directory-team-details">Ver equipo</span>
    </Link>
  </article>;
}
