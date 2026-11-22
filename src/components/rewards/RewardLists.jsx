import { useState } from 'react';
import { points, money, dateTime } from '../../utils/format.js';
import useRewardsData from '../../hooks/useRewardsData.js';
import { getMovements, getRedemptions } from '../../api/rewards.js';
import { Link } from '../../routing/navigation';

export function DataState({ loading, error, reload, empty, children }) {
  if (loading) return <p role="status" className="py-8">Cargando…</p>;
  if (error) return <div role="alert" className="py-5"><p>{error}</p><button type="button" className="reward-button mt-3" onClick={reload}>Reintentar</button></div>;
  if (empty) return <p className="py-8">Todavía no hay registros.</p>;
  return children;
}

export function Receipt({ receipt }) {
  const [copyState, setCopyState] = useState('');
  async function copyCode() {
    try { await navigator.clipboard.writeText(receipt.code); setCopyState('Código copiado.'); }
    catch { setCopyState('No se pudo copiar. Seleccioná el código y copialo manualmente.'); }
  }
  return <article className="reward-panel reward-receipt">
    <div className="reward-receipt-heading"><div><p className="reward-eyebrow">{receipt.product.platform}</p><h3>{receipt.product.product}</h3><p className="reward-muted">{receipt.product.region} · {money(receipt.product.faceValue, receipt.product.currency)}</p></div><strong className="reward-receipt-cost">{points(receipt.costPoints)}</strong></div>
    <p className="reward-muted"><time dateTime={receipt.createdAt}>{dateTime(receipt.createdAt)}</time></p>
    <p className="reward-reference">Comprobante: <span>{receipt.id}</span></p>
    <div className="reward-code-area"><p className="font-bold">Código de prueba. No funciona en ninguna plataforma.</p><code className="reward-code">{receipt.code}</code><button type="button" className="reward-button" onClick={copyCode}>Copiar código de prueba</button><p role="status" className="text-sm">{copyState}</p></div>
  </article>;
}

const reasons = { welcome: 'Bienvenida', welcome_bonus: 'Bienvenida', tournament_entry: 'Inscripción a torneo', tournament_prize: 'Premio de torneo', tournament_participation: 'Participación', tournament_champion: 'Campeón del torneo', reward_redemption: 'Canje de recompensa', refund: 'Devolución', tournament_refund: 'Devolución de inscripción', free_participation: 'Participación gratuita', free_win: 'Victoria gratuita' };

export function MovementRow({ item }) {
  const tournament = ['tournament_entry', 'tournament_prize'].includes(item.reason) && /^[a-fA-F0-9]{24}$/.test(item.reference || '');
  return <article className="reward-panel reward-movement">
    <div><h3>{reasons[item.reason] || 'Movimiento de puntos'}</h3><p className="reward-muted"><time dateTime={item.createdAt}>{dateTime(item.createdAt)}</time></p><p className="reward-reference">Referencia: <span>{item.reference}</span></p>{item.reversesId && <p className="reward-muted">Devolución de un movimiento anterior.</p>}{tournament && <Link to={`/tournaments/${item.reference}`} className="reward-text-button">Ver torneo</Link>}</div>
    <p className="reward-movement-amount" data-direction={item.amount > 0 ? 'credit' : 'debit'}>{item.amount > 0 ? '+' : ''}{points(item.amount)}</p>
  </article>;
}

export function HistoryList({ kind }) {
  const [page, setPage] = useState(1);
  const loader = kind === 'redemptions' ? getRedemptions : getMovements;
  const state = useRewardsData(loader, page);
  const items = state.data?.items || [];
  return <section aria-label={kind === 'redemptions' ? 'Mis canjes' : 'Movimientos'}>
    <div className="reward-history-heading"><h2>{kind === 'redemptions' ? 'Mis canjes' : 'Movimientos'}</h2><p className="reward-muted">{kind === 'redemptions' ? 'Comprobantes y códigos ficticios de tus canjes confirmados.' : 'Entradas, premios, devoluciones y canjes registrados en tu saldo.'}</p></div>
    <DataState {...state} empty={!items.length}>
      <div className="space-y-4">{items.map(item => kind === 'redemptions' ? <Receipt key={item.id} receipt={item} /> : <MovementRow key={item.id} item={item} />)}</div>
    </DataState>
    <nav aria-label="Páginas del historial" className="mt-6 flex items-center gap-4">
      <button type="button" className="reward-button" disabled={page === 1 || state.loading} onClick={() => setPage(value => value - 1)}>Anterior</button>
      <span>Página {page}</span>
      <button type="button" className="reward-button" disabled={state.loading || !!state.error || items.length < 20} onClick={() => setPage(value => value + 1)}>Siguiente</button>
    </nav>
  </section>;
}
