import { useState } from 'react';
import { Link } from '../../routing/navigation.js';

const roundName = (round,total) => ({0:'Final',1:'Semifinales',2:'Cuartos de final'}[total-round] || `Ronda ${round}`);
const formatStat = (key,value) => key === 'money' ? `$${value.toLocaleString('es-AR')}` : ['credits','gold'].includes(key) ? value.toLocaleString('es-AR') : key === 'possession' ? `${value}%` : String(value);
const kda = stats => stats && 'kills' in stats && 'deaths' in stats ? ((stats.kills + (stats.assists ?? 0)) / Math.max(1,stats.deaths)).toFixed(2) : null;

function StatEditor({ label, inputId, value, step, max, disabled, onCommit }) {
  const [draft,setDraft] = useState(String(value));
  const [focused,setFocused] = useState(false);
  const commit = n => {
    let next = Math.max(0,Math.round(n));
    if (max != null) next = Math.min(max,next);
    if (next !== value) onCommit(next); else setDraft(String(value));
  };
  return <div className="match-stat-editor">
    <label className="sr-only" htmlFor={inputId}>{label}</label>
    <button type="button" disabled={disabled} onClick={() => commit(value-step)} className="match-step" aria-label={`Restar ${step} a ${label}`}>−</button>
    <input id={inputId} type="number" min={0} max={max ?? undefined} value={focused ? draft : String(value)} disabled={disabled}
      onFocus={() => { setDraft(String(value)); setFocused(true); }} onChange={event => setDraft(event.target.value)}
      onBlur={() => { setFocused(false); const n=Number(draft); commit(Number.isFinite(n) ? n : value); }}
      onKeyDown={event => { if(event.key === 'Enter') event.currentTarget.blur(); }} />
    <button type="button" disabled={disabled} onClick={() => commit(value+step)} className="match-step" aria-label={`Sumar ${step} a ${label}`}>+</button>
  </div>;
}

function PlayerBox({ player, score, winner, stats, profilePath, side, canEditScore, saving, unit, adjustScore }) {
  const ratio = kda(stats);
  return <div className={`match-player match-side-${side.toLowerCase()}`}>
    <p className="match-side-label">Rival {side}</p>
    {player ? <Link to={profilePath} className="match-player-name" title={`Ver perfil de ${player.username}`}>{player.username}</Link> : <h2 className="match-player-name">Por definir</h2>}
    <strong className="match-score" aria-label={`Marcador de ${player?.username || `rival ${side}`}: ${score ?? 0}`}>{score ?? 0}</strong>
    {winner && <span className="match-winner">Ganador</span>}
    {ratio && <span className="match-muted">KDA {ratio}</span>}
    {canEditScore && <div className="match-score-controls">
      <button type="button" disabled={saving} onClick={() => adjustScore(side,-1)} className="match-step" aria-label={`Restar uno al marcador de ${player?.username || `rival ${side}`}`}>−</button>
      <span>{unit}</span>
      <button type="button" disabled={saving} onClick={() => adjustScore(side,1)} className="match-step" aria-label={`Sumar uno al marcador de ${player?.username || `rival ${side}`}`}>+</button>
    </div>}
  </div>;
}

export default function MatchPresentation({detail,id,user,moderator,saving,actionError,adjustScore,saveStat}) {
  const {match,game} = detail;
  const finished = match.status === 'Finalizado';
  const inPlay = detail.tournamentStatus === 'En curso' || detail.tournamentStatus === 'Finalizado';
  const canEditStats = moderator && inPlay && !detail.closedAt;
  const canEditScore = canEditStats && !finished;
  const profilePath = player => player && user && player.userId === user.id ? '/profile' : `/users/${player?.userId}`;
  const stats = game.stats;
  return <article className="arena-match">
    <header className="arena-page-heading">
      <div><p className="arena-eyebrow">{game.name} · {roundName(match.round,detail.totalRounds)}</p><h1 className="arena-title">Detalle del partido</h1><p className="match-muted">{detail.tournamentTitle}</p></div>
      <Link to={`/tournaments/${id}`} className="arena-detail-link">Volver al torneo</Link>
    </header>
    <section className="match-scoreboard" aria-label="Marcador del partido">
      <div className="match-scoreboard-meta"><span>{detail.closedAt ? 'Cerrado definitivamente' : match.status}</span><span>{game.scoreUnit}</span></div>
      <div className="match-rivals">
        <PlayerBox player={match.playerA} score={match.scoreA} winner={Boolean(match.winnerUserId && match.playerA?.userId === match.winnerUserId)} stats={detail.statsA} profilePath={profilePath(match.playerA)} side="A" canEditScore={canEditScore} saving={saving} unit={game.scoreUnit} adjustScore={adjustScore} />
        <span className="match-versus">VS</span>
        <PlayerBox player={match.playerB} score={match.scoreB} winner={Boolean(match.winnerUserId && match.playerB?.userId === match.winnerUserId)} stats={detail.statsB} profilePath={profilePath(match.playerB)} side="B" canEditScore={canEditScore} saving={saving} unit={game.scoreUnit} adjustScore={adjustScore} />
      </div>
      {match.isWalkover && <p className="match-notice">Ganó por descalificación del rival.</p>}
      {game.winScore && !finished && <p className="match-notice">Gana el primero en llegar a {game.winScore} {game.scoreUnit.toLowerCase()}.</p>}
      {detail.closedAt ? <p className="match-notice">Resultados y estadísticas bloqueados por el cierre definitivo.</p> : !finished && !moderator && <p className="match-notice">Los datos se actualizan automáticamente cada 15 segundos mientras esta página está visible.</p>}
    </section>
    {actionError && <p role="alert" className="match-error">{actionError}</p>}
    <section className="match-statistics" aria-labelledby="match-stats-heading">
      <header className="match-stats-heading"><div><p className="arena-eyebrow">Comparación por rival</p><h2 id="match-stats-heading">Estadísticas de la partida</h2></div>{canEditStats && <p className="match-editor-note">Modo moderador · {saving ? 'Guardando…' : 'Los cambios se guardan al confirmar el campo.'}</p>}</header>
      {stats.length === 0 ? <p className="arena-state">Este juego todavía no tiene estadísticas configuradas.</p> : <div className="match-stat-list">
        {stats.map(stat => {
          const a=detail.statsA?.[stat.key] ?? 0, b=detail.statsB?.[stat.key] ?? 0;
          const total=a+b;
          return <section className="match-stat-row" key={stat.key} aria-label={stat.label}>
            <h3>{stat.label}</h3>
            <div className="match-stat-value match-stat-a"><span className="match-stat-player">{match.playerA?.username || 'Rival A'}</span>
              {canEditStats ? <StatEditor key={`${match.id}:A:${stat.key}`} label={`${stat.label} de ${match.playerA?.username || 'Rival A'}`} inputId={`stat-${match.id}-A-${stat.key}`} value={a} step={stat.step} max={stat.max} disabled={saving} onCommit={value => saveStat('A',stat.key,value)} /> : <strong>{formatStat(stat.key,a)}</strong>}
            </div>
            <div className="match-stat-value match-stat-b"><span className="match-stat-player">{match.playerB?.username || 'Rival B'}</span>
              {canEditStats ? <StatEditor key={`${match.id}:B:${stat.key}`} label={`${stat.label} de ${match.playerB?.username || 'Rival B'}`} inputId={`stat-${match.id}-B-${stat.key}`} value={b} step={stat.step} max={stat.max} disabled={saving} onCommit={value => saveStat('B',stat.key,value)} /> : <strong>{formatStat(stat.key,b)}</strong>}
            </div>
            <div className="match-stat-bar" aria-hidden="true">{total>0 && <><span style={{width:`${a/total*100}%`}} /><span style={{width:`${b/total*100}%`}} /></>}</div>
          </section>;
        })}
      </div>}
    </section>
  </article>;
}
