import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../config';
import { Link } from 'react-router-dom';
import { getStoredUser } from '../../../utils/Roles';

const AVAILABLE_GAMES = [
    { id: 'all', name: 'Global (Todos)' },
    { id: 'Valorant', name: 'Valorant' },
    { id: 'Counter-Strike 2', name: 'Counter-Strike 2' },
    { id: 'League of Legends', name: 'League of Legends' },
    { id: 'EA FC 27', name: 'EA FC 27' }
];

export default function Leaderboard() {
    const [rankings, setRankings] = useState([]);
    const [selectedGame, setSelectedGame] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const currentUser = getStoredUser();

    useEffect(() => {
        setLoading(true);
        const query = selectedGame !== 'all' ? `?gameName=${encodeURIComponent(selectedGame)}` : '';
        
        apiFetch(`/rankings${query}`)
            .then(res => {
                if (!res.ok) throw new Error('No se pudo cargar la tabla de clasificación.');
                return res.json();
            })
            .then(data => {
                setRankings(data);
                setError('');
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [selectedGame]);

    return (
        <div className="p-6 text-white max-w-5xl mx-auto min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-wide">Tabla de Clasificación</h2>
                    <p className="text-sm text-gray-400 mt-1">Descubre a los mejores jugadores de la plataforma.</p>
                </div>

                {/* Filtros por juego */}
                <div className="flex flex-wrap gap-2">
                    {AVAILABLE_GAMES.map(game => (
                        <button
                            key={game.id}
                            onClick={() => setSelectedGame(game.id)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition cursor-pointer ${
                                selectedGame === game.id
                                    ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/40'
                                    : 'bg-[#161b22] border-gray-800 text-gray-300 hover:border-gray-600'
                            }`}
                        >
                            {game.name}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="text-xs text-red-400 border border-red-800/50 bg-red-950/30 rounded-lg px-4 py-3 mb-6">
                    {error}
                </div>
            )}

            <div className="bg-[#161b22] border border-gray-800 rounded-xl overflow-hidden shadow-xl">
                {loading ? (
                    <div className="text-center py-12 text-gray-400 text-sm">Cargando ranking...</div>
                ) : rankings.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 text-sm">No hay registros en el ranking todavía.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-800 bg-black/40 text-xs uppercase tracking-wider text-gray-400">
                                    <th className="py-3 px-4 text-center w-16">#</th>
                                    <th className="py-3 px-4">Jugador</th>
                                    <th className="py-3 px-4 text-center">Puntos / ELO</th>
                                    <th className="py-3 px-4 text-center">Torneos Ganados</th>
                                    <th className="py-3 px-4 text-center">Partidas (G / P)</th>
                                    <th className="py-3 px-4 text-center">Winrate</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/60 text-sm">
                                {rankings.map((player, index) => {
                                    const isMe = currentUser && player.userId === currentUser.id;
                                    const rank = index + 1;

                                    let badgeColor = 'text-gray-400 font-mono';
                                    if (rank === 1) badgeColor = 'text-amber-300 font-extrabold text-base';
                                    else if (rank === 2) badgeColor = 'text-gray-300 font-bold';
                                    else if (rank === 3) badgeColor = 'text-amber-600 font-bold';

                                    return (
                                        <tr 
                                            key={player.userId} 
                                            className={`transition hover:bg-gray-800/30 ${isMe ? 'bg-purple-950/20' : ''}`}
                                        >
                                            <td className={`py-4 px-4 text-center ${badgeColor}`}>
                                                {rank === 1 ? '🥇 1' : rank === 2 ? '🥈 2' : rank === 3 ? '🥉 3' : rank}
                                            </td>
                                            <td className="py-4 px-4">
                                                <Link 
                                                    to={isMe ? '/profile' : `/users/${player.userId}`} 
                                                    className="font-semibold text-white hover:text-purple-400 transition flex items-center gap-2"
                                                >
                                                    {player.username}
                                                    {isMe && (
                                                        <span className="text-[10px] bg-purple-900 text-purple-200 px-1.5 py-0.5 rounded">Tú</span>
                                                    )}
                                                </Link>
                                            </td>
                                            <td className="py-4 px-4 text-center font-mono font-bold text-purple-400">
                                                {player.points} pts
                                            </td>
                                            <td className="py-4 px-4 text-center font-mono text-gray-300">
                                                🏆 {player.tournamentsWon}
                                            </td>
                                            <td className="py-4 px-4 text-center font-mono text-gray-300 text-xs">
                                                <span className="text-emerald-400">{player.matchesWon}</span> / <span className="text-red-400">{player.matchesLost}</span>
                                            </td>
                                            <td className="py-4 px-4 text-center font-mono text-xs text-gray-300">
                                                {player.winRate}%
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
