import { useCallback, useEffect, useRef, useState } from 'react';
import { request, isAborted } from '../api/client.js';
import { getEnrollments } from '../api/tournaments.js';
import { getStoredUser } from '../utils/Roles.js';
import { useWalletStore } from '../store/wallet.js';

export function useTournamentDetails(id, userId) {
  const [state, setState] = useState({ tournament: null, matches: [], teams: [], enrollments: [], loading: true, error: '', requestFor: null });
  const [busy, setBusy] = useState('');
  const [now,setNow] = useState(() => Date.now());
  const pending = state.enrollments.some(e => e.status === 'Pending');
  const current = useRef({ id, userId });
  const controller = useRef(null);
  const acting = useRef(false);
  const load = useCallback(async () => {
    controller.current?.abort(); const abort = new AbortController(); controller.current = abort;
    try {
      const [tournament, matches, teams, enrollments] = await Promise.all([
        request(`/tournaments/${id}`, { signal: abort.signal }),
        request(`/tournaments/${id}/matches`, { signal: abort.signal }),
        userId ? request('/teams', { signal: abort.signal }) : [],
        userId ? getEnrollments(id, abort.signal) : [],
      ]);
      if (abort.signal.aborted) return;
      setState({ tournament, matches, teams: teams.filter(t => t.members?.some(m => m.userId === userId)), enrollments, loading: false, error: '', requestFor: id });
    } catch (error) { if (!isAborted(error)) setState(old => ({ ...old, loading: false, error: error.message, requestFor: id })); }
  }, [id, userId]);
  useEffect(() => {
    current.current = { id, userId };
    void load();
    const focus = () => { if (document.visibilityState === 'visible') void load(); };
    window.addEventListener('focus', focus);
    return () => { controller.current?.abort(); window.removeEventListener('focus', focus); current.current = {}; };
  }, [id, userId, load]);
  useEffect(() => {
    if (!pending) return;
    const timer = setInterval(() => { if (document.visibilityState === 'visible') void load(); }, 15000);
    return () => clearInterval(timer);
  }, [pending, load]);
  useEffect(() => {
    if(state.tournament?.status !== 'Próximo') return;
    const timer=setInterval(()=>{if(document.visibilityState==='visible')setNow(Date.now());},15000);
    return()=>clearInterval(timer);
  },[state.tournament?.status]);
  const mutate = async (key, action) => {
    if (acting.current) return;
    acting.current = true; setBusy(key); const actor = current.current;
    try { return await action(); }
    finally {
      if (actor === current.current) await load();
      if (getStoredUser()?.id === actor.userId) await useWalletStore.getState().refresh();
      acting.current = false; if (current.current.id) setBusy('');
    }
  };
  return { ...state, loading: state.loading || state.requestFor !== id, busy, now, load, mutate };
}
