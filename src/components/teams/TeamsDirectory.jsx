import { Link } from '../../routing/navigation.js';
import TeamCard from './TeamCard.jsx';

export default function TeamsDirectory({teams,loading,error,loadTeams}) {
  return <section className="arena-teams-directory" aria-labelledby="teams-directory-heading">
    <header className="arena-page-heading"><div><p className="arena-eyebrow">Competencia en equipo</p><h1 className="arena-title" id="teams-directory-heading">Equipos</h1><p className="directory-intro">Consultá sus juegos, integrantes y condiciones de acceso.</p></div><Link to="/teams/create" className="arena-button arena-button-primary">Crear equipo</Link></header>
    <div className="directory-toolbar"><p>{loading ? 'Consultando equipos…' : error ? 'Consulta no disponible' : `${teams.length} ${teams.length === 1 ? 'equipo registrado' : 'equipos registrados'}`}</p><Link to="/team-invitations" className="arena-detail-link">Ver mis invitaciones</Link></div>
    {loading ? <p role="status" className="arena-state">Cargando equipos...</p> : error ? <div role="alert" className="directory-error"><h2>No se pudieron cargar los equipos</h2><p>{error}</p><button type="button" onClick={loadTeams} className="arena-button">Reintentar</button></div> : teams.length === 0 ? <div className="arena-state directory-empty"><h2>No hay equipos creados todavía.</h2><p>Creá un equipo para empezar a reunir a tus compañeros.</p><Link to="/teams/create" className="arena-button mt-4">Crear mi equipo</Link></div> : <div className="directory-team-grid">{teams.map(team => <TeamCard key={team.id} team={team} />)}</div>}
  </section>;
}
