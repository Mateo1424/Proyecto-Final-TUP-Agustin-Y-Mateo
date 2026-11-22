import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from '../routing/navigation.js';
import { getOwnProfile, getProfileTeams, saveProfileAvatar, saveProfileStats, saveProfileGame, deleteProfileGame } from '../api/profile.js';
import { useEloRequest } from './useEloRequest.js';

export function useOwnProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const [busy, setBusy] = useState('');
  const [actionError, setActionError] = useState('');
  const [message, setMessage] = useState('');
  const locked = useRef(false);
  const alive = useRef(false);
  const loadTeams = useCallback(signal => getProfileTeams(signal), []);
  const teams = useEloRequest(loadTeams, 'own-profile-teams');

  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; };
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    Promise.resolve().then(async () => {
      if (controller.signal.aborted) return;
      setLoading(true); setError('');
      try {
        const data = await getOwnProfile(controller.signal);
        if (!data?.id) throw new Error('No se pudo cargar la información del perfil.');
        if (!controller.signal.aborted) setProfile(data);
      } catch (failure) {
        if (controller.signal.aborted) return;
        if (failure.status === 401) { localStorage.removeItem('user'); navigate('/login'); }
        else setError(failure.message);
      } finally { if (!controller.signal.aborted) setLoading(false); }
    });
    return () => controller.abort();
  }, [navigate, revision]);

  async function mutate(key, operation, patch, success) {
    if (locked.current) return false;
    locked.current = true; setBusy(key); setActionError(''); setMessage('');
    try {
      const data = await operation();
      if (!alive.current) return false;
      setProfile(previous => ({ ...previous, ...patch(data) }));
      setMessage(success);
      return true;
    } catch (failure) {
      if (alive.current) setActionError(failure.message);
      return false;
    } finally { locked.current = false; if (alive.current) setBusy(''); }
  }

  return {
    profile, loading, error, teams, busy, actionError, message,
    retry: () => setRevision(value => value + 1),
    clearFeedback: () => { setActionError(''); setMessage(''); },
    saveAvatar: value => mutate('avatar', () => saveProfileAvatar(value), data => ({ avatarUrl: data.avatarUrl }), 'Avatar actualizado.'),
    saveStats: value => mutate('stats', () => saveProfileStats(value), data => ({ stats: data.stats }), 'Estadísticas actualizadas.'),
    saveGame: (game, editing) => mutate('game', () => saveProfileGame(game, editing), data => ({ games: data.games }), editing ? 'Videojuego actualizado.' : 'Videojuego vinculado.'),
    removeGame: name => mutate('delete', () => deleteProfileGame(name), data => ({ games: data.games }), 'Videojuego eliminado.'),
  };
}
