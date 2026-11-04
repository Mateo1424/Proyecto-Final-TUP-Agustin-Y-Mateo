import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../../config';
import { getStoredUser } from '../../utils/Roles';
import TeamInvitationsPanel from '../../components/team/TeamInvitationsPanel';

export default function TeamDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [joining, setJoining] = useState(false);
    const [leaving, setLeaving] = useState(false);
    const [saving, setSaving] = useState(false);
    const actionLock = useRef(false);

    // Estados de edición para el capitán (RF-10)
    const [isEditingTeam, setIsEditingTeam] = useState(false);
    const [editTeamForm, setEditTeamForm] = useState({ name: '', tag: '', logoUrl: '', isPrivate: false });

    const user = getStoredUser();

    const fetchTeam = useCallback(() => {
        apiFetch(`/teams/${id}`)
            .then(res => {
                if (res.status === 404) throw new Error('Equipo no encontrado.');
                if (!res.ok) throw new Error('No se pudo cargar el detalle del equipo.');
                return res.json();
            })
            .then(data => {
                setTeam(data);
                setEditTeamForm({ name: data.name, tag: data.tag, logoUrl: data.logoUrl, isPrivate: Boolean(data.isPrivate) });
                setError(null);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [id]);

    useEffect(() => {
        fetchTeam();
    }, [fetchTeam]);

    const handleSessionExpired = () => {
        localStorage.removeItem('user');
        alert('Tu sesión expiró. Volvé a iniciar sesión.');
        navigate('/login');
    };

    const readBody = async (response) => {
        const text = await response.text();
        try {
            return text ? JSON.parse(text) : null;
        } catch {
            return null;
        }
    };

    const handleJoin = async () => {
        if (team?.isPrivate || actionLock.current) return;
        if (!user) {
            alert('Tenés que iniciar sesión para unirte a un equipo.');
            navigate('/login');
            return;
        }

        actionLock.current = true;
        setJoining(true);
        try {
            const response = await apiFetch(`/teams/${id}/join`, { method: 'POST' });
            if (response.status === 401) { handleSessionExpired(); return; }
            const data = await readBody(response);
            if (!response.ok) throw new Error(data?.message || 'Error al unirse');
            alert(data?.message || '¡Te uniste al equipo!');
            fetchTeam();
        } catch (err) {
            alert(err.message);
        } finally {
            actionLock.current = false;
            setJoining(false);
        }
    };

    const handleLeave = async () => {
        if (!window.confirm(`¿Seguro que querés abandonar el equipo "${team.name}"?`)) return;

        setLeaving(true);
        try {
            const response = await apiFetch(`/teams/${id}/leave`, { method: 'POST' });
            if (response.status === 401) { handleSessionExpired(); return; }
            const data = await readBody(response);
            if (!response.ok) throw new Error(data?.message || 'Error al abandonar');
            alert('Abandonaste el equipo.');
            fetchTeam();
        } catch (err) {
            alert(err.message);
        } finally {
            setLeaving(false);
        }
    };

    // RF-10: Guardar cambios del equipo
    const handleUpdateTeamSubmit = async (e) => {
        e.preventDefault();
        if (actionLock.current) return;
        actionLock.current = true;
        setSaving(true);
        try {
            const response = await apiFetch(`/teams/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editTeamForm)
            });
            const data = await readBody(response);
            if (!response.ok) throw new Error(data?.message || 'Error al actualizar equipo');
            alert('Equipo actualizado con éxito.');
            setIsEditingTeam(false);
            fetchTeam();
        } catch (err) {
            alert(err.message);
        } finally {
            actionLock.current = false;
            setSaving(false);
        }
    };

    // RF-13: Expulsar miembro
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

    // RF-14 / RF-15: Cambiar estado Titular/Suplente o Rol
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

    if (loading || (team && team.id !== id)) return <div className="flex justify-center items-center h-screen bg-[#0d1117] text-white">Cargando detalles...</div>;
    if (error) return <div className="flex justify-center items-center h-screen bg-[#0d1117] text-red-400">Error: {error}</div>;
    if (!team) return <div className="flex justify-center items-center h-screen bg-[#0d1117] text-white">Equipo no encontrado.</div>;

    const members = team.members || [];
    const isMember = user ? members.some(m => m.userId === user.id) : false;
    const isCaptain = user ? team.captainId === user.id : false;

    return (
        <div className="p-6 bg-[#0d1117] min-h-screen text-white">
            <div className="max-w-5xl mx-auto space-y-6">
                <button onClick={() => navigate(-1)} className="text-sm text-purple-400 hover:underline flex items-center gap-1">
                    ← Volver a equipos
                </button>

                {/* Banner Principal */}
                <div className="bg-[#161b22] border border-gray-800 rounded-xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-5">
                        <img src={team.logoUrl} alt={team.name} className="w-20 h-20 object-cover rounded-full border-2 border-purple-500/50 bg-gray-900" />
                        <div>
                            <span className="bg-purple-600/20 text-purple-400 text-xs font-semibold px-3 py-1 rounded-full uppercase border border-purple-500/30 font-mono">
                                [{team.tag}]
                            </span>
                            <h1 className="text-3xl font-extrabold mt-2 text-white">{team.name}</h1>
                            <p className="text-gray-400 text-sm mt-1">{members.length} miembros · {team.isPrivate ? 'Privado · Por invitación' : 'Público'}</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 w-full md:w-auto">
                        {isCaptain && (
                            <button onClick={() => setIsEditingTeam(!isEditingTeam)} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-sm font-bold border border-gray-700 transition">
                                {isEditingTeam ? 'Cancelar Edición' : 'Editar Equipo ⚙️'}
                            </button>
                        )}
                        {isMember ? (
                            !isCaptain && (
                                <button onClick={handleLeave} disabled={leaving} className="px-6 py-2.5 rounded-lg font-bold border border-red-800 text-red-400 hover:bg-red-950/50 transition">
                                    {leaving ? 'Saliendo...' : 'Abandonar Equipo'}
                                </button>
                            )
                        ) : team.isPrivate ? (
                            <div className="text-sm text-gray-400 max-w-xs">
                                Este equipo es privado. Necesitás una invitación del capitán para ingresar.
                                <Link to="/team-invitations" className="block mt-2 text-purple-300 hover:underline">Ver mis invitaciones</Link>
                            </div>
                        ) : (
                            <button onClick={handleJoin} disabled={joining} className="px-6 py-3 rounded-lg font-bold bg-purple-600 hover:bg-purple-500 text-white transition shadow-lg shadow-purple-900/40">
                                {joining ? 'Uniéndote...' : 'Unirse al Equipo'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Panel de edición de equipo (RF-10) */}
                {isCaptain && isEditingTeam && (
                    <form onSubmit={handleUpdateTeamSubmit} className="bg-[#161b22] border border-purple-500/40 p-6 rounded-xl space-y-4">
                        <h3 className="text-lg font-bold text-white">Configuración del Equipo</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Nombre</label>
                                <input type="text" value={editTeamForm.name} onChange={e => setEditTeamForm({...editTeamForm, name: e.target.value})} className="w-full bg-[#0d1117] border border-gray-800 p-2 rounded text-sm text-white" required />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Tag / Siglas</label>
                                <input type="text" value={editTeamForm.tag} onChange={e => setEditTeamForm({...editTeamForm, tag: e.target.value})} className="w-full bg-[#0d1117] border border-gray-800 p-2 rounded text-sm text-white" required />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Logo URL</label>
                                <input type="text" value={editTeamForm.logoUrl} onChange={e => setEditTeamForm({...editTeamForm, logoUrl: e.target.value})} className="w-full bg-[#0d1117] border border-gray-800 p-2 rounded text-sm text-white" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="edit-team-privacy" className="block text-xs text-gray-400 mb-1">Privacidad</label>
                            <select id="edit-team-privacy" value={String(editTeamForm.isPrivate)} onChange={e => setEditTeamForm({ ...editTeamForm, isPrivate: e.target.value === 'true' })} className="w-full bg-[#0d1117] border border-gray-800 p-2 rounded text-sm">
                                <option value="false">Público</option>
                                <option value="true">Privado</option>
                            </select>
                            <p className="text-xs text-gray-400 mt-1">Privado exige invitación; el equipo y sus integrantes siguen siendo visibles. Cambiar esta opción no expulsa miembros.</p>
                        </div>
                        <button disabled={saving} type="submit" className="bg-purple-600 hover:bg-purple-500 text-white text-xs px-4 py-2 rounded font-bold">{saving ? 'Guardando...' : 'Guardar Cambios'}</button>
                    </form>
                )}

                {isCaptain && <TeamInvitationsPanel key={team.id} teamId={team.id} />}

                {/* Lista de Miembros con gestión de Titulares/Suplentes y Expulsión */}
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
                                        {/* Controles exclusivos del Capitán (RF-13, RF-15) */}
                                        {isCaptain && !memberIsCaptain && (
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => handleToggleStarter(m)} 
                                                    className="text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded text-gray-300 transition"
                                                >
                                                    Cambiar a {m.isStarter ? 'Suplente' : 'Titular'}
                                                </button>
                                                <button 
                                                    onClick={() => handleRemoveMember(m.userId, m.username)} 
                                                    className="text-xs bg-red-950 hover:bg-red-900 text-red-300 px-3 py-1.5 rounded border border-red-800/50 transition"
                                                >
                                                    Expulsar
                                                </button>
                                            </div>
                                        )}
                                        {memberIsCaptain && (
                                            <span className="text-xs text-amber-400 font-bold bg-amber-950/40 px-2.5 py-1 rounded border border-amber-800">
                                                Capitán 👑
                                            </span>
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