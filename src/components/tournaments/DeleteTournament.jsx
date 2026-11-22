import { useState } from 'react';
import { request } from '../../api/client.js';

export default function DeleteTournament({ tournament, onDeleted, disabled = false }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function remove(event) {
    event.preventDefault();
    if (busy || disabled || name !== tournament.title) return;
    setBusy(true); setError('');
    try {
      await request(`/tournaments/${tournament.id}`, { method: 'DELETE' });
      onDeleted();
    } catch (failure) {
      setError(failure.status === 500 ? 'No se pudo eliminar. Si tiene inscripciones, usá cancelar torneo para conservar el historial y devolver los puntos.' : failure.message);
      setBusy(false);
    }
  }
  if (!open) return <button type="button" disabled={disabled} onClick={() => { setOpen(true); setName(''); }} className="arena-button detail-danger">Eliminar torneo definitivamente</button>;
  return <form onSubmit={remove} className="detail-delete">
    <h3>Eliminar torneo definitivamente</h3>
    <p className="detail-muted">Esta acción no se puede deshacer. Los torneos con inscripciones deben cancelarse para conservar su historial y devolver los puntos.</p>
    <label className="block text-sm">Escribí exactamente el nombre: <strong className="break-words">{tournament.title}</strong>
      <input autoComplete="off" value={name} onChange={event => setName(event.target.value)} disabled={busy} className="detail-input mt-2" />
    </label>
    {error && <p role="alert" className="detail-error">{error}</p>}
    <div className="mt-4 flex flex-wrap gap-3">
      <button type="submit" disabled={disabled || busy || name !== tournament.title} className="arena-button detail-danger">{busy ? 'Eliminando...' : 'Confirmar eliminación'}</button>
      <button type="button" disabled={busy} onClick={() => { setOpen(false); setError(''); }} className="arena-button">Volver</button>
    </div>
  </form>;
}
