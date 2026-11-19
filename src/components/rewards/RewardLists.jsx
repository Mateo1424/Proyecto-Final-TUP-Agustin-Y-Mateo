import { useState } from 'react';
import { points, money, dateTime } from '../../utils/format.js';
import useRewardsData from '../../hooks/useRewardsData.js';
import { getMovements, getRedemptions } from '../../api/rewards.js';

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
  return <article className="reward-panel space-y-3">
    <h3 className="text-lg font-bold">{receipt.product.product}</h3>
    <p>{receipt.product.platform} · {receipt.product.region} · {money(receipt.product.faceValue, receipt.product.currency)}</p>
    <p>{points(receipt.costPoints)} · {dateTime(receipt.createdAt)}</p>
    <p className="reward-muted break-all text-xs">Comprobante: {receipt.id}</p>
    <p className="font-bold">Código de prueba. No funciona en ninguna plataforma.</p>
    <code className="block break-all select-all rounded border border-current p-3 text-sm">{receipt.code}</code>
    <button type="button" className="reward-button" onClick={copyCode}>Copiar código de prueba</button>
    <p role="status" className="text-sm">{copyState}</p>
  </article>;
}

const reasons = { welcome: 'Bienvenida', welcome_bonus: 'Bienvenida', tournament_entry: 'Inscripción a torneo', tournament_prize: 'Premio de torneo', tournament_participation: 'Participación', tournament_champion: 'Campeón del torneo', reward_redemption: 'Canje de recompensa', refund: 'Devolución', tournament_refund: 'Devolución de inscripción', free_participation: 'Participación gratuita', free_win: 'Victoria gratuita' };

export function HistoryList({ kind }) {
  const [page, setPage] = useState(1);
  const loader = kind === 'redemptions' ? getRedemptions : getMovements;
  const state = useRewardsData(loader, page);
  const items = state.data?.items || [];
  return <section aria-label={kind === 'redemptions' ? 'Mis canjes' : 'Movimientos'}>
    <DataState {...state} empty={!items.length}>
      <div className="space-y-4">{items.map(item => kind === 'redemptions' ? <Receipt key={item.id} receipt={item} /> : <article key={item.id} className="reward-panel flex flex-wrap justify-between gap-3">
        <div className="min-w-0"><h3 className="font-bold">{reasons[item.reason] || 'Movimiento de puntos'}</h3><p className="reward-muted text-sm">{dateTime(item.createdAt)}</p><p className="reward-muted break-all text-xs">Referencia: {item.reference}</p>{item.reversesId && <p className="text-sm">Devolución de un movimiento anterior.</p>}</div>
        <p className="font-bold">{item.amount > 0 ? '+' : ''}{points(item.amount)}</p>
      </article>)}</div>
    </DataState>
    <nav aria-label="Páginas del historial" className="mt-6 flex items-center gap-4">
      <button type="button" className="reward-button" disabled={page === 1 || state.loading} onClick={() => setPage(value => value - 1)}>Anterior</button>
      <span>Página {page}</span>
      <button type="button" className="reward-button" disabled={state.loading || !!state.error || items.length < 20} onClick={() => setPage(value => value + 1)}>Siguiente</button>
    </nav>
  </section>;
}
