import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../../config';

export default function TeamDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [joining, setJoining] = useState(false);
    const [leaving, setLeaving] = useState(false);

    // Datos del usuario guardados al iniciar sesión (el token va en la cookie)
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;

    const fetchTeam = () => {
        apiFetch(`/teams/${id}`)
            .then(res => {
                if (res.status === 404) throw new Error('Equipo no encontrado.');
                if (!res.ok) throw new Error('No se pudo cargar el detalle del equipo.');
                return res.json();
            })
            .then(data => {
                setTeam(data);
                setError(null);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchTeam();
    }, [id]);

    const handleSessionExpired = () => {
        localStorage.removeItem('user');
        alert('Tu sesión expiró. Volvé a iniciar sesión.');
        navigate('/login');
    };

    // Lee la respuesta sin romper si el cuerpo viene vacío
    const readBody = async (response) => {
        const text = await response.text();
        try {
            return text ? JSON.parse(text) : null;
        } catch {
            return null;
        }
    };

    const handleJoin = async () => {
        if (!user) {
            alert('Tenés que iniciar sesión para unirte a un equipo.');
            navigate('/login');
            return;
        }

        setJoining(true);
        try {
            const response = await apiFetch(`/teams/${id}/join`, { method: 'POST' });

            if (response.status === 401) {
                handleSessionExpired();
                return;
            }

            const data = await readBody(response);

            if (!response.ok) {
                throw new Error(data?.message || `Error al unirse (${response.status})`);
            }

            alert(data?.message || '¡Te uniste al equipo!');
            fetchTeam();
        } catch (err) {
            alert(err.message);
        } finally {
            setJoining(false);
        }
    };

    const handleLeave = async () => {
        const confirmed = window.confirm(`¿Seguro que querés abandonar el equipo "${team.name}"?`);
        if (!confirmed) return;

        setLeaving(true);
        try {
            const response = await apiFetch(`/teams/${id}/leave`, { method: 'POST' });

            if (response.status === 401) {
                handleSessionExpired();
                return;
            }

            const data = await readBody(response);

            if (!response.ok) {
                throw new Error(data?.message || `Error al abandonar (${response.status})`);
            }

            alert(data?.message || 'Abandonaste el equipo.');
            fetchTeam();
        } catch (err) {
            alert(err.message);
        } finally {
            setLeaving(false);
        }
    };

    const formatDate = (value) => {
        if (!value) return '—';
        const date = new Date(value);
        return isNaN(date.getTime())
            ? '—'
            : date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatLastActive = (value) => {
        if (!value) return 'Sin actividad';
        const date = new Date(value);
        if (isNaN(date.getTime())) return 'Sin actividad';

        const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
        if (minutes < 5) return 'Activo ahora';
        if (minutes < 60) return `Hace ${minutes} min`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `Hace ${hours} h`;
        const days = Math.floor(hours / 24);
        return `Hace ${days} ${days === 1 ? 'día' : 'días'}`;
    };

    if (loading) return <div className="flex justify-center items-center h-screen bg-[#0d1117] text-white">Cargando detalles...</div>;
    if (error) {
        return (
            <div className="flex flex-col gap-4 justify-center items-center h-screen bg-[#0d1117] text-red-400">
                <p>Error: {error}</p>
                <button
                    onClick={() => navigate('/teams')}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold transition"
                >
                    Volver a equipos
                </button>
            </div>
        );
    }
    if (!team) return <div className="flex justify-center items-center h-screen bg-[#0d1117] text-white">Equipo no encontrado.</div>;

    const members = team.members || [];
    const isMember = user ? members.some(m => m.userId === user.id) : false;
    const isCaptain = user ? team.captainId === user.id : false;

    return (
        <div className="p-6 bg-[#0d1117] min-h-screen text-white">
            <div className="max-w-5xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="text-sm text-purple-400 hover:underline mb-6 flex items-center gap-1"
                >
                    ← Volver a equipos
                </button>

                {/* Banner Principal */}
                <div className="bg-[#161b22] border border-gray-800 rounded-xl overflow-hidden p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div className="flex items-center gap-5">
                        <img
                            src={team.logoUrl}
                            alt={team.name}
                            className="w-20 h-20 object-cover rounded-full border-2 border-purple-500/50 bg-gray-900"
                        />
                        <div>
                            <span className="bg-purple-600/20 text-purple-400 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider border border-purple-500/30 font-mono">
                                [{team.tag}]
                            </span>
                            <h1 className="text-3xl md:text-4xl font-extrabold mt-3 text-white">{team.name}</h1>
                            <p className="text-gray-400 text-sm mt-2">
                                {members.length} {members.length === 1 ? 'miembro' : 'miembros'}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 w-full md:w-auto">
                        {isMember ? (
                            <>
                                <span className="text-center px-6 py-3 rounded-lg font-bold bg-gray-800 text-gray-400 border border-gray-700">
                                    {isCaptain ? 'Sos el capitán 👑' : 'Sos miembro ✓'}
                                </span>
                                {!isCaptain && (
                                    <button
                                        onClick={handleLeave}
                                        disabled={leaving}
                                        className="w-full md:w-auto px-6 py-3 rounded-lg font-bold transition border border-red-800 text-red-400 hover:bg-red-950/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {leaving ? 'Saliendo...' : 'Abandonar Equipo'}
                                    </button>
                                )}
                            </>
                        ) : (
                            <button
                                onClick={handleJoin}
                                disabled={joining}
                                className="w-full md:w-auto px-6 py-3 rounded-lg font-bold transition shadow-lg bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/40 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {joining ? 'Uniéndote...' : 'Unirse al Equipo'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Lista de Miembros */}
                <div className="bg-[#161b22] border border-gray-800 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-white">Miembros</h3>
                        <span className="text-xs text-purple-400 font-semibold bg-purple-950/50 px-2.5 py-1 rounded-md border border-purple-800/50">
                            {members.length}
                        </span>
                    </div>

                    {members.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-10">Este equipo todavía no tiene miembros.</p>
                    ) : (
                        <div className="space-y-3">
                            {members.map((m) => {
                                const isMe = user && m.userId === user.id;
                                const memberIsCaptain = m.userId === team.captainId;

                                return (
                                    <div
                                        key={m.userId}
                                        className="bg-gray-900/60 border border-gray-800/80 p-3 rounded-lg flex items-center justify-between text-sm hover:border-purple-600/60 transition"
                                    >
                                        <Link
                                            to={isMe ? '/profile' : `/users/${m.userId}`}
                                            className="group"
                                            title={`Ver perfil de ${m.username}`}
                                        >
                                            <p className="font-semibold text-white group-hover:text-purple-400 transition flex items-center gap-2">
                                                {m.username}
                                                {isMe && <span className="text-[10px] bg-purple-900 text-purple-200 px-1.5 py-0.5 rounded">Tú</span>}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                Desde {formatDate(m.joinedAt)} • {formatLastActive(m.lastActive)}
                                            </p>
                                        </Link>

                                        <span
                                            className={`text-xs font-medium px-2 py-0.5 rounded border ${
                                                memberIsCaptain
                                                    ? 'text-amber-400 bg-amber-950/40 border-amber-800/30'
                                                    : 'text-emerald-400 bg-emerald-950/40 border-emerald-800/30'
                                            }`}
                                        >
                                            {memberIsCaptain ? 'Capitán' : 'Miembro'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}