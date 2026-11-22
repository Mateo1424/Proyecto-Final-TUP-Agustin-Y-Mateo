import { Link } from '../../routing/navigation';

export default function RankingTable({ items, kind, page, currentUserId }) {
  if (!items.length) return <p className="rankings-empty">No hay registros en esta clasificación todavía.</p>;
  return <table className="ranking-table">
    <caption className="sr-only">Clasificación Elo de {kind === 'teams' ? 'equipos' : 'jugadores'}</caption>
    <thead><tr>
      <th scope="col">#</th><th scope="col">{kind === 'teams' ? 'Equipo' : 'Jugador'}</th><th scope="col">Elo</th><th scope="col">Partidas (G / P)</th><th scope="col">Victorias</th>
    </tr></thead>
    <tbody>{items.map((item, index) => {
      const isMe = kind === 'players' && item.entityId === currentUserId;
      const target = kind === 'teams' ? `/teams/${item.entityId}` : isMe ? '/profile' : `/users/${item.entityId}`;
      const rate = item.matchesPlayed ? Math.round(item.matchesWon * 100 / item.matchesPlayed) : 0;
      return <tr key={item.entityId} className={isMe ? 'is-me' : undefined}>
        <td className="ranking-position">{(page - 1) * 20 + index + 1}</td>
        <td><Link to={target} className="ranking-name">{item.name}{isMe && <span className="ranking-self">Tú</span>}</Link></td>
        <td><span className="ranking-mobile-label" aria-hidden="true">Elo</span>{item.rating == null ? <span className="ranking-unrated">Sin clasificación</span> : <span className="ranking-rating">{item.rating}</span>}</td>
        <td className="ranking-record"><span className="ranking-mobile-label" aria-hidden="true">Partidas (G / P)</span><span className="ranking-won">{item.matchesWon}</span> / <span className="ranking-lost">{item.matchesLost}</span><span className="ranking-played">({item.matchesPlayed})</span></td>
        <td className="ranking-win-rate"><span className="ranking-mobile-label" aria-hidden="true">Victorias</span>{rate}%</td>
      </tr>;
    })}</tbody>
  </table>;
}
