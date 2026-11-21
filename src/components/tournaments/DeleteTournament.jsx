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
  if (!open) return <button type="button" disabled={disabled} onClick={() => { setOpen(true); setName(''); }} className="rounded-lg border border-red-700 px-4 py-3 text-red-300 hover:bg-red-950/50 disabled:opacity-50">Eliminar torneo definitivamente</button>;
  return <form onSubmit={remove} className="max-w-lg rounded-lg border border-red-800 bg-red-950/20 p-4 text-left">
    <p className="font-bold text-red-300">Eliminar torneo definitivamente</p>
    <p className="my-3 text-sm">Esta acción no se puede deshacer. Los torneos con inscripciones deben cancelarse para conservar su historial y devolver los puntos.</p>
    <label className="block text-sm">Escribí exactamente el nombre: <strong className="break-words">{tournament.title}</strong>
      <input autoComplete="off" value={name} onChange={event => setName(event.target.value)} disabled={busy} className="mt-2 block w-full rounded border border-gray-600 bg-[#0d1117] p-2 text-white" />
    </label>
    {error && <p role="alert" className="mt-3 text-sm text-red-300">{error}</p>}
    <div className="mt-4 flex flex-wrap gap-3">
      <button type="submit" disabled={disabled || busy || name !== tournament.title} className="rounded bg-red-700 px-4 py-2 font-bold disabled:cursor-not-allowed disabled:opacity-40">{busy ? 'Eliminando...' : 'Confirmar eliminación'}</button>
      <button type="button" disabled={busy} onClick={() => { setOpen(false); setError(''); }} className="rounded border border-gray-600 px-4 py-2">Volver</button>
    </div>
  </form>;
}
