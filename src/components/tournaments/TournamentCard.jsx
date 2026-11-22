import { Link } from '../../routing/navigation.js';
import { points, dateTime } from '../../utils/format.js';

export default function TournamentCard({ tournament }) {
  const date = tournament.startDate && Number.isFinite(new Date(tournament.startDate).getTime()) ? tournament.startDate : null;
  return <article className="arena-tournament-card">
    <div className="arena-tournament-art">
      {tournament.bannerUrl && <img src={tournament.bannerUrl} alt="" width="640" height="360" loading="lazy" />}
      <span className="arena-tournament-game">{tournament.gameName}</span>
    </div>
    <div className="arena-tournament-info">
      <span className="arena-status">{tournament.closedAt ? 'Cerrado definitivamente' : tournament.status} · {tournament.tournamentType === 'Equipo' ? 'Por equipos' : 'Individual'}</span>
      <h2>{tournament.title}</h2>
      {date ? <time dateTime={date}>{dateTime(date)}</time> : <p className="arena-muted">Fecha sin informar</p>}
      <dl className="arena-tournament-economy"><div><dt>Entrada por jugador</dt><dd>{tournament.isFree ? 'Gratis' : points(tournament.entryPoints)}</dd></div><div><dt>{tournament.isFree ? 'Recompensa' : 'Premios totales'}</dt><dd>{tournament.isFree ? 'Por participación válida' : points(tournament.prizePool)}</dd></div></dl>
    </div>
    <footer className="arena-tournament-footer"><span className="arena-muted">{tournament.participants?.length ?? 0} / {tournament.maxParticipants} cupos</span><Link className="arena-detail-link" to={`/tournaments/${tournament.id}`} aria-label={`Ver detalles de ${tournament.title}`}>Ver detalles</Link></footer>
  </article>;
}
