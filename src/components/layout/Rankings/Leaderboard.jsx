import { useCallback, useState } from 'react';
import { GAMES, getRankings } from '../../../api/rankings';
import { useEloRequest } from '../../../hooks/useEloRequest';
import { getStoredUser } from '../../../utils/Roles';
import RankingTable from '../../rankings/RankingTable';
import RankingPagination from '../../rankings/RankingPagination';

export default function Leaderboard() {
  const [kind, setKind] = useState('players');
  const [game, setGame] = useState('Valorant');
  const [page, setPage] = useState(1);
  const load = useCallback(signal => getRankings(kind, game, page, signal), [kind, game, page]);
  const { data, loading, error, refresh } = useEloRequest(load, `${kind}:${game}:${page}`);
  const items = data?.items ?? [];
  const currentUser = getStoredUser();
  return <div className="mx-auto min-h-screen max-w-5xl space-y-6 p-6 text-white">
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div><h1 className="text-3xl font-extrabold tracking-wide">Tabla de Clasificación</h1><p className="mt-1 text-sm text-gray-400">Elo por videojuego. Los puntos de recompensa no forman parte de este ranking.</p></div>
      <button onClick={refresh} disabled={loading} className="cursor-pointer rounded-lg border border-gray-700 px-4 py-2 text-sm hover:border-purple-500 disabled:cursor-default disabled:opacity-40">Actualizar</button>
    </header>
    <div className="flex flex-wrap items-center gap-4">
      <div role="group" aria-label="Tipo de clasificación" className="flex gap-2">{[['players', 'Jugadores'], ['teams', 'Equipos']].map(([value, label]) => <button key={value} aria-pressed={kind === value} onClick={() => { setKind(value); setPage(1); }} className={`cursor-pointer rounded-lg border px-4 py-2 text-sm font-semibold ${kind === value ? 'border-purple-500 bg-purple-600' : 'border-gray-700 bg-[#161b22] hover:border-purple-500'}`}>{label}</button>)}</div>
      <label className="flex items-center gap-2 text-sm text-gray-300">Videojuego<select value={game} onChange={event => { setGame(event.target.value); setPage(1); }} className="rounded-lg border border-gray-700 bg-[#161b22] p-2 text-white">{GAMES.map(value => <option key={value}>{value}</option>)}</select></label>
    </div>
    <section aria-label={`${kind === 'teams' ? 'Equipos' : 'Jugadores'} de ${game}`} className="overflow-hidden rounded-xl border border-gray-800 bg-[#161b22]">
      {loading ? <p role="status" className="py-12 text-center text-sm text-gray-400">Cargando ranking...</p> : error ? <div role="alert" className="space-y-3 p-6"><p className="text-red-400">{error}</p><button onClick={refresh} className="cursor-pointer text-purple-300 underline">Reintentar</button></div> : <RankingTable items={items} kind={kind} page={page} currentUserId={currentUser?.id} />}
    </section>
    <RankingPagination page={page} hasMore={!error && items.length === 20} loading={loading} onPage={setPage} />
  </div>;
}
