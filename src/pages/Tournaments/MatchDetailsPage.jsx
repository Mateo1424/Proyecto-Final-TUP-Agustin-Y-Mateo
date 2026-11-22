import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, Link } from '../../routing/navigation.js';
import { request, isAborted } from '../../api/client.js';
import { apiFetch } from '../../config';
import { getStoredUser, isModerator as checkModerator } from '../../utils/Roles';
import MatchPresentation from '../../components/matches/MatchPresentation.jsx';
import './match-details.css';

export default function MatchDetailPage() {
  const { id, matchId } = useParams();
  const [detail,setDetail] = useState(null);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState(null);
  const [actionError,setActionError] = useState('');
  const [saving,setSaving] = useState(false);
  const user = getStoredUser();
  const moderator = checkModerator(user);
  const controller = useRef(null);
  const activeKey = useRef(`${id}:${matchId}`);
  const load = useCallback(async (silent=false) => {
    controller.current?.abort();
    const abort = new AbortController(); controller.current = abort;
    try {
      const [data,tournament] = await Promise.all([
        request(`/tournaments/${id}/matches/${matchId}`,{signal:abort.signal}),
        request(`/tournaments/${id}`,{signal:abort.signal}),
      ]);
      if (!abort.signal.aborted) { setDetail({...data,closedAt:tournament.closedAt}); setError(null); setLoading(false); }
    } catch(failure) {
      if (!isAborted(failure)) { if(!silent) setError(failure.message); else setActionError(failure.message); setLoading(false); }
    }
  },[id,matchId]);
  useEffect(() => {
    let alive=true; activeKey.current=`${id}:${matchId}`;
    void Promise.resolve().then(() => { if(alive) return load(); });
    const focus = () => { if(document.visibilityState === 'visible') void load(true); };
    window.addEventListener('focus',focus);
    return () => { alive=false; activeKey.current=null; controller.current?.abort(); window.removeEventListener('focus',focus); };
  },[load,id,matchId]);
  useEffect(() => {
    if (!detail || detail.closedAt) return;
    const timer=setInterval(() => { if(document.visibilityState === 'visible') void load(true); },15000);
    return () => clearInterval(timer);
  },[detail,load]);

  const callApi = async (path,options) => {
    if (saving || detail?.closedAt) return;
    const keyAtStart=activeKey.current;
    setSaving(true); setActionError('');
    try {
      const response=await apiFetch(path,{headers:{'Content-Type':'application/json'},...options});
      const text=await response.text();
      let data=null;
      try {data=text ? JSON.parse(text) : null;} catch {data=null;}
      if(response.status === 401) throw new Error('Tu sesión expiró. Volvé a iniciar sesión.');
      if(response.status === 403) throw new Error('Solo los moderadores pueden hacer esto.');
      if(!response.ok) throw new Error(data?.message || `Error (${response.status})`);
      if(activeKey.current === keyAtStart) await load(true);
    } catch(failure) {
      if(activeKey.current === keyAtStart) setActionError(failure.message);
    } finally {
      if(activeKey.current !== null) setSaving(false);
    }
  };
  const saveStat = (side,key,value) => callApi(`/tournaments/${id}/matches/${matchId}/stats`,{method:'PUT',body:JSON.stringify({side,key,value})});
  const adjustScore = (side,delta) => callApi(`/tournaments/${id}/matches/${matchId}/score`,{method:'POST',body:JSON.stringify({side,delta})});

  if (loading || (!error && detail && (detail.tournamentId !== id || detail.match?.id !== matchId))) return <div className="arena-match"><p role="status" className="arena-state">Cargando partido...</p></div>;
  if (error || !detail) return <div className="arena-match"><div className="arena-state" role="alert"><h1 className="text-xl font-bold mb-3">No se pudo cargar el partido</h1><p>{error || 'No se pudo cargar el partido.'}</p><div className="flex flex-wrap gap-3 mt-5"><button onClick={() => load()} className="arena-button">Reintentar</button><Link to={`/tournaments/${id}`} className="arena-button">Volver al torneo</Link></div></div></div>;
  return <MatchPresentation detail={detail} id={id} user={user} moderator={moderator} saving={saving} actionError={actionError} adjustScore={adjustScore} saveStat={saveStat} />;
}
