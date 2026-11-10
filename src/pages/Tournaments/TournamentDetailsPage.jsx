import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiFetch } from '../../config';
import { getStoredUser, isModerator as checkModerator } from '../../utils/Roles';
import { isIncompleteRankCondition } from '../../utils/teamRanks';
import RankConditionBuilder from '../../components/RankConditionBuilder';
import TournamentBracket from './TournamentBracket';

const toLocalInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const statusStyle = (status) => {
  if (status === 'En curso') return 'text-emerald-400 border-emerald-800/50 bg-emerald-950/30';
  if (status === 'Finalizado') return 'text-gray-300 border-gray-700 bg-gray-900/40';
  if (status === 'Cancelado') return 'text-red-400 border-red-800/50 bg-red-950/30';
  return 'text-amber-300 border-amber-800/50 bg-amber-950/30';
};

export default function TournamentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = getStoredUser();
  const canManage = checkModerator(user);

  const [tournament, setTournament] = useState(null);
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);
  const [registerTeamId, setRegisterTeamId] = useState('');
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [now, setNow] = useState(() => Date.now());

  // Mantiene actualizado el estado de la ventana de inscripción (30 min antes).
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  const readBody = async (response) => {
    const text = await response.text();
    try { return text ? JSON.parse(text) : null; } catch { return null; }
  };

  const load = useCallback(async () => {
    try {
      const [tRes, mRes] = await Promise.all([
        apiFetch(`/tournaments/${id}`),
        apiFetch(`/tournaments/${id}/matches`)
      ]);
      if (tRes.status === 404) throw new Error('Torneo no encontrado.');
      if (!tRes.ok) throw new Error('No se pudo cargar el torneo.');
      const tData = await tRes.json();
      const mData = mRes.ok ? await mRes.json() : [];
      setTournament(tData);
      setMatches(Array.isArray(mData) ? mData : []);
      setEditForm({
        title: tData.title || '',
        gameName: tData.gameName || '',
        bannerUrl: tData.bannerUrl || '',
        prizePool: tData.prizePool ?? 0,
        maxParticipants: tData.maxParticipants ?? 0,
        rules: tData.rules || '',
        rankConditions: tData.rankConditions || '',
        startDate: toLocalInput(tData.startDate),
        endDate: toLocalInput(tData.endDate),
        tournamentType: tData.tournamentType || 'Individual'
      });
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Carga inicial / recarga al cambiar id (fetch de datos del torneo).
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    // Para inscripción por equipo, cargar equipos (para elegir uno donde sea capitán)
    if (tournament?.tournamentType === 'Equipo') {
      apiFetch('/teams')
        .then(r => r.ok ? r.json() : [])
        .then(d => setTeams(Array.isArray(d) ? d : []))
        .catch(() => setTeams([]));
    }
  }, [tournament?.tournamentType]);

  const myTeams = useMemo(() => {
    if (!user || !tournament) return [];
    return teams.filter(t => t.captainId === user.id && (!t.gameName || t.gameName === tournament.gameName));
  }, [teams, user, tournament]);

  const isRegistered = !!user && (tournament?.participants || []).some(p => p.userId === user.id);
  const isTeamRegistered = (teamId) => (tournament?.participants || []).some(p => p.teamId === teamId);
  const isFull = (tournament?.participants?.length || 0) >= (tournament?.maxParticipants || 0);
  const disqualifiedIds = useMemo(() => (tournament?.participants || []).filter(p => p.isDisqualified).map(p => p.userId), [tournament]);

  const call = async (path, options, reload = true) => {
    setBusy(true);
    setActionError('');
    try {
      const res = await apiFetch(path, { headers: { 'Content-Type': 'application/json' }, ...options });
      const data = await readBody(res);
      if (res.status === 401) throw new Error('Tu sesión expiró. Volvé a iniciar sesión.');
      if (res.status === 403) throw new Error('No tenés permisos para realizar esta acción.');
      if (!res.ok) throw new Error(data?.message || `Error (${res.status})`);
      if (Array.isArray(data)) setMatches(data); // algunos endpoints devuelven matches
      if (reload) await load();
      return data;
    } catch (e) {
      setActionError(e.message);
      return null;
    } finally {
      setBusy(false);
    }
  };

  const handleRegister = async () => {
    if (!user) { navigate('/login'); return; }
    const data = await call(`/tournaments/${id}/register`, {
      method: 'POST',
      body: JSON.stringify({ userId: user.id, username: user.username, inGameName: '', rank: '', registeredAt: new Date().toISOString() })
    });
    if (data && !Array.isArray(data)) alert(data.message || 'Inscripción realizada.');
  };

  const handleRegisterTeam = async () => {
    if (!registerTeamId) { setActionError('Seleccioná un equipo para inscribir.'); return; }
    const data = await call(`/tournaments/${id}/register-team`, {
      method: 'POST',
      body: JSON.stringify({ teamId: registerTeamId })
    });
    if (data && !Array.isArray(data)) alert(data.message || 'Equipo inscripto.');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (isIncompleteRankCondition(editForm.rankConditions)) {
      setActionError('Elegí el rango de la restricción o seleccioná "Sin restricción".');
      return;
    }
    const payload = {
      title: editForm.title,
      gameName: editForm.gameName,
      bannerUrl: editForm.bannerUrl,
      prizePool: Number(editForm.prizePool),
      maxParticipants: Number(editForm.maxParticipants),
      rules: editForm.rules,
      rankConditions: editForm.rankConditions,
      tournamentType: editForm.tournamentType,
      startDate: editForm.startDate ? new Date(editForm.startDate).toISOString() : null,
      endDate: editForm.endDate ? new Date(editForm.endDate).toISOString() : null
    };
    const data = await call(`/tournaments/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    if (data) { setEditing(false); alert('Torneo actualizado.'); }
  };

  const handleCancel = async () => {
    if (!window.confirm('¿Cancelar este torneo? Los participantes seguirán visibles, pero el torneo quedará cancelado.')) return;
    const data = await call(`/tournaments/${id}/cancel`, { method: 'POST', body: '{}' });
    if (data) alert(data.message || 'Torneo cancelado.');
  };

  const handleGenerateBracket = async () => {
    if (!window.confirm('¿Generar las llaves ahora? El torneo pasará a "En curso".')) return;
    const data = await call(`/tournaments/${id}/bracket`, { method: 'POST', body: '{}' });
    if (Array.isArray(data)) alert('Llaves generadas.');
  };

  const handleVerifyRank = async (participant, verified) => {
    await call(`/tournaments/${id}/participants/${participant.userId}/verify-rank`, {
      method: 'POST',
      body: JSON.stringify({ verified })
    });
  };

  const handleDisqualify = async (participant) => {
    const reason = window.prompt(`Motivo de descalificación para ${participant.username} (opcional):`, participant.disqualificationReason || '');
    if (reason === null) return;
    const data = await call(`/tournaments/${id}/participants/${participant.userId}/disqualify`, {
      method: 'POST',
      body: JSON.stringify({ reason: reason || null })
    });
    if (Array.isArray(data)) setMatches(data);
  };

  if (loading) return <div className="flex justify-center items-center h-screen text-white">Cargando torneo...</div>;
  if (error || !tournament) {
    return (
      <div className="flex flex-col gap-4 justify-center items-center h-screen text-red-400">
        <p>Error: {error || 'No se pudo cargar el torneo.'}</p>
        <button onClick={() => navigate('/tournaments')} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold">Volver</button>
      </div>
    );
  }

  const regOpen = tournament.status === 'Próximo' && now >= new Date(tournament.startDate).getTime() - 30 * 60 * 1000;
  const regNotYet = tournament.status === 'Próximo' && !regOpen;

  return (
    <div className="p-6 text-white min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        <button onClick={() => navigate('/tournaments')} className="text-sm text-purple-400 hover:underline">← Volver a torneos</button>

        <div className="bg-[#161b22] border border-gray-800 rounded-xl overflow-hidden">
          {tournament.bannerUrl && <img src={tournament.bannerUrl} alt={tournament.title} className="w-full h-44 object-cover" />}
          <div className="p-6 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-purple-600/20 text-purple-400 text-xs font-semibold px-3 py-1 rounded-full uppercase border border-purple-500/30">{tournament.gameName}</span>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusStyle(tournament.status)}`}>{tournament.status}</span>
              <span className="text-xs font-semibold px-3 py-1 rounded-full border border-gray-700 text-gray-300">{tournament.tournamentType}</span>
            </div>
            <h1 className="text-3xl font-extrabold">{tournament.title}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-300">
              <p><span className="text-gray-500">Inicio:</span> {new Date(tournament.startDate).toLocaleString()}</p>
              <p><span className="text-gray-500">Fin:</span> {new Date(tournament.endDate).toLocaleString()}</p>
              <p><span className="text-gray-500">Cupo:</span> {tournament.participants?.length || 0} / {tournament.maxParticipants}</p>
              <p><span className="text-gray-500">Condición de rango:</span> {tournament.rankConditions || 'Sin restricción declarada'}</p>
            </div>
            {tournament.rules && (
              <div className="bg-gray-900/40 border border-gray-800 rounded-lg p-4">
                <h3 className="text-sm font-bold text-white mb-1">Reglas</h3>
                <p className="text-sm text-gray-300 whitespace-pre-wrap">{tournament.rules}</p>
              </div>
            )}

            {actionError && <div className="text-xs text-red-400 border border-red-800/50 bg-red-950/30 rounded-lg px-3 py-2">{actionError}</div>}

            {/* Inscripción */}
            {tournament.status === 'Próximo' && (
              <div className="border border-gray-800 rounded-lg p-4 space-y-3">
                <h3 className="font-bold">Inscripción</h3>
                {regNotYet && (
                  <p className="text-sm text-amber-300">La inscripción se habilita 30 minutos antes del inicio ({new Date(new Date(tournament.startDate).getTime() - 30*60000).toLocaleString()}).</p>
                )}
                {tournament.tournamentType === 'Individual' ? (
                  isRegistered ? (
                    <p className="text-sm text-emerald-400">Ya estás inscripto en este torneo.</p>
                  ) : isFull ? (
                    <p className="text-sm text-red-400">Cupo completo ({tournament.participants?.length || 0}/{tournament.maxParticipants}).</p>
                  ) : (
                    <button onClick={handleRegister} disabled={busy || !regOpen} className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg font-bold">
                      {busy ? 'Inscribiendo...' : 'Inscribirme'}
                    </button>
                  )
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-400">Requisito: 5 titulares + 2 suplentes. Solo el capitán puede inscribir.</p>
                    {isFull && <p className="text-sm text-red-400">Cupo completo ({tournament.participants?.length || 0}/{tournament.maxParticipants}).</p>}
                    <div className="flex flex-wrap gap-2 items-center">
                      <select
                        value={registerTeamId}
                        onChange={e => setRegisterTeamId(e.target.value)}
                        style={{ colorScheme: 'dark' }}
                        className="p-2 bg-[#0d1117] border border-gray-800 rounded-lg text-sm text-white min-w-[220px]"
                      >
                        <option value="">Seleccioná tu equipo</option>
                        {myTeams.map(t => (
                          <option key={t.id} value={t.id} disabled={isTeamRegistered(t.id)}>
                            {t.name} [{t.tag}] {isTeamRegistered(t.id) ? '(ya inscripto)' : ''}
                          </option>
                        ))}
                      </select>
                      <button onClick={handleRegisterTeam} disabled={busy || !regOpen || !registerTeamId || isFull} className="px-5 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg font-bold">
                        {busy ? 'Inscribiendo...' : 'Inscribir equipo'}
                      </button>
                    </div>
                    {user && myTeams.length === 0 && <p className="text-xs text-gray-500">No se encontraron equipos donde seas capitán para {tournament.gameName}.</p>}
                  </div>
                )}
              </div>
            )}

            {/* Moderación */}
            {canManage && (
              <div className="border border-purple-900/40 bg-purple-950/10 rounded-lg p-4 space-y-3">
                <h3 className="font-bold text-purple-200">Moderación (RF-17/18/22/23/28/30)</h3>
                <div className="flex flex-wrap gap-2">
                  {tournament.status === 'Próximo' && (
                    <>
                      <button onClick={() => setEditing(v => !v)} disabled={busy} className="px-3 py-2 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700">{editing ? 'Cerrar edición' : 'Editar torneo'}</button>
                      <button onClick={handleGenerateBracket} disabled={busy} className="px-3 py-2 text-sm bg-purple-700 hover:bg-purple-600 rounded-lg font-semibold">Generar llaves</button>
                    </>
                  )}
                  {tournament.status !== 'Finalizado' && tournament.status !== 'Cancelado' && (
                    <button onClick={handleCancel} disabled={busy} className="px-3 py-2 text-sm bg-red-950 hover:bg-red-900 text-red-200 rounded-lg border border-red-800/60">Cancelar torneo</button>
                  )}
                </div>

                {editing && tournament.status === 'Próximo' && (
                  <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    <input className="p-2 bg-[#0d1117] border border-gray-800 rounded text-sm" value={editForm.title} onChange={e=>setEditForm({...editForm,title:e.target.value})} placeholder="Título" />
                    <select className="p-2 bg-[#0d1117] border border-gray-800 rounded text-sm" style={{colorScheme:'dark'}} value={editForm.gameName} onChange={e=>setEditForm({...editForm,gameName:e.target.value,rankConditions:'Sin restricción'})}>
                      {['Valorant','Counter-Strike 2','League of Legends','EA FC 27','Rocket League','CS:GO'].map(g=> <option key={g} value={g}>{g}</option>)}
                    </select>
                    <select className="p-2 bg-[#0d1117] border border-gray-800 rounded text-sm" style={{colorScheme:'dark'}} value={editForm.tournamentType} onChange={e=>setEditForm({...editForm,tournamentType:e.target.value})}>
                      <option value="Individual">Individual</option>
                      <option value="Equipo">Equipo</option>
                    </select>
                    <input type="number" min={2} className="p-2 bg-[#0d1117] border border-gray-800 rounded text-sm" value={editForm.maxParticipants} onChange={e=>setEditForm({...editForm,maxParticipants:e.target.value})} placeholder="Cupo" />
                    <input type="datetime-local" style={{colorScheme:'dark'}} className="p-2 bg-[#0d1117] border border-gray-800 rounded text-sm" value={editForm.startDate} onChange={e=>setEditForm({...editForm,startDate:e.target.value})} />
                    <input type="datetime-local" style={{colorScheme:'dark'}} className="p-2 bg-[#0d1117] border border-gray-800 rounded text-sm" value={editForm.endDate} min={editForm.startDate||undefined} onChange={e=>setEditForm({...editForm,endDate:e.target.value})} />
                    <input className="p-2 bg-[#0d1117] border border-gray-800 rounded text-sm md:col-span-2" value={editForm.bannerUrl} onChange={e=>setEditForm({...editForm,bannerUrl:e.target.value})} placeholder="Banner URL" />
                    <div className="md:col-span-2">
                      <RankConditionBuilder
                        gameName={editForm.gameName}
                        value={editForm.rankConditions || ''}
                        onChange={(value) => setEditForm(prev => ({ ...prev, rankConditions: value }))}
                      />
                    </div>
                    <textarea className="p-2 bg-[#0d1117] border border-gray-800 rounded text-sm md:col-span-2" value={editForm.rules} onChange={e=>setEditForm({...editForm,rules:e.target.value})} placeholder="Reglas" rows={3} />
                    <div className="md:col-span-2">
                      <button type="submit" disabled={busy} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold text-sm">Guardar cambios</button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Participantes */}
        <div className="bg-[#161b22] border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Participantes ({tournament.participants?.length || 0})</h2>
          {(tournament.participants?.length || 0) === 0 ? (
            <p className="text-sm text-gray-500">Todavía no hay inscriptos.</p>
          ) : (
            <div className="space-y-2">
              {tournament.participants.map(p => (
                <div key={`${p.userId}-${p.teamId || 'i'}`} className="flex flex-wrap items-center justify-between gap-2 bg-gray-900/50 border border-gray-800 rounded-lg px-3 py-2 text-sm">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-semibold ${p.isDisqualified ? 'line-through text-gray-500' : 'text-white'}`}>{p.teamName || p.username}</span>
                      {p.teamName && <span className="text-xs text-gray-500">Capitán: {p.username}</span>}
                      {p.rank && <span className="text-xs text-purple-300 border border-purple-900/50 px-1.5 py-0.5 rounded">{p.rank}</span>}
                      {p.isDisqualified && <span className="text-[10px] bg-red-950 text-red-400 border border-red-800/50 px-1.5 py-0.5 rounded">DESCALIFICADO</span>}
                      {p.rankVerified ? (
                        <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/50 px-1.5 py-0.5 rounded" title={p.rankVerifiedBy ? `Verificado por ${p.rankVerifiedBy}` : 'Rango verificado'}>RANGO OK</span>
                      ) : (
                        <span className="text-[10px] bg-amber-950/40 text-amber-300 border border-amber-800/40 px-1.5 py-0.5 rounded">RANGO SIN VERIFICAR</span>
                      )}
                    </div>
                    {p.inGameName && <p className="text-xs text-gray-500">IGN: {p.inGameName}</p>}
                  </div>
                  {canManage && tournament.status !== 'Finalizado' && tournament.status !== 'Cancelado' && (
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleVerifyRank(p, !p.rankVerified)} disabled={busy} className="text-xs px-2 py-1 rounded border border-gray-700 hover:bg-gray-800 disabled:opacity-50">
                        {p.rankVerified ? 'Quitar verificación' : 'Verificar rango'}
                      </button>
                      {!p.isDisqualified && (
                        <button onClick={() => handleDisqualify(p)} disabled={busy} className="text-xs px-2 py-1 rounded border border-red-800/60 text-red-300 hover:bg-red-950/50 disabled:opacity-50">
                          Descalificar
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bracket / Llaves */}
        <div className="bg-[#161b22] border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Llaves / Competencia</h2>
          {matches.length === 0 ? (
            <p className="text-sm text-gray-500">
              {tournament.status === 'Próximo'
                ? 'Las llaves se generarán automáticamente al cerrar la inscripción (inicio del torneo) o manualmente por un moderador.'
                : 'No hay llaves generadas para este torneo.'}
            </p>
          ) : (
            <TournamentBracket
              matches={matches}
              currentUserId={user?.id}
              canManage={canManage}
              gameName={tournament.gameName}
              disqualifiedIds={disqualifiedIds}
              onMatchesUpdated={(m) => { setMatches(m); load(); }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
