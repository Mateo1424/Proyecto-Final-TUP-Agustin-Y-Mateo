import { points } from '../../utils/format.js';
export default function TournamentEconomy({ tournament }) {
 return <section className="mb-6 rounded-xl border border-gray-800 bg-[#161b22] p-5">
  <h2 className="mb-2 text-lg font-bold">Puntos y premios</h2>
  <p>Entrada por jugador: <strong>{tournament.isFree ? 'Gratis' : points(tournament.entryPoints)}</strong></p>
  {tournament.isFree ? <p className="mt-2 text-sm text-gray-300">50 puntos por completar con participación válida y 100 adicionales al ganar. Máximo 200 por día de Córdoba; abandonos y pases sin jugar no cuentan.</p> : <p className="mt-2 text-sm text-gray-300">Por jugador: campeón {points(tournament.championPoints)}, subcampeón {points(tournament.runnerUpPoints)}, semifinalista {points(tournament.semifinalPoints)}. Los premios se acreditan al cierre definitivo.</p>}
  <p className="mt-2 text-sm text-gray-400">Ocho {tournament.tournamentType === 'Equipo' ? 'equipos de cinco titulares' : 'jugadores'}. Si no se completa al iniciar, se cancela y se devuelven las entradas.</p>
  {tournament.closedAt && <p className="mt-3 font-semibold text-emerald-300">Cierre definitivo: premios y Elo procesados. Resultados bloqueados.</p>}
 </section>;
}
