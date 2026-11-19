export default function EloSummary({ current }) {
  if (current.rating == null) return <div className="space-y-2"><p className="font-semibold text-gray-200">Sin clasificación</p><p className="text-sm text-gray-400">Todavía no hay partidos elegibles cerrados para este juego.</p></div>;
  return <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-5">
    <div><dt className="text-gray-400">Elo</dt><dd className="mt-1 text-2xl font-bold text-purple-300">{current.rating}</dd></div>
    <div><dt className="text-gray-400">Posición</dt><dd className="mt-1 text-2xl font-bold">#{current.position}</dd></div>
    <div><dt className="text-gray-400">Partidas elegibles</dt><dd className="mt-1">{current.matchesPlayed}</dd></div>
    <div><dt className="text-gray-400">Ganadas</dt><dd className="mt-1 text-emerald-400">{current.matchesWon}</dd></div>
    <div><dt className="text-gray-400">Perdidas</dt><dd className="mt-1 text-red-400">{current.matchesLost}</dd></div>
  </dl>;
}
