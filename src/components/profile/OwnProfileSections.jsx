import { useState } from 'react';
import { Link } from '../../routing/navigation.js';
import { isModerator } from '../../utils/Roles.js';
import { dateTime } from '../../utils/format.js';

function Avatar({ url, name, size = 96 }) {
  const [failed, setFailed] = useState(false);
  return <div className="arena-profile-avatar" style={{ width: size, height: size }}>
    {url?.trim() && !failed ? <img src={url} width={size} height={size} alt={`Avatar de ${name}`} onError={() => setFailed(true)} /> : <span aria-label={`Avatar de ${name}`}>{name?.charAt(0).toUpperCase() || '?'}</span>}
  </div>;
}

export function ProfileIdentity({ profile, onEdit, busy, editable = true }) {
  const date = profile.createdAt && Number.isFinite(Date.parse(profile.createdAt)) ? new Date(profile.createdAt).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }) : null;
  return <header className="arena-profile-identity">
    <Avatar key={profile.avatarUrl} url={profile.avatarUrl} name={profile.username} />
    <div className="min-w-0 flex-1"><p className="arena-eyebrow">{editable ? 'Mi perfil' : 'Perfil de jugador'}</p><h1 className="arena-title">{profile.username}</h1>{date && <p className="arena-muted">Miembro desde {date}</p>}{!editable && profile.lastActive && Number.isFinite(Date.parse(profile.lastActive)) && <p className="arena-muted">Última actividad: {dateTime(profile.lastActive)}</p>}</div>
    {editable && <button type="button" disabled={Boolean(busy)} onClick={() => onEdit('avatar')} className="arena-button">Editar avatar</button>}
    <dl className="arena-profile-stats">{[['Partidas', profile.stats?.matchesPlayed], ['Ganadas', profile.stats?.wins], ['Perdidas', profile.stats?.losses], ['Empatadas', profile.stats?.draws], ['Victorias', profile.stats?.winrate == null ? null : `${profile.stats.winrate}%`]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value ?? 'Sin datos'}</dd></div>)}</dl>
    <p className="arena-profile-note">Resumen del perfil. El Elo competitivo y los puntos de recompensa se consultan por separado.</p>
    {editable && isModerator(profile) && <button type="button" disabled={Boolean(busy)} onClick={() => onEdit('stats')} className="arena-detail-link">Editar estadísticas (staff)</button>}
  </header>;
}

function AvatarEditor({ profile, busy, onAvatar, onClose }) {
  const [url, setUrl] = useState(profile.avatarUrl ?? '');
  return <form className="arena-profile-panel" aria-busy={Boolean(busy)} onSubmit={async event => { event.preventDefault(); if (await onAvatar(url)) onClose(); }}>
    <h2>Editar avatar</h2><label htmlFor="profile-avatar" className="arena-profile-label">URL de tu avatar</label>
    <input id="profile-avatar" type="text" inputMode="url" autoComplete="url" value={url} onChange={event => setUrl(event.target.value)} disabled={Boolean(busy)} className="arena-profile-input" />
    <p className="arena-profile-note">Dejá el campo vacío para usar tu inicial.</p>
    <div className="arena-profile-actions"><button disabled={Boolean(busy)} className="arena-button arena-button-primary">{busy === 'avatar' ? 'Guardando…' : 'Guardar avatar'}</button><button type="button" disabled={Boolean(busy)} onClick={onClose} className="arena-button">Cancelar</button></div>
  </form>;
}

function StatsEditor({ profile, busy, onStats, onClose }) {
  const [values, setValues] = useState({ wins: profile.stats?.wins ?? 0, losses: profile.stats?.losses ?? 0, draws: profile.stats?.draws ?? 0 });
  return <form className="arena-profile-panel" aria-busy={Boolean(busy)} onSubmit={async event => { event.preventDefault(); if (await onStats(values)) onClose(); }}>
    <h2>Editar estadísticas (staff)</h2><p className="arena-profile-note">Este ajuste no modifica el Elo ni el saldo de recompensas. El servidor valida el permiso.</p>
    <div className="arena-profile-stat-fields">{[['wins', 'Ganadas'], ['losses', 'Perdidas'], ['draws', 'Empatadas']].map(([key, label]) => <div key={key}><label htmlFor={`profile-${key}`} className="arena-profile-label">{label}</label><input id={`profile-${key}`} type="number" min="0" step="1" required value={values[key]} onChange={event => setValues(previous => ({ ...previous, [key]: event.target.value }))} disabled={Boolean(busy)} className="arena-profile-input" /></div>)}</div>
    <div className="arena-profile-actions"><button disabled={Boolean(busy)} className="arena-button arena-button-primary">{busy === 'stats' ? 'Guardando…' : 'Guardar estadísticas'}</button><button type="button" disabled={Boolean(busy)} onClick={onClose} className="arena-button">Cancelar</button></div>
  </form>;
}

export function ProfileEditors(props) {
  if (props.editing === 'avatar') return <AvatarEditor {...props} />;
  if (props.editing === 'stats' && isModerator(props.profile)) return <StatsEditor {...props} />;
  return null;
}

export function ProfileGames({ games = [], onAdd, onEdit, onDelete, busy, editable = true }) {
  return <section className="arena-profile-panel">
    <div className="arena-profile-section-heading"><h2>{editable ? 'Mis videojuegos' : 'Videojuegos'}</h2>{editable && <button type="button" disabled={Boolean(busy)} onClick={onAdd} className="arena-button arena-button-primary">Vincular juego</button>}</div>
    {games.length ? <ul className="arena-profile-list">{games.map(game => <li key={game.gameName}><div className="min-w-0"><h3>{game.gameName}</h3><p className="arena-muted">{game.inGameName || 'Sin nombre vinculado'} · Rango: {game.rank || 'Sin rango informado'}</p></div>{editable && <div className="arena-profile-actions"><button type="button" disabled={Boolean(busy)} onClick={() => onEdit(game)} className="arena-button" aria-label={`Editar ${game.gameName}`}>Editar</button><button type="button" disabled={Boolean(busy)} onClick={() => onDelete(game.gameName)} className="arena-button" aria-label={`Eliminar ${game.gameName}`}>Eliminar</button></div>}</li>)}</ul> : <p className="arena-muted">{editable ? 'No tenés videojuegos vinculados. Agregá uno para completar tu perfil competitivo.' : 'Este jugador no tiene videojuegos vinculados.'}</p>}
  </section>;
}

export function ProfileTeams({ profile, resource, own = true }) {
  const team = resource.data?.find(item => item.members?.some(member => member.userId === profile.id || member.UserId === profile.id || (own && member.username === profile.username)));
  return <section className="arena-profile-panel"><h2>{own ? 'Mi equipo' : 'Equipo'}</h2>
    {resource.loading ? <p role="status" className="arena-muted">Cargando equipo…</p> : resource.error ? <div role="alert"><p>{resource.error}</p><button type="button" className="arena-button" onClick={resource.refresh}>Reintentar equipo</button></div> : team ? <div className="space-y-4"><Avatar key={team.logoUrl} url={team.logoUrl} name={team.name} size={64} /><h3>{team.name}</h3><p className="arena-muted">{team.tag ? `[${team.tag}]` : 'Sin etiqueta'}</p><Link to={`/teams/${team.id}`} className="arena-detail-link">Ver equipo</Link></div> : <div><p className="arena-muted">{own ? 'No estás en ningún equipo actualmente.' : 'Este jugador no pertenece a ningún equipo.'}</p>{own && <div className="arena-profile-actions"><Link to="/teams" className="arena-detail-link">Explorar equipos</Link><Link to="/teams/create" className="arena-detail-link">Crear mi equipo</Link></div>}</div>}
  </section>;
}
