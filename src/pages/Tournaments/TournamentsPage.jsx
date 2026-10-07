import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config'; // 🌟 Importamos la URL centralizada

export default function TournamentsPage() {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Petición al backend usando la URL centralizada
        fetch(`${API_URL}/tournaments`)
            .then(response => {
                if (!response.ok) throw new Error('Error al cargar los torneos');
                return response.json();
            })
            .then(data => {
                setTournaments(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#0d1117] text-white">
                <p className="text-purple-400 animate-pulse">Cargando torneos de Nexus Arena...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#0d1117] text-red-400">
                <p>Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-[#0d1117] min-h-screen text-white">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-wide">Torneos Activos</h1>
                        <p className="text-gray-400 text-sm mt-1">Compite, escala en las tablas y gana grandes premios.</p>
                    </div>
                    {/* Botón para ir al formulario de creación de torneos */}
                    <button
                        onClick={() => navigate('/tournaments/create')}
                        className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2.5 rounded-lg transition shadow-lg shadow-purple-900/30 flex items-center gap-2 text-sm"
                    >
                        <span>+ Crear Torneo</span>
                    </button>
                </div>

                {tournaments.length === 0 ? (
                    <div className="bg-[#161b22] border border-gray-800 rounded-xl p-8 text-center text-gray-400">
                        No hay torneos disponibles en este momento. ¡Pronto se crearán nuevos eventos!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tournaments.map(tournament => (
                            <div 
                                key={tournament.id}
                                onClick={() => navigate(`/tournaments/${tournament.id}`)}
                                className="bg-[#161b22] border border-gray-800 rounded-xl overflow-hidden hover:border-purple-600 transition cursor-pointer flex flex-col justify-between"
                            >
                                <div>
                                    <div className="h-40 bg-gray-900 relative">
                                        <img 
                                            src={tournament.bannerUrl || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop"} 
                                            alt={tournament.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <span className="absolute top-3 right-3 bg-purple-600 text-xs font-semibold px-3 py-1 rounded-full text-white">
                                            {tournament.status}
                                        </span>
                                    </div>
                                    <div className="p-5">
                                        <span className="text-xs font-medium text-purple-400 uppercase tracking-wider">{tournament.gameName}</span>
                                        <h3 className="text-xl font-bold mt-1 text-white">{tournament.title}</h3>
                                        <div className="flex items-center justify-between mt-4 text-sm text-gray-300">
                                            <span>Pozo de Premios:</span>
                                            <span className="text-emerald-400 font-bold">€{tournament.prizePool}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-5 pt-0 flex justify-between items-center text-xs text-gray-400 border-t border-gray-800/60 mt-4">
                                    <span>Cupos: {tournament.participants.length} / {tournament.maxParticipants}</span>
                                    <span className="text-purple-400 font-semibold hover:underline">Ver detalles →</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}