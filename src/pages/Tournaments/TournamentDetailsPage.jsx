import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../../config';

export default function TournamentDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [registering, setRegistering] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Usuario y token reales guardados al iniciar sesión
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;

    // Por ahora cualquier usuario logueado puede borrar.
    // Cuando implementes roles, cambiá esta línea por: user?.role === 'Admin'
    const canDelete = !!user;

    const fetchTournament = () => {
        fetch(`${API_URL}/tournaments/${id}`)
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

    useEffect(() => {
        fetchTournament();
    }, [id]);

    const handleRegister = async () => {
        if (!token || !user) {
            alert('Tenés que iniciar sesión para inscribirte.');
            navigate('/login');
            return;
        }

        setRegistering(true);
        try {
            const response = await fetch(`${API_URL}/tournaments/${id}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId: user.id,
                    username: user.username,
                    inGameName: user.username,
                    rank: 'N/A',
                    registeredAt: new Date().toISOString()
                })
            });

            const text = await response.text();
            const data = text ? JSON.parse(text) : null;

            if (response.status === 401) {
                throw new Error('Tu sesión expiró. Volvé a iniciar sesión.');
            }
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

    const handleDelete = async () => {
        if (!token || !user) {
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
            const response = await fetch(`${API_URL}/tournaments/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const text = await response.text();
            const data = text ? JSON.parse(text) : null;

            if (response.status === 401) {
                throw new Error('Tu sesión expiró. Volvé a iniciar sesión.');
            }
            if (response.status === 403) {
                throw new Error('No tenés permisos para eliminar este torneo.');
            }
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
                        <p className="text-gray-400 text-sm mt-2">Organizado por Nexus Arena • Formato Playoffs</p>
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-4 w-full md:w-auto">
                        <div className="text-left md:text-right">
                            <span className="text-xs text-gray-400 block">Pozo de Premios</span>
                            <span className="text-3xl font-extrabold text-emerald-400">€{tournament.prizePool}</span>
                        </div>

                        <div className="flex flex-col gap-2 w-full md:w-auto">
                            <button
                                onClick={handleRegister}
                                disabled={isAlreadyRegistered || registering}
                                className={`w-full md:w-auto px-6 py-3 rounded-lg font-bold transition shadow-lg ${
                                    isAlreadyRegistered
                                        ? 'bg-gray-800 text-gray-400 cursor-not-allowed border border-gray-700'
                                        : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/40'
                                }`}
                            >
                                {isAlreadyRegistered ? 'Inscrito ✓' : registering ? 'Inscribiendo...' : 'Inscribirse al Torneo'}
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
                                tournament.participants.map((p, index) => (
                                    <div key={index} className="bg-gray-900/60 border border-gray-800/80 p-3 rounded-lg flex items-center justify-between text-sm">
                                        <div>
                                            <p className="font-semibold text-white">{p.username}</p>
                                            <p className="text-xs text-gray-400">{p.inGameName}</p>
                                        </div>
                                        <span className="text-xs font-medium text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/30">
                                            {p.rank || "N/A"}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}