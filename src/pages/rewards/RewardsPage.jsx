import { useEffect, useRef, useState } from 'react';
import { getCatalog, redeemReward } from '../../api/rewards.js';
import { useWalletStore } from '../../store/wallet.js';
import { getStoredUser } from '../../utils/Roles.js';
import { points, money } from '../../utils/format.js';
import { beginAttempt, finishAttempt, loadAttempt, isDefiniteRejection } from '../../utils/redemptionAttempt.js';
import { redemptionErrorMessage } from '../../utils/redemptionErrors.js';
import useRewardsData from '../../hooks/useRewardsData.js';
import { DataState, HistoryList, Receipt } from '../../components/rewards/RewardLists.jsx';
import RewardConfirmation from '../../components/rewards/RewardConfirmation.jsx';
import './rewards.css';

const loadCatalog = (_page, signal) => getCatalog(signal);
const sections = [['catalog', 'Catálogo'], ['redemptions', 'Mis canjes'], ['movements', 'Movimientos']];

export default function RewardsPage() {
  const [tab, setTab] = useState('catalog');
  const [selected, setSelected] = useState(null);
  const [pending, setPending] = useState(null);
  const [storageError, setStorageError] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [historyRevision, setHistoryRevision] = useState(0);
  const running = useRef(false);
  const mounted = useRef(false);
  const balance = useWalletStore(state => state.balance);
  const walletLoading = useWalletStore(state => state.loading);
  const walletError = useWalletStore(state => state.error);
  const refresh = useWalletStore(state => state.refresh);
  const catalog = useRewardsData(loadCatalog);
  const userId = getStoredUser()?.id;

  useEffect(() => {
    mounted.current = true;
    const recover = () => {
      refresh();
      try { setPending(loadAttempt(window.sessionStorage, userId)); setStorageError(''); }
      catch (failure) { setStorageError(failure.message); }
    };
    // Defer initial updates, and refresh when returning from another page/window.
    queueMicrotask(() => { if (mounted.current) recover(); });
    window.addEventListener('focus', recover);
    return () => { mounted.current = false; window.removeEventListener('focus', recover); };
  }, [userId, refresh]);

  async function confirm() {
    if (running.current || !selected) return;
    running.current = true; setBusy(true); setError('');
    try {
      const attempt = beginAttempt(window.sessionStorage, userId, selected.id);
      setPending(attempt);
      const result = await redeemReward(attempt.productId, attempt.key);
      if (!mounted.current || getStoredUser()?.id !== userId) return;
      try { finishAttempt(window.sessionStorage, userId); setPending(null); }
      catch { setStorageError('El canje está confirmado. No se pudo limpiar la clave guardada; recuperar devuelve el mismo comprobante.'); }
      setReceipt(result); setSelected(null); setHistoryRevision(value => value + 1);
      await refresh();
    } catch (failure) {
      if (!mounted.current || getStoredUser()?.id !== userId) return;
      if (isDefiniteRejection(failure)) {
        try { finishAttempt(window.sessionStorage, userId); setPending(null); }
        catch { setStorageError('No se pudo actualizar la clave guardada. Reintentá en esta pestaña.'); }
      }
      setError(redemptionErrorMessage(failure));
    } finally {
      running.current = false;
      if (mounted.current) setBusy(false);
    }
  }

  function recoverPending() {
    const product = catalog.data?.items?.find(item => item.id === pending.productId);
    setSelected(product || { id: pending.productId, product: 'Canje pendiente', platform: pending.productId, region: 'Según el comprobante original', currency: 'USD', faceValue: null, costPoints: null, compatibility: 'Se recuperará el producto y costo originales desde el servidor.' });
    setError('');
  }

  return <div className="rewards-page min-h-full px-5 py-8 md:px-10">
    <header className="mb-8 flex flex-wrap items-end justify-between gap-6">
      <div><p className="reward-eyebrow">NEXUS ARENA</p><h1 id="rewards-title" tabIndex={-1} className="reward-title">Recompensas</h1><p className="reward-muted mt-3">Usá tus puntos y consultá tus canjes.</p></div>
      <div className="reward-balance"><p className="reward-muted text-sm">Tu saldo</p><p className="text-3xl font-bold">{balance === null ? walletLoading ? 'Cargando…' : 'Sin consultar' : points(balance)}</p><button type="button" className="reward-text-button mt-2" onClick={refresh} disabled={walletLoading}>Actualizar saldo</button>{walletError && <p role="alert" className="mt-2 max-w-sm text-sm">{walletError}</p>}</div>
    </header>
    <p className="reward-notice mb-6">Canjes de prueba: todos los códigos son ficticios y no funcionan en las plataformas. Catálogo US / USD; revisá la compatibilidad de cada producto.</p>
    {storageError && <p role="alert" className="reward-notice mb-4">{storageError}</p>}
    {pending && <div className="reward-notice mb-4"><p>Hay un canje sin confirmar en esta pestaña. Recuperá su resultado antes de iniciar otro.</p><button type="button" className="reward-button mt-3" disabled={busy || !!storageError} onClick={recoverPending}>Recuperar canje pendiente</button></div>}
    {receipt && <section className="mb-6" aria-label="Último canje confirmado"><p role="status" className="mb-3 font-bold">Canje confirmado. El comprobante también está en Mis canjes.</p><Receipt receipt={receipt} /></section>}
    <nav aria-label="Secciones de recompensas" className="reward-tabs mb-7 flex flex-wrap gap-2">{sections.map(([id, label]) => <button type="button" key={id} className="reward-tab" aria-current={tab === id ? 'page' : undefined} onClick={() => setTab(id)}>{label}</button>)}</nav>
    {tab === 'catalog' ? <section aria-label="Catálogo"><DataState {...catalog} empty={!catalog.data?.items?.length}>
      <div className="grid gap-4 lg:grid-cols-2">{catalog.data?.items?.map(product => <article className="reward-panel flex flex-col items-start gap-3" key={product.id}>
        <p className="reward-eyebrow">{product.platform}</p><h2 className="text-xl font-bold">{product.product}</h2><p>{money(product.faceValue, product.currency)} · {product.region}</p><p className="reward-muted text-sm">{product.compatibility}</p><p className="text-2xl font-bold">{points(product.costPoints)}</p>
        {!product.available && <p>{product.unavailableReason || 'Producto no disponible.'}</p>}
        {product.sourceUrl && <a className="reward-text-button text-sm" href={product.sourceUrl} target="_blank" rel="noreferrer">Información del producto</a>}
        <button type="button" className="reward-button reward-primary mt-auto" disabled={!product.available || balance === null || balance < product.costPoints || !!pending || !!storageError || busy} onClick={() => { setSelected(product); setError(''); }}>{!product.available ? 'No disponible' : balance !== null && balance < product.costPoints ? 'Puntos insuficientes' : 'Canjear puntos'}</button>
      </article>)}</div>
    </DataState></section> : <HistoryList key={`${tab}:${historyRevision}`} kind={tab} />}
    {selected && <RewardConfirmation product={selected} balance={balance} pending={pending} busy={busy} error={error} onConfirm={confirm} onClose={() => setSelected(null)} />}
  </div>;
}
