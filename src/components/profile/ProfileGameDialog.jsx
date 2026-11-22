import { useEffect, useRef, useState } from 'react';
import { GAMES } from '../../api/rankings.js';

export default function ProfileGameDialog({ game, busy, error, onSave, onClose }) {
  const dialog = useRef(null);
  const [form, setForm] = useState(() => game ?? { gameName: 'League of Legends', inGameName: '', rank: '' });
  useEffect(() => {
    const previous = document.activeElement;
    const element = dialog.current;
    element.showModal();
    return () => { element.close(); if (previous?.isConnected) previous.focus(); };
  }, []);
  return <dialog ref={dialog} className="arena-profile-dialog" aria-labelledby="profile-game-heading" onCancel={event => { if (busy) event.preventDefault(); else onClose(); }}>
    <h2 id="profile-game-heading">{game ? 'Modificar videojuego' : 'Vincular videojuego'}</h2>
    {error && <p role="alert" className="arena-profile-error">{error}</p>}
    <form aria-busy={Boolean(busy)} onSubmit={async event => { event.preventDefault(); if (await onSave(form, Boolean(game))) onClose(); }} className="space-y-5">
      <div><label htmlFor="profile-game-name" className="arena-profile-label">Videojuego</label><select id="profile-game-name" value={form.gameName} disabled={Boolean(game) || Boolean(busy)} onChange={event => setForm(previous => ({ ...previous, gameName: event.target.value }))} className="arena-profile-input">{GAMES.map(name => <option key={name}>{name}</option>)}</select></div>
      <div><label htmlFor="profile-game-user" className="arena-profile-label">Nombre en el juego</label><input id="profile-game-user" value={form.inGameName} required disabled={Boolean(busy)} onChange={event => setForm(previous => ({ ...previous, inGameName: event.target.value }))} className="arena-profile-input" /></div>
      <div><label htmlFor="profile-game-rank" className="arena-profile-label">Rango o nivel</label><input id="profile-game-rank" value={form.rank} required disabled={Boolean(busy)} onChange={event => setForm(previous => ({ ...previous, rank: event.target.value }))} className="arena-profile-input" /></div>
      <div className="arena-profile-actions"><button type="submit" disabled={Boolean(busy)} className="arena-button arena-button-primary">{busy === 'game' ? 'Guardando…' : game ? 'Guardar cambios' : 'Vincular'}</button><button type="button" disabled={Boolean(busy)} onClick={onClose} className="arena-button">Cancelar</button></div>
    </form>
  </dialog>;
}
