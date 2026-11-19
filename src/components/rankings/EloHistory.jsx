import { Link } from '../../routing/navigation';

export default function EloHistory({ items }) {
  if (!items.length) return <p className="text-sm text-gray-400">No hay ajustes de Elo para este juego.</p>;
  return <ol className="divide-y divide-gray-800">
    {items.map(item => {
      const delta = item.after - item.before;
      return <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
        <div className="space-y-1">
          <Link to={`/tournaments/${item.tournamentId}`} className="text-purple-300 hover:underline">Ver torneo · Ronda {item.round}, partido {item.position + 1}</Link>
          <p className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleString('es-AR')} · {item.result === 1 ? 'Victoria' : 'Derrota'}</p>
        </div>
        <p>{item.before} → {item.after} <strong className={delta >= 0 ? 'text-emerald-400' : 'text-red-400'}>({delta > 0 ? '+' : ''}{delta})</strong></p>
      </li>;
    })}
  </ol>;
}
