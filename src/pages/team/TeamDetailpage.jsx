import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../config';
import { isModerator as checkModerator } from '../../utils/Roles';
import { canonicalRankValue, ensureOptionValue, getRankPickerSpec, parseRankValueForForm } from '../../utils/teamRanks';

function effectiveJoinPolicy(team) {
  const p = (team?.joinPolicy || '').trim();
  if (p.toLowerCase() === 'inviteonly') return 'InviteOnly';
  // Vacío/legado u Open => Open (compatibilidad con equipos anteriores)
  return 'Open';
}

function policyLabel(team) {
  const policy = effectiveJoinPolicy(team);
  if (policy === 'InviteOnly') return 'Solo por invitación';
  const type = (team?.rankFilterType || 'None').trim();
  const value = team?.rankFilterValue;
  if (type === 'Minimum' && value) return `Público · Mínimo ${value}`;
  if (type === 'Fixed' && value) return `Público · Rango fijo ${value}`;
  return 'Público · Sin mínimo de rango';
}

export default function TeamDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [teamInvitations, setTeamInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [inviteUsername, setInviteUsername] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  // Estados de edición para el capitán (RF-10)
  const [isEditingTeam, setIsEditingTeam] = useState(false);
  const [editTeamForm, setEditTeamForm] = useState({
    name: '', tag: '', logoUrl: '', joinPolicy: 'InviteOnly', rankFilterType: 'None', rankFilterValue: ''
  });

  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const isModerator = checkModerator(user);

  const readBody = async (response) => {
    const text = await response.text();
    try { return text ? JSON.parse(text) : null; } catch { return null; }
  };

  const handleSessionExpired = () => {
    localStorage.removeItem('user');
    alert('Tu sesión expiró. Volvé a iniciar sesión.');
    navigate('/login');
  };

  const fetchTeam = useCallback(async () => {
    try {
      const res = await apiFetch(`/teams/${id}`);
      if (res.status === 404) throw new Error('Equipo no encontrado.');
      if (!res.ok) throw new Error('No se pudo cargar el detalle del equipo.');
      const data = await res.json();
      setTeam(data);
      const spec = getRankPickerSpec(data.gameName);
      const stored = data.rankFilterValue || '';
      setEditTeamForm({
        name: data.name || '',
        tag: data.tag || '',
        logoUrl: data.logoUrl || '',
        joinPolicy: effectiveJoinPolicy(data),
        rankFilterType: data.rankFilterType || 'None',
        rankFilterValue: spec.kind === 'tiered' || spec.kind === 'select'
          ? ensureOptionValue(spec, stored)
          : parseRankValueForForm(data.gameName, spec, stored)
      });
      setError(null);

      // Si es capitán, cargar invitaciones pendientes (RF-11)
      const currentUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
      if (currentUser && data.captainId === currentUser.id) {
        const invRes = await apiFetch(`/teams/${id}/invitations`);
        if (invRes.ok) {
          const inv = await invRes.json();
          setTeamInvitations(Array.isArray(inv) ? inv : []);
        }
      } else {
        setTeamInvitations([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Carga inicial / recarga del detalle del equipo.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchTeam(); }, [fetchTeam]);

  const handleJoin = async () => {
    if (!user) { navigate('/login'); return; }
    setJoining(true);
    try {
      const response = await apiFetch(`/teams/${id}/join`, { method: 'POST' });
      if (response.status === 401) { handleSessionExpired(); return; }
      const data = await readBody(response);
      if (!response.ok) throw new Error(data?.message || `Error al unirse (${response.status})`);
      alert(data?.message || 'Te uniste al equipo.');
      await fetchTeam();
    } catch (err) {
      alert(err.message);
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    const captainWarning = team.captainId === user?.id
      ? '\n\nSos el capitán: si hay otros integrantes, la capitanía pasará a otro miembro. Si sos el único, el equipo se eliminará.'
      : '';
    if (!window.confirm(`¿Seguro que querés abandonar el equipo "${team.name}"?${captainWarning}`)) return;

    setLeaving(true);
    try {
      const response = await apiFetch(`/teams/${id}/leave`, { method: 'POST' });
      if (response.status === 401) { handleSessionExpired(); return; }
      const data = await readBody(response);
      if (!response.ok) throw new Error(data?.message || 'Error al abandonar');
      alert(data?.message || 'Abandonaste el equipo.');
      navigate(-1);
    } catch (err) {
      alert(err.message);
    } finally {
      setLeaving(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!window.confirm(`¿Eliminar el equipo "${team.name}"? Esta acción no se puede deshacer.`)) return;
    setDeleting(true);
    try {
      const response = await apiFetch(`/teams/${id}`, { method: 'DELETE' });
      if (response.status === 401) { handleSessionExpired(); return; }
      const data = await readBody(response);
      if (!response.ok) throw new Error(data?.message || `Error al eliminar el equipo (${response.status})`);
      alert(data?.message || 'Equipo eliminado.');
      navigate(-1);
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const onEditChange = (e) => {
    const { name, value } = e.target;
    setEditTeamForm(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'joinPolicy' && value === 'InviteOnly') { next.rankFilterType = 'None'; next.rankFilterValue = ''; }
      if (name === 'rankFilterType' && value === 'None') next.rankFilterValue = '';
      return next;
    });
  };

  // RF-10
  const handleUpdateTeamSubmit = async (e) => {
    e.preventDefault();
    const rankSpec = getRankPickerSpec(team?.gameName);
    const needsRank = editTeamForm.joinPolicy === 'Open' && editTeamForm.rankFilterType !== 'None';
    const rankValue = needsRank ? canonicalRankValue(team?.gameName, rankSpec, editTeamForm.rankFilterValue) : null;
    if (needsRank && !rankValue) {
      alert('Seleccioná o indicá el rango para el filtro.');
      return;
    }
    if (needsRank && rankSpec.kind === 'numeric') {
      const n = parseInt(String(editTeamForm.rankFilterValue).replace(/[^\d]/g, ''), 10);
      if (!Number.isFinite(n) || n < rankSpec.min) { alert(`Indicá al menos ${rankSpec.min} puntos.`); return; }
    }
    const payload = {
      name: editTeamForm.name,
      tag: editTeamForm.tag,
      logoUrl: editTeamForm.logoUrl,
      joinPolicy: editTeamForm.joinPolicy,
      rankFilterType: editTeamForm.joinPolicy === 'Open' ? editTeamForm.rankFilterType : 'None',
      rankFilterValue: rankValue
    };
    try {
      const response = await apiFetch(`/teams/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await readBody(response);
      if (!response.ok) throw new Error(data?.message || 'Error al actualizar equipo');
      alert('Equipo actualizado con éxito.');
      setIsEditingTeam(false);
      fetchTeam();
    } catch (err) {
      alert(err.message);
    }
  };

  // RF-13
  const handleRemoveMember = async (memberUserId, memberName) => {
    if (!window.confirm(`¿Expulsar a ${memberName} del equipo?`)) return;
    try {
      const response = await apiFetch(`/teams/${id}/members/${memberUserId}`, { method: 'DELETE' });
      const data = await readBody(response);
      if (!response.ok) throw new Error(data?.message || 'Error al expulsar');
      alert('Integrante eliminado.');
      fetchTeam();
    } catch (err) {
      alert(err.message);
    }
  };

  // RF-14 / RF-15
  const handleToggleStarter = async (member) => {
    try {
      const response = await apiFetch(`/teams/${id}/members/${member.userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: member.role || 'Member', isStarter: !member.isStarter })
      });
      if (!response.ok) throw new Error('Error al actualizar rol');
      fetchTeam();
    } catch (err) {
      alert(err.message);
    }
  };

  // RF-11
  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteUsername.trim()) return;
    setInviting(true);
    setActionMsg('');
    try {
      const response = await apiFetch(`/teams/${id}/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: inviteUsername.trim() })
      });
      const data = await readBody(response);
      if (!response.ok) throw new Error(data?.message || 'No se pudo enviar la invitación');
      setInviteUsername('');
      setActionMsg(`Invitación enviada a ${data?.inviteeUsername || inviteUsername.trim()}.`);
      fetchTeam();
    } catch (err) {
      setActionMsg(err.message);
    } finally {
      setInviting(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen bg-[#0d1117] text-white">Cargando detalles...</div>;
  if (error) return <div className="flex justify-center items-center h-screen bg-[#0d1117] text-red-400">Error: {error}</div>;
  if (!team) return <div className="flex justify-center items-center h-screen bg-[#0d1117] text-white">Equipo no encontrado.</div>;

  const members = team.members || [];
  const isMember = user ? members.some(m => m.userId === user.id) : false;
  const isCaptain = user ? team.captainId === user.id : false;
  const canDeleteTeam = isModerator || isCaptain;
  const joinPolicy = effectiveJoinPolicy(team);
  const isOpenTeam = joinPolicy === 'Open';
  const editIsOpen = editTeamForm.joinPolicy === 'Open';
  const editNeedsRank = editIsOpen && editTeamForm.rankFilterType !== 'None';
  const rankSpec = getRankPickerSpec(team?.gameName);

  const renderEditRankValue = () => {
    const common = "w-full bg-[#0d1117] border border-gray-800 p-2 rounded text-sm text-white";
    if (rankSpec.kind === 'numeric') {
      return <input type="number" name="rankFilterValue" min={rankSpec.min} step={rankSpec.step} value={editTeamForm.rankFilterValue} onChange={onEditChange} className={common} placeholder={rankSpec.placeholder} />;
    }
    if (rankSpec.kind === 'tiered' || rankSpec.kind === 'select') {
      const hasCurrent = editTeamForm.rankFilterValue && !rankSpec.options.includes(editTeamForm.rankFilterValue);
      return (
        <select name="rankFilterValue" value={editTeamForm.rankFilterValue} onChange={onEditChange} className={common}>
          <option value="">Seleccionar...</option>
          {hasCurrent && <option value={editTeamForm.rankFilterValue}>{editTeamForm.rankFilterValue} (actual)</option>}
          {rankSpec.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      );
    }
    return <input type="text" name="rankFilterValue" value={editTeamForm.rankFilterValue} onChange={onEditChange} className={common} placeholder={rankSpec.placeholder || 'Ej: Oro, Platino'} />;
  };

  return (
    <div className="p-6 bg-[#0d1117] min-h-screen text-white">
      <div className="max-w-5xl mx-auto space-y-6">
        <button onClick={() => navigate(-1)} className="text-sm text-purple-400 hover:underline flex items-center gap-1">
          ← Volver a equipos
        </button>

        <div className="bg-[#161b22] border border-gray-800 rounded-xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-5">
            <img src={team.logoUrl} alt={team.name} className="w-20 h-20 object-cover rounded-full border-2 border-purple-500/50 bg-gray-900" />
            <div>
              <span className="bg-purple-600/20 text-purple-400 text-xs font-semibold px-3 py-1 rounded-full uppercase border border-purple-500/30 font-mono">[{team.tag}]</span>
              <h1 className="text-3xl font-extrabold mt-2 text-white">{team.name}</h1>
              <p className="text-gray-400 text-sm mt-1">{members.length} miembros{team.gameName ? ` · ${team.gameName}` : ''}</p>
              <p className="text-xs mt-2">
                <span className={`px-2 py-0.5 rounded border ${isOpenTeam ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50' : 'bg-amber-950/40 text-amber-300 border-amber-800/50'}`}>
                  {policyLabel(team)}
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full md:w-auto">
            {isCaptain && (
              <button onClick={() => setIsEditingTeam(!isEditingTeam)} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-sm font-bold border border-gray-700 transition">
                {isEditingTeam ? 'Cancelar Edición' : 'Editar Equipo ⚙️'}
              </button>
            )}
            {isMember ? (
              <button onClick={handleLeave} disabled={leaving} className="px-6 py-2.5 rounded-lg font-bold border border-red-800 text-red-400 hover:bg-red-950/50 transition disabled:opacity-50">
                {leaving ? 'Saliendo...' : 'Abandonar Equipo'}
              </button>
            ) : user && isOpenTeam ? (
              <button onClick={handleJoin} disabled={joining} className="px-6 py-3 rounded-lg font-bold bg-purple-600 hover:bg-purple-500 text-white transition disabled:opacity-50">
                {joining ? 'Uniéndote...' : 'Unirse al equipo'}
              </button>
            ) : user ? (
              <div className="text-sm text-gray-300 bg-gray-900/50 border border-gray-800 rounded-lg px-4 py-3 max-w-xs">
                Este equipo es solo por invitación. El capitán debe enviarte una invitación (RF-11). Revisá “Mis invitaciones” en la sección Equipos.
              </div>
            ) : (
              <button onClick={() => navigate('/login')} className="px-6 py-3 rounded-lg font-bold bg-purple-600 hover:bg-purple-500 text-white transition">Iniciar sesión</button>
            )}
            {canDeleteTeam && (
              <button onClick={handleDeleteTeam} disabled={deleting} className="px-6 py-2.5 rounded-lg font-bold bg-red-950 hover:bg-red-900 text-red-300 border border-red-800/60 transition disabled:opacity-50">
                {deleting ? 'Eliminando...' : 'Eliminar Equipo'}
              </button>
            )}
          </div>
        </div>

        {/* Panel de edición de equipo (RF-10) */}
        {isEditingTeam && (
          <form onSubmit={handleUpdateTeamSubmit} className="bg-[#161b22] border border-purple-500/40 p-6 rounded-xl space-y-4">
            <h3 className="text-lg font-bold text-white">Configuración del Equipo</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Nombre</label>
                <input type="text" name="name" value={editTeamForm.name} onChange={onEditChange} className="w-full bg-[#0d1117] border border-gray-800 p-2 rounded text-sm text-white" required />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Tag / Siglas</label>
                <input type="text" name="tag" value={editTeamForm.tag} onChange={onEditChange} className="w-full bg-[#0d1117] border border-gray-800 p-2 rounded text-sm text-white" required />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Logo URL</label>
                <input type="text" name="logoUrl" value={editTeamForm.logoUrl} onChange={onEditChange} className="w-full bg-[#0d1117] border border-gray-800 p-2 rounded text-sm text-white" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-gray-800">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Acceso</label>
                <select name="joinPolicy" value={editTeamForm.joinPolicy} onChange={onEditChange} className="w-full bg-[#0d1117] border border-gray-800 p-2 rounded text-sm text-white">
                  <option value="InviteOnly">Solo por invitación</option>
                  <option value="Open">Público</option>
                </select>
              </div>
              {editIsOpen && (
                <>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Filtro de rango</label>
                    <select name="rankFilterType" value={editTeamForm.rankFilterType} onChange={onEditChange} className="w-full bg-[#0d1117] border border-gray-800 p-2 rounded text-sm text-white">
                      <option value="None">Sin mínimo de rango</option>
                      <option value="Minimum">Mínimo de rango</option>
                      <option value="Fixed">Rango fijo</option>
                    </select>
                  </div>
                  {editNeedsRank && (
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        {editTeamForm.rankFilterType === 'Minimum' ? 'Mínimo' : 'Requerido'}: {rankSpec.label}
                      </label>
                      {renderEditRankValue()}
                      <p className="text-[11px] text-gray-500 mt-1">{rankSpec.help}</p>
                    </div>
                  )}
                </>
              )}
            </div>
            <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white text-xs px-4 py-2 rounded font-bold">Guardar Cambios</button>
          </form>
        )}

        {/* RF-11: Invitaciones (capitán) */}
        {isCaptain && (
          <div className="bg-[#161b22] border border-purple-900/40 p-6 rounded-xl space-y-4">
            <h3 className="text-lg font-bold text-white">Invitar jugadores (RF-11)</h3>
            <p className="text-xs text-gray-400">El usuario debe estar registrado, tener el juego <strong>{team.gameName}</strong> en su perfil con IGN y rango, y no pertenecer a otro equipo. {isOpenTeam ? 'Las invitaciones las envía el capitán (independientes del filtro público).' : ''}</p>
            <form onSubmit={handleInvite} className="flex flex-wrap gap-2">
              <input
                type="text"
                value={inviteUsername}
                onChange={e => setInviteUsername(e.target.value)}
                placeholder="Nombre de usuario"
                className="flex-1 min-w-[220px] bg-[#0d1117] border border-gray-800 p-2 rounded text-sm text-white"
              />
              <button type="submit" disabled={inviting || !inviteUsername.trim()} className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm px-4 py-2 rounded font-bold">
                {inviting ? 'Enviando...' : 'Enviar invitación'}
              </button>
            </form>
            {actionMsg && <p className="text-sm text-gray-300">{actionMsg}</p>}
            {teamInvitations.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-2">Invitaciones pendientes</h4>
                <div className="space-y-2">
                  {teamInvitations.map(inv => (
                    <div key={inv.id} className="flex items-center justify-between bg-gray-900/50 border border-gray-800 rounded px-3 py-2 text-sm">
                      <span>{inv.inviteeUsername}</span>
                      <span className="text-xs text-amber-300 border border-amber-800/40 bg-amber-950/30 px-2 py-0.5 rounded">Pendiente</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Lista de Miembros */}
        <div className="bg-[#161b22] border border-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Integrantes del Roster</h3>
          <div className="space-y-3">
            {members.map((m) => {
              const isMe = user && m.userId === user.id;
              const memberIsCaptain = m.userId === team.captainId;
              return (
                <div key={m.userId} className="bg-gray-900/60 border border-gray-800 p-4 rounded-lg flex items-center justify-between text-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{m.username}</span>
                      {isMe && <span className="text-[10px] bg-purple-900 text-purple-200 px-1.5 py-0.5 rounded">Tú</span>}
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${m.isStarter ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'}`}>
                        {m.isStarter ? 'Titular' : 'Suplente'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">Rol: <span className="text-purple-300 font-medium">{m.role || 'Miembro'}</span></p>
                  </div>

                  <div className="flex items-center gap-3">
                    {isCaptain && !memberIsCaptain && (
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleToggleStarter(m)} className="text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded text-gray-300 transition">
                          Cambiar a {m.isStarter ? 'Suplente' : 'Titular'}
                        </button>
                        <button onClick={() => handleRemoveMember(m.userId, m.username)} className="text-xs bg-red-950 hover:bg-red-900 text-red-300 px-3 py-1.5 rounded border border-red-800/50 transition">
                          Expulsar
                        </button>
                      </div>
                    )}
                    {memberIsCaptain && (
                      <span className="text-xs text-amber-400 font-bold bg-amber-950/40 px-2.5 py-1 rounded border border-amber-800">Capitán 👑</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
