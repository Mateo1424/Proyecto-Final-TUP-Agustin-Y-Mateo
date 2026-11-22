import { GAMES } from '../../api/rankings';
import RankingTable from './RankingTable';
import RankingPagination from './RankingPagination';
import './rankings.css';

export default function RankingsView({ kind, game, page, items, currentUserId, loading, error, refresh, onKind, onGame, onPage }) {
  return <div className="arena-rankings">
    <header className="arena-page-heading"><div><p className="arena-eyebrow">Competencia</p><h1 className="arena-title">Rankings</h1><p className="rankings-intro">Clasificación Elo por videojuego. Los puntos de recompensa no forman parte de este ranking.</p></div><button onClick={refresh} disabled={loading} className="arena-button">Actualizar</button></header>
    <div className="rankings-filters">
      <div role="group" aria-label="Tipo de clasificación" className="rankings-kind">{[['players', 'Jugadores'], ['teams', 'Equipos']].map(([value, label]) => <button key={value} aria-pressed={kind === value} onClick={() => onKind(value)} className="arena-button">{label}</button>)}</div>
      <div className="rankings-game"><label htmlFor="rankings-game">Videojuego</label><select id="rankings-game" value={game} onChange={event => onGame(event.target.value)}>{GAMES.map(value => <option key={value}>{value}</option>)}</select></div>
    </div>
    <section className="rankings-results" aria-labelledby="rankings-results-heading">
      <div className="rankings-results-heading"><h2 id="rankings-results-heading">{kind === 'teams' ? 'Equipos' : 'Jugadores'} de {game}</h2><span>Elo competitivo</span></div>
      {loading ? <p role="status" className="arena-state">Cargando ranking...</p> : error ? <div role="alert" className="rankings-error"><p>{error}</p><button onClick={refresh} className="arena-button">Reintentar</button></div> : <RankingTable items={items} kind={kind} page={page} currentUserId={currentUserId} />}
    </section>
    <RankingPagination page={page} hasMore={!error && items.length === 20} loading={loading} onPage={onPage} />
  </div>;
}
