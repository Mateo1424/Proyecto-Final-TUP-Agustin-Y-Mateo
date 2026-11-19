import { Link } from '../../routing/navigation';

export default function RankingTable({ items, kind, page, currentUserId }) {
  if (!items.length) return <p className="py-12 text-center text-sm text-gray-400">No hay registros en esta clasificación todavía.</p>;
  return <div className="overflow-x-auto"><table className="w-full border-collapse text-left text-sm">
    <caption className="sr-only">Clasificación Elo de {kind === 'teams' ? 'equipos' : 'jugadores'}</caption>
    <thead><tr className="border-b border-gray-800 bg-black/40 text-xs uppercase text-gray-400">
      <th scope="col" className="px-4 py-3">#</th><th scope="col" className="px-4 py-3">{kind === 'teams' ? 'Equipo' : 'Jugador'}</th><th scope="col" className="px-4 py-3">Elo</th><th scope="col" className="px-4 py-3">Partidas (G / P)</th><th scope="col" className="px-4 py-3">Victorias</th>
    </tr></thead>
    <tbody className="divide-y divide-gray-800/60">{items.map((item, index) => {
      const isMe = kind === 'players' && item.entityId === currentUserId;
      const target = kind === 'teams' ? `/teams/${item.entityId}` : isMe ? '/profile' : `/users/${item.entityId}`;
      const rate = item.matchesPlayed ? Math.round(item.matchesWon * 100 / item.matchesPlayed) : 0;
      return <tr key={item.entityId} className={`hover:bg-gray-800/30 ${isMe ? 'bg-purple-950/20' : ''}`}>
        <td className="px-4 py-4 text-gray-300">{(page - 1) * 20 + index + 1}</td>
        <td className="px-4 py-4"><Link to={target} className="font-semibold hover:text-purple-300">{item.name}{isMe && <span className="ml-2 text-xs text-purple-300">Tú</span>}</Link></td>
        <td className="px-4 py-4 font-bold text-purple-300">{item.rating}</td>
        <td className="px-4 py-4"><span className="text-emerald-400">{item.matchesWon}</span> / <span className="text-red-400">{item.matchesLost}</span><span className="ml-2 text-xs text-gray-400">({item.matchesPlayed})</span></td>
        <td className="px-4 py-4">{rate}%</td>
      </tr>;
    })}</tbody>
  </table></div>;
}
