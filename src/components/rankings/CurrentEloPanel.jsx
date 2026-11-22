import { useCallback, useId, useState } from 'react';
import { GAMES, getCurrentElo, getEloHistory } from '../../api/rankings';
import { useEloRequest } from '../../hooks/useEloRequest';
import EloSummary from './EloSummary';
import EloHistory from './EloHistory';
import RankingPagination from './RankingPagination';

function GameElo({ kind, entityId, game }) {
  const [page, setPage] = useState(1);
  const loadCurrent = useCallback(signal => getCurrentElo(kind, entityId, game, signal), [kind, entityId, game]);
  const current = useEloRequest(loadCurrent, `${kind}:${entityId}:${game}`);
  const loadHistory = useCallback(signal => getEloHistory(kind, entityId, game, page, signal), [kind, entityId, game, page]);
  const history = useEloRequest(loadHistory, `${kind}:${entityId}:${game}:${page}`);
  return <div className="space-y-5">
    {current.loading ? <p role="status" className="text-gray-400">Cargando Elo...</p> : current.error ? <div role="alert"><p className="text-red-400">{current.error}</p><button onClick={current.refresh} className="mt-2 cursor-pointer text-purple-300 underline">Reintentar Elo</button></div> : current.data && <EloSummary current={current.data} />}
    <div className="border-t border-gray-800 pt-4">
      <h3 className="mb-2 font-semibold">Historial de Elo</h3>
      {history.loading ? <p role="status" className="text-sm text-gray-400">Cargando historial...</p> : history.error ? <div role="alert"><p className="text-red-400">{history.error}</p><button onClick={history.refresh} className="mt-2 cursor-pointer text-purple-300 underline">Reintentar historial</button></div> : <EloHistory items={history.data?.items ?? []} />}
      <RankingPagination page={page} hasMore={!history.error && (history.data?.items?.length ?? 0) === 20} loading={history.loading} onPage={setPage} />
    </div>
  </div>;
}

export default function CurrentEloPanel({ kind = 'players', entityId, games = [], prototype = false }) {
  const selectId = useId();
  const [chosen, setChosen] = useState('');
  const available = GAMES.filter(game => games.some(value => (typeof value === 'string' ? value : value?.gameName)?.trim().toLowerCase() === game.toLowerCase()));
  const game = available.includes(chosen) ? chosen : available[0];
  return <section aria-label="Clasificación Elo" className={prototype ? 'arena-profile-panel arena-profile-elo space-y-5' : 'space-y-5 rounded-xl border border-gray-800 bg-[#161b22] p-6 text-white'}>
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div><h2 className="text-xl font-bold">Clasificación Elo {kind === 'teams' ? 'del equipo' : 'por juego'}</h2><p className="mt-1 text-sm text-gray-400">Rating competitivo. Los puntos de recompensa se consultan en Recompensas.</p></div>
      {available.length > 0 && <div><label htmlFor={selectId} className="mr-2 text-sm text-gray-400">Videojuego</label><select id={selectId} value={game} onChange={event => setChosen(event.target.value)} className="rounded-lg border border-gray-700 bg-[#0d1117] p-2 text-sm">{available.map(value => <option key={value}>{value}</option>)}</select></div>}
    </div>
    {game && entityId ? <GameElo key={`${kind}:${entityId}:${game}`} kind={kind} entityId={entityId} game={game} /> : <p className="text-sm text-gray-400">No hay videojuegos compatibles asociados para consultar la clasificación.</p>}
  </section>;
}
