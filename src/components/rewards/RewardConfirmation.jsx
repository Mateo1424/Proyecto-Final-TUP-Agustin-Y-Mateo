import { useEffect, useRef } from 'react';
import { points, money } from '../../utils/format.js';

export default function RewardConfirmation({ product, balance, pending, busy, error, onConfirm, onClose }) {
  const dialog = useRef(null);
  const uncertain = pending?.productId === product.id;
  const insufficient = balance !== null && balance < product.costPoints;
  useEffect(() => {
    const previous = document.activeElement;
    dialog.current?.showModal();
    return () => { queueMicrotask(() => { if (previous?.isConnected && !previous.disabled) previous.focus(); else document.getElementById('rewards-title')?.focus(); }); };
  }, []);
  return <dialog ref={dialog} className="rewards-dialog" aria-labelledby="reward-confirm-title" aria-describedby="reward-confirm-description" onCancel={event => { event.preventDefault(); if (!busy) onClose(); }}>
    <div className="space-y-5 p-6">
      <h2 id="reward-confirm-title" className="text-2xl font-bold">{uncertain ? 'Recuperar canje' : 'Confirmar canje'}</h2>
      <div id="reward-confirm-description" className="space-y-2">
        <p className="font-bold">{product.product}</p><p>{product.platform} · {product.region}{product.faceValue !== null && <> · {money(product.faceValue, product.currency)}</>}</p>
        <p>{product.compatibility}</p>{product.costPoints !== null && <p>Costo del catálogo actual: {points(product.costPoints)}</p>}
        {balance !== null && <p>Saldo actual: {points(balance)}</p>}
        {!uncertain && balance !== null && !insufficient && <p>Saldo después del canje: {points(balance - product.costPoints)}</p>}
        <p>Recibirás un código ficticio. No acredita saldo real ni se puede usar en la plataforma.</p>
        {uncertain && <p>Reintentaremos con la misma clave para recuperar el comprobante sin cobrar dos veces. El precio original lo conserva el servidor.</p>}
      </div>
      {error && <p role="alert">{error}</p>}
      {!uncertain && insufficient && <p role="alert">No tenés suficientes puntos.</p>}
      <div className="flex flex-wrap gap-3">
        <button type="button" className="reward-button reward-primary" disabled={busy || (!uncertain && (insufficient || balance === null || !product.available))} onClick={onConfirm}>{busy ? 'Procesando…' : uncertain ? 'Recuperar comprobante' : 'Confirmar y gastar puntos'}</button>
        <button type="button" className="reward-button" disabled={busy} onClick={onClose}>Volver</button>
      </div>
    </div>
  </dialog>;
}
