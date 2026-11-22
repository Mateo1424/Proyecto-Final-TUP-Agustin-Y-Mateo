import { points } from '../../utils/format.js';
export default function TournamentEconomy({ tournament }) {
 return <section className="detail-panel detail-economy">
  <p className="arena-eyebrow">Economía del torneo</p>
  <h2>Puntos y premios</h2>
  {!tournament.isFree && <p className="detail-muted">Premios totales: <strong>{points(tournament.prizePool)}</strong></p>}
  <p>Entrada por jugador: <strong>{tournament.isFree ? 'Gratis' : points(tournament.entryPoints)}</strong></p>
  {tournament.isFree ? <p className="detail-muted">50 puntos por completar con participación válida y 100 adicionales al ganar. Máximo 200 por día de Córdoba; abandonos y pases sin jugar no cuentan.</p> : <><dl className="detail-prizes"><div><dt>Campeón</dt><dd>{points(tournament.championPoints)}</dd></div><div><dt>Subcampeón</dt><dd>{points(tournament.runnerUpPoints)}</dd></div><div><dt>Semifinalista</dt><dd>{points(tournament.semifinalPoints)}</dd></div></dl><p className="detail-muted">Premios por jugador. Se acreditan al cierre definitivo.</p></>}
  <p className="detail-muted">Ocho {tournament.tournamentType === 'Equipo' ? 'equipos de cinco titulares' : 'jugadores'}. Si no se completa al iniciar, se cancela y se devuelven las entradas.</p>
  {tournament.closedAt && <p className="detail-closed">Cierre definitivo: premios y Elo procesados. Resultados bloqueados.</p>}
 </section>;
}
