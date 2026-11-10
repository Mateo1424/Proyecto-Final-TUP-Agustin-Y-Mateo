import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../config';
import { getStoredUser } from '../../utils/Roles';

function teamPolicyLabel(team) {
  const p = (team?.joinPolicy || '').trim().toLowerCase();
  if (p === 'inviteonly') return { text: 'Invitación', open: false };
  const type = (team?.rankFilterType || 'None').trim();
  const value = team?.rankFilterValue;
  if (type === 'Minimum' && value) return { text: `Público · mín. ${value}`, open: true };
  if (type === 'Fixed' && value) return { text: `Público · ${value}`, open: true };
  return { text: 'Público', open: true };
}

export default function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [respondingId, setRespondingId] = useState(null);
  const user = useMemo(() => getStoredUser(), []);
  const userId = user?.id ?? null;

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [tRes, iRes] = await Promise.all([
        apiFetch('/teams'),
        userId ? apiFetch('/teams/invitations/me') : Promise.resolve({ ok: true, json: async () => [] })
      ]);
      if (!tRes.ok) throw new Error(`No se pudieron cargar los equipos (error ${tRes.status}).`);
      const tData = await tRes.json();
      const iData = iRes.ok ? await iRes.json() : [];
      setTeams(Array.isArray(tData) ? tData : []);
      setInvitations(Array.isArray(iData) ? iData : []);
    } catch (err) {
      console.error('Error al cargar equipos:', err);
      setError(err instanceof TypeError ? 'No se pudo conectar con el servidor. ¿Está corriendo el backend?' : err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Carga inicial / recarga de equipos e invitaciones.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  const respond = async (invitationId, response) => {
    setRespondingId(invitationId);
    try {
      const res = await apiFetch(`/teams/invitations/${invitationId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response })
      });
      const text = await res.text();
      let data = null;
      try { data = text ? JSON.parse(text) : null; } catch { data = null; }
      if (!res.ok) throw new Error(data?.message || 'No se pudo responder la invitación.');
      alert(data?.message || 'Listo.');
      await load();
    } catch (e) {
      alert(e.message);
    } finally {
      setRespondingId(null);
    }
  };

  if (loading) return <div className="p-6 text-white text-center">Cargando equipos...</div>;

  if (error) {
    return (
      <div className="p-6 text-white max-w-xl mx-auto text-center space-y-4">
        <div className="p-4 bg-red-950/50 border border-red-800 text-red-400 text-sm rounded-lg">{error}</div>
        <button onClick={load} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold transition cursor-pointer">Reintentar</button>
      </div>
    );
  }

  return (
    <div className="p-6 text-white max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-extrabold tracking-wide">Equipos Registrados</h2>
        <Link to="/teams/create" className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold transition shadow-lg shadow-purple-900/40">
          + Crear Equipo
        </Link>
      </div>

      {user && invitations.length > 0 && (
        <div className="bg-[#161b22] border border-purple-900/40 rounded-xl p-5">
          <h3 className="text-lg font-bold text-purple-200 mb-3">Mis invitaciones pendientes (RF-12)</h3>
          <div className="space-y-3">
            {invitations.map(inv => (
              <div key={inv.id} className="flex flex-wrap items-center justify-between gap-3 bg-gray-900/50 border border-gray-800 rounded-lg p-3">
                <div className="text-sm">
                  <p className="font-semibold text-white">{inv.teamName} <span className="text-gray-400 font-mono">[{inv.teamTag}]</span></p>
                  <p className="text-gray-400">{inv.gameName} · Invitado por {inv.inviterUsername}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => respond(inv.id, 'Accept')}
                    disabled={respondingId === inv.id}
                    className="px-3 py-1.5 text-sm bg-emerald-700 hover:bg-emerald-600 rounded font-semibold disabled:opacity-50"
                  >
                    Aceptar
                  </button>
                  <button
                    onClick={() => respond(inv.id, 'Reject')}
                    disabled={respondingId === inv.id}
                    className="px-3 py-1.5 text-sm bg-red-950 hover:bg-red-900 text-red-200 border border-red-800/60 rounded font-semibold disabled:opacity-50"
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {teams.length === 0 ? (
        <div className="text-center py-12 bg-[#161b22] border border-gray-800 rounded-xl">
          <p className="text-gray-400 mb-4">No hay equipos creados todavía.</p>
          <Link to="/teams/create" className="text-purple-400 hover:underline font-semibold">¡Crea el primero ahora!</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => {
            const policy = teamPolicyLabel(team);
            return (
              <Link to={`/teams/${team.id}`} key={team.id} className="block group">
                <div className="bg-[#161b22] border border-gray-800 rounded-xl overflow-hidden flex flex-col justify-between p-5 shadow-md group-hover:border-purple-500 transition">
                  <div className="flex items-center space-x-4 mb-4">
                    <img src={team.logoUrl} alt={team.name} className="w-14 h-14 object-cover rounded-full border border-purple-500/50 bg-gray-900" />
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition">{team.name}</h3>
                      <span className="text-xs bg-purple-950 text-purple-400 px-2 py-0.5 rounded font-mono border border-purple-800">[{team.tag}]</span>
                      {team.gameName && <p className="text-xs text-gray-500 mt-1">{team.gameName}</p>}
                    </div>
                  </div>
                  <div className="mb-3">
                    <span className={`text-[11px] px-2 py-0.5 rounded border ${policy.open ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50' : 'bg-amber-950/40 text-amber-300 border-amber-800/50'}`}>
                      {policy.text}
                    </span>
                  </div>
                  <div className="border-t border-gray-800 pt-3 flex justify-between items-center text-xs text-gray-400">
                    <span>Miembros: <strong className="text-white">{team.members?.length || 0}</strong></span>
                    <span className="text-purple-400 font-medium group-hover:underline">Ver detalles →</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
