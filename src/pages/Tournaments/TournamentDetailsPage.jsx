import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../../config';
import { getStoredUser, isModerator as checkModerator } from '../../utils/Roles';
import TournamentBracket from './TournamentBracket';

export default function TournamentDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tournament, setTournament] = useState(null);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [registering, setRegistering] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [disqualifyingId, setDisqualifyingId] = useState(null);
    const [userTeams, setUserTeams] = useState([]);
    const [registeringTeam, setRegisteringTeam] = useState(false);

    // Datos del usuario guardados al iniciar sesión (el token va en la cookie)
    const user = getStoredUser();

    // Solo los moderadores gestionan torneos (el backend también lo valida)
    const isModerator = checkModerator(user);
    const canDelete = isModerator;

    const fetchTournament = () => {
        apiFetch(`/tournaments/${id}`)
            .then(res => {
                if (!res.ok) throw new Error('No se pudo cargar el detalle del torneo.');
                return res.json();
            })
            .then(data => {
                setTournament(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    };

    const fetchMatches = () => {
        apiFetch(`/tournaments/${id}/matches`)
            .then(res => (res.ok ? res.json() : []))
            .then(data => setMatches(Array.isArray(data) ? data : []))
            .catch(() => setMatches([]));
    };

    const fetchUserTeams = () => {
        if (!user) return;
        apiFetch('/teams')
            .then(res => (res.ok ? res.json() : []))
            .then(data => {
                if (Array.isArray(data)) {
                    const mine = data.filter(t => t.members?.some(m => m.userId === user.id));
                    setUserTeams(mine);
                }
            })
            .catch(() => setUserTeams([]));
    };

    const refreshAll = () => {
        fetchTournament();
        fetchMatches();
        fetchUserTeams();
    };

    useEffect(() => {
        refreshAll();
    }, [id]);

    // El backend devuelve las llaves completas después de cada acción del moderador.
    // Se actualizan al instante y se recarga el torneo (por si pasó a "Finalizado").
    const handleMatchesUpdated = (updatedMatches) => {
        setMatches(updatedMatches);
        fetchTournament();
    };

    const handleSessionExpired = () => {
        localStorage.removeItem('user');
        alert('Tu sesión expiró. Volvé a iniciar sesión.');
        navigate('/login');
    };

    const handleRegister = async () => {
        if (!user) {
            alert('Tenés que iniciar sesión para inscribirte.');
            navigate('/login');
            return;
        }

        setRegistering(true);
        try {
            const response = await apiFetch(`/tournaments/${id}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: user.id,
                    username: user.username,
                    inGameName: user.username,
                    rank: 'N/A',
                    registeredAt: new Date().toISOString()
                })
            });

            if (response.status === 401) {
                handleSessionExpired();
                return;
            }

            const text = await response.text();
            const data = text ? JSON.parse(text) : null;

            if (!response.ok) {
                throw new Error(data?.message || `Error al inscribirse (${response.status})`);
            }

            alert('¡Inscripción exitosa!');
            fetchTournament();
        } catch (err) {
            alert(err.message);
        } finally {
            setRegistering(false);
        }
    };

    const handleRegisterTeam = async (teamId) => {
        if (!user) {
            alert('Tenés que iniciar sesión para inscribirte.');
            navigate('/login');
            return;
        }

        setRegisteringTeam(true);
        try {
            const response = await apiFetch(`/tournaments/${id}/register-team`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ teamId })
            });

            if (response.status === 401) {
                handleSessionExpired();
                return;
            }

            const text = await response.text();
            const data = text ? JSON.parse(text) : null;

            if (!response.ok) {
                throw new Error(data?.message || `Error al inscribir equipo (${response.status})`);
            }

            alert('¡Equipo inscripto exitosamente!');
            fetchTournament();
        } catch (err) {
            alert(err.message);
        } finally {
            setRegisteringTeam(false);
        }
    };

    const handleGenerateBracket = async () => {
        const confirmed = window.confirm(
            '¿Generar las llaves ahora? Se cerrarán las inscripciones y no se puede deshacer.'
        );
        if (!confirmed) return;

        setGenerating(true);
        try {
            const response = await apiFetch(`/tournaments/${id}/bracket`, {
                method: 'POST'
            });

            if (response.status === 401) {
                handleSessionExpired();
                return;
            }
            if (response.status === 403) {
                throw new Error('Solo los moderadores pueden generar las llaves.');
            }

            const text = await response.text();
            let data = null;
            try {
                data = text ? JSON.parse(text) : null;
            } catch {
                data = null;
            }

            if (!response.ok) {
                throw new Error(data?.message || `Error al generar las llaves (${response.status})`);
            }

            refreshAll();
        } catch (err) {
            alert(err.message);
        } finally {
            setGenerating(false);
        }
    };

    const handleDisqualify = async (participant) => {
        const reason = window.prompt(
            `Vas a descalificar a ${participant.username}.\nMotivo (opcional):`,
            ''
        );
        // Si cancela el cuadro, no se descalifica
        if (reason === null) return;

        setDisqualifyingId(participant.userId);
        try {
            const response = await apiFetch(
                `/tournaments/${id}/participants/${participant.userId}/disqualify`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ reason })
                }
            );

            if (response.status === 401) {
                handleSessionExpired();
                return;
            }
            if (response.status === 403) {
                throw new Error('Solo los moderadores pueden descalificar jugadores.');
            }

            const text = await response.text();
            let data = null;
            try {
                data = text ? JSON.parse(text) : null;
            } catch {
                data = null;
            }

            if (!response.ok) {
                throw new Error(data?.message || `Error al descalificar (${response.status})`);
            }

            refreshAll();
        } catch (err) {
            alert(err.message);
        } finally {
            setDisqualifyingId(null);
        }
    };

    const handleDelete = async () => {
        if (!user) {
            alert('Tenés que iniciar sesión para eliminar torneos.');
            navigate('/login');
            return;
        }

        const confirmed = window.confirm(
            `¿Seguro que querés eliminar el torneo "${tournament.title}"? Esta acción no se puede deshacer.`
        );
        if (!confirmed) return;

        setDeleting(true);
        try {
            const response = await apiFetch(`/tournaments/${id}`, {
                method: 'DELETE'
            });

            if (response.status === 401) {
                handleSessionExpired();
                return;
            }
            if (response.status === 403) {
                throw new Error('No tenés permisos para eliminar este torneo.');
            }

            const text = await response.text();
            const data = text ? JSON.parse(text) : null;

            if (!response.ok) {
                throw new Error(data?.message || `Error al eliminar (${response.status})`);
            }

            alert('Torneo eliminado con éxito.');
            navigate('/tournaments');
        } catch (err) {
            alert(err.message);
        } finally {
            setDeleting(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen bg-[#0d1117] text-white">Cargando detalles...</div>;
    if (error) return <div className="flex justify-center items-center h-screen bg-[#0d1117] text-red-400">Error: {error}</div>;
    if (!tournament) return <div className="flex justify-center items-center h-screen bg-[#0d1117] text-white">Torneo no encontrado.</div>;

    const isAlreadyRegistered = user
        ? tournament.participants.some(p => p.userId === user.id)
        : false;

    const isAlreadyRegisteredAsTeam = user
        ? tournament.participants.some(p => p.teamId && userTeams.some(t => t.id === p.teamId))
        : false;

    // Las inscripciones se cierran cuando el torneo deja de estar en "Próximo"
    const registrationClosed = tournament.status !== 'Próximo';
    const now = new Date();
    const start = tournament.startDate ? new Date(tournament.startDate) : null;
    const registrationNotOpenYet = start ? now < new Date(start.getTime() - 30 * 60 * 1000) : false;

    // Los resultados se cargan mientras el torneo está en juego (o para corregir la final)
    const canManageResults = isModerator && (tournament.status === 'En curso' || tournament.status === 'Finalizado');

    // Se puede descalificar antes de empezar y durante el torneo, no cuando ya terminó
    const canDisqualify = isModerator && (tournament.status === 'Próximo' || tournament.status === 'En curso');

    const disqualifiedIds = tournament.participants
        .filter(p => p.isDisqualified)
        .map(p => p.userId);

    const startDateText = tournament.startDate
        ? new Date(tournament.startDate).toLocaleString('es-AR', { dateStyle: 'medium', timeStyle: 'short' })
        : null;

    return (
        <div className="p-6 bg-[#0d1117] min-h-screen text-white">
            <div className="max-w-7xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="text-sm text-purple-400 hover:underline mb-6 flex items-center gap-1"
                >
                    ← Volver a torneos
                </button>

                {/* Banner Principal */}
                <div className="bg-[#161b22] border border-gray-800 rounded-xl overflow-hidden p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div>
                        <span className="bg-purple-600/20 text-purple-400 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider border border-purple-500/30">
                            {tournament.gameName}
                        </span>
                        <h1 className="text-3xl md:text-4xl font-extrabold mt-3 text-white">{tournament.title}</h1>
                        <p className="text-gray-400 text-sm mt-2">Organizado por Nexus Arena • Formato Playoffs • {tournament.status}</p>
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-4 w-full md:w-auto">
                        <div className="text-left md:text-right">
                            <span className="text-xs text-gray-400 block">Pozo de Premios</span>
                            <span className="text-3xl font-extrabold text-emerald-400">€{tournament.prizePool}</span>
                        </div>

                        <div className="flex flex-col gap-2 w-full md:w-auto">
                            <button
                                onClick={handleRegister}
                                disabled={isAlreadyRegistered || registrationClosed || registering}
                                className={`w-full md:w-auto px-6 py-3 rounded-lg font-bold transition shadow-lg ${
                                    isAlreadyRegistered || registrationClosed
                                        ? 'bg-gray-800 text-gray-400 cursor-not-allowed border border-gray-700'
                                        : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/40'
                                }`}
                            >
                                {isAlreadyRegistered
                                    ? 'Inscrito ✓'
                                    : registrationClosed
                                        ? 'Inscripciones cerradas'
                                        : registering
                                            ? 'Inscribiendo...'
                                            : 'Inscribirse al Torneo'}
                            </button>

                            {canDelete && (
                                <button
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="w-full md:w-auto px-6 py-3 rounded-lg font-bold transition border border-red-800 text-red-400 hover:bg-red-950/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {deleting ? 'Eliminando...' : 'Eliminar Torneo'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Grid de Secciones (Reglas y Participantes) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-[#161b22] border border-gray-800 rounded-xl p-6">
                            <h3 className="text-xl font-bold mb-4 text-white">Reglas Clave</h3>
                            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                                {tournament.rules || "No se especificaron reglas adicionales para este torneo."}
                            </p>
                        </div>

                        <div className="bg-[#161b22] border border-gray-800 rounded-xl p-6">
                            <h3 className="text-xl font-bold mb-4 text-white">Condiciones de Rango</h3>
                            <p className="text-gray-300 text-sm leading-relaxed">
                                {tournament.rankConditions || "Abierto a todos los rangos."}
                            </p>
                        </div>
                    </div>

                    {/* Columna Derecha: Lista de Inscritos */}
                    <div className="bg-[#161b22] border border-gray-800 rounded-xl p-6 flex flex-col h-[500px]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-white">Inscritos</h3>
                            <span className="text-xs text-purple-400 font-semibold bg-purple-950/50 px-2.5 py-1 rounded-md border border-purple-800/50">
                                {tournament.participants.length} / {tournament.maxParticipants}
                            </span>
                        </div>

                        <div className="overflow-y-auto flex-1 space-y-3 pr-1">
                            {tournament.participants.length === 0 ? (
                                <p className="text-gray-500 text-sm text-center py-10">Aún no hay participantes inscritos.</p>
                            ) : (
                                tournament.participants.map((p, index) => {
                                    const isMe = user && p.userId === user.id;

                                    return (
                                        <div key={index} className="bg-gray-900/60 border border-gray-800/80 p-3 rounded-lg flex items-center justify-between gap-2 text-sm hover:border-purple-600/60 transition">
                                            {/* El nombre lleva al perfil del participante */}
                                            <Link
                                                to={isMe ? '/profile' : `/users/${p.userId}`}
                                                className="group min-w-0"
                                                title={`Ver perfil de ${p.username}`}
                                            >
                                                <p className={`font-semibold group-hover:text-purple-400 transition flex items-center gap-2 ${p.isDisqualified ? 'text-gray-500 line-through' : 'text-white'}`}>
                                                    <span className="truncate">{p.username}</span>
                                                    {isMe && <span className="text-[10px] bg-purple-900 text-purple-200 px-1.5 py-0.5 rounded no-underline">Tú</span>}
                                                </p>
                                                <p className="text-xs text-gray-400 truncate">{p.inGameName}</p>
                                            </Link>

                                            <div className="flex flex-col items-end gap-1 shrink-0">
                                                {p.isDisqualified ? (
                                                    <span
                                                        title={p.disqualificationReason || 'Sin motivo indicado'}
                                                        className="text-xs font-medium text-red-400 bg-red-950/40 px-2 py-0.5 rounded border border-red-800/40"
                                                    >
                                                        Descalificado
                                                    </span>
                                                ) : (
                                                    <span className="text-xs font-medium text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/30">
                                                        {p.rank || "N/A"}
                                                    </span>
                                                )}

                                                {canDisqualify && !p.isDisqualified && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDisqualify(p)}
                                                        disabled={disqualifyingId === p.userId}
                                                        className="text-[11px] font-semibold text-red-400 hover:text-red-300 hover:underline disabled:opacity-50 cursor-pointer"
                                                    >
                                                        {disqualifyingId === p.userId ? 'Descalificando...' : 'Descalificar'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* Llaves del torneo */}
                <div className="bg-[#161b22] border border-gray-800 rounded-xl p-6 mt-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                        <h3 className="text-xl font-bold text-white">Llaves del Torneo</h3>

                        {isModerator && matches.length === 0 && tournament.status === 'Próximo' && (
                            <button
                                onClick={handleGenerateBracket}
                                disabled={generating || tournament.participants.filter(p => !p.isDisqualified).length < 2}
                                className="px-4 py-2 rounded-lg font-bold text-sm transition bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/40 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {generating ? 'Generando...' : 'Generar llaves ahora'}
                            </button>
                        )}
                    </div>

                    {matches.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-8">
                            {tournament.participants.filter(p => !p.isDisqualified).length < 2
                                ? 'Se necesitan al menos 2 inscritos para generar las llaves.'
                                : `Las llaves se generan automáticamente cuando comienza el torneo${startDateText ? ` (${startDateText})` : ''}.`}
                        </p>
                    ) : (
                        <TournamentBracket
                            matches={matches}
                            currentUserId={user?.id}
                            canManage={canManageResults}
                            gameName={tournament.gameName}
                            disqualifiedIds={disqualifiedIds}
                            onMatchesUpdated={handleMatchesUpdated}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}