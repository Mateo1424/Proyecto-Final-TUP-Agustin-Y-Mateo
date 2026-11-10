import { useState, useEffect } from 'react';
import { apiFetch } from '../../../config';
import { Link } from 'react-router-dom';
import { getStoredUser } from '../../../utils/Roles';

const AVAILABLE_GAMES = [
    { id: 'all', name: 'Global (Todos)' },
    { id: 'Valorant', name: 'Valorant' },
    { id: 'Counter-Strike 2', name: 'Counter-Strike 2' },
    { id: 'League of Legends', name: 'League of Legends' },
    { id: 'EA FC 27', name: 'EA FC 27' },
    { id: 'Rocket League', name: 'Rocket League' },
    { id: 'CS:GO', name: 'CS:GO' }
];

const MODES = [
    { id: 'players', label: 'Jugadores' },
    { id: 'teams', label: 'Equipos' },
    { id: 'me', label: 'Mi progreso' }
];

// El backend siempre devuelve el ranking de mayor a menor, así que el orden
// ascendente se resuelve en el cliente sobre el array ya recibido.
const SORTS = [
    { id: 'desc', label: 'Mayor a menor', icon: '↓' },
    { id: 'asc', label: 'Menor a mayor', icon: '↑' }
];

const TX_LABELS = {
    Participation: 'Participación',
    MatchWin: 'Victoria',
    MatchLoss: 'Derrota',
    Champion: 'Campeón',
    RunnerUp: 'Subcampeón',
    Semifinalist: 'Semifinalista'
};

function rankBadge(rank) {
    if (rank === 1) return 'text-amber-300 font-extrabold text-base';
    if (rank === 2) return 'text-gray-300 font-bold';
    if (rank === 3) return 'text-amber-600 font-bold';
    return 'text-gray-400 font-mono';
}

function rankIcon(rank) {
    if (rank === 1) return '🥇 1';
    if (rank === 2) return '🥈 2';
    if (rank === 3) return '🥉 3';
    return rank;
}

function formatDate(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function Leaderboard() {
    const [mode, setMode] = useState('players');
    const [rankings, setRankings] = useState([]);
    const [teams, setTeams] = useState([]);
    const [myProgress, setMyProgress] = useState(null);
    const [selectedGame, setSelectedGame] = useState('all');
    const [sortOrder, setSortOrder] = useState('desc');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const currentUser = getStoredUser();

    useEffect(() => {
        let cancelled = false;
        const query = selectedGame !== 'all' ? `?gameName=${encodeURIComponent(selectedGame)}` : '';
        const path = mode === 'players'
            ? `/rankings${query}`
            : mode === 'teams'
                ? `/rankings/teams${query}`
                : '/rankings/me';

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true);
        setError('');

        apiFetch(path)
            .then(res => {
                if (res.status === 401) throw new Error('Iniciá sesión para ver tu progreso.');
                if (!res.ok) throw new Error('No se pudo cargar el ranking.');
                return res.json();
            })
            .then(data => {
                if (cancelled) return;
                if (mode === 'players') setRankings(Array.isArray(data) ? data : []);
                else if (mode === 'teams') setTeams(Array.isArray(data) ? data : []);
                else setMyProgress(data);
                setLoading(false);
            })
            .catch(err => {
                if (cancelled) return;
                setError(err.message);
                setLoading(false);
            });

        return () => { cancelled = true; };
    }, [mode, selectedGame]);

    const handleSelectGame = (gameId) => {
        if (gameId === selectedGame) return;
        setSelectedGame(gameId);
    };

    const gameLabel = selectedGame === 'all' ? 'Global' : selectedGame;

    // Ordena por puntos web; ante empate se respeta el orden que ya trae el backend.
    const sortRows = (rows) =>
        [...rows].sort((a, b) => {
            const diff = (b.points || 0) - (a.points || 0);
            return sortOrder === 'asc' ? -diff : diff;
        });

    return (
        <div className="p-6 text-white max-w-6xl mx-auto min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-wide">Ranking Nexus</h2>
                    <p className="text-sm text-gray-400 mt-1">
                        El progreso de los jugadores dentro de la plataforma, desde su primer torneo en la web.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {MODES.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setMode(item.id)}
                            className={`px-4 py-2 text-sm font-semibold rounded-lg border transition cursor-pointer ${
                                mode === item.id
                                    ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/40'
                                    : 'bg-[#161b22] border-gray-800 text-gray-300 hover:border-gray-600'
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-[#10151d] border border-purple-900/30 rounded-xl p-4 mb-6 text-sm text-gray-300">
                <p>
                    <span className="font-bold text-purple-300">Puntos de la web:</span> todos empiezan en
                    <span className="font-mono font-bold text-white"> 0</span> al vincular un juego.
                    Solo se ganan por participar y competir en torneos de esta plataforma.
                </p>
                <p className="text-xs text-gray-500 mt-1">
                    El rango in-game (Oro, Diamante, etc.) se muestra únicamente como referencia y no suma ni resta puntos.
                </p>
            </div>

            {mode !== 'me' && (
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-6">
                    <div className="flex flex-wrap gap-2">
                        {AVAILABLE_GAMES.map(game => (
                            <button
                                key={game.id}
                                onClick={() => handleSelectGame(game.id)}
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

                    <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] uppercase tracking-wider text-gray-500">Orden</span>
                        <div className="inline-flex rounded-lg border border-gray-800 bg-[#161b22] p-1">
                            {SORTS.map(sort => (
                                <button
                                    key={sort.id}
                                    onClick={() => setSortOrder(sort.id)}
                                    className={`px-3 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                                        sortOrder === sort.id
                                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
                                            : 'text-gray-400 hover:text-white'
                                    }`}
                                >
                                    <span className="font-mono mr-1">{sort.icon}</span>
                                    {sort.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div className="text-xs text-red-400 border border-red-800/50 bg-red-950/30 rounded-lg px-4 py-3 mb-6">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="bg-[#161b22] border border-gray-800 rounded-xl text-center py-12 text-gray-400 text-sm">
                    Cargando ranking...
                </div>
            ) : mode === 'players' ? (
                <PlayersTable
                    players={sortRows(rankings)}
                    gameLabel={gameLabel}
                    currentUser={currentUser}
                    sortOrder={sortOrder}
                />
            ) : mode === 'teams' ? (
                <TeamsTable teams={sortRows(teams)} gameLabel={gameLabel} sortOrder={sortOrder} />
            ) : (
                <MyProgress progress={myProgress} />
            )}
        </div>
    );
}

function PlayersTable({ players, gameLabel, currentUser, sortOrder }) {
    if (players.length === 0) {
        return (
            <div className="bg-[#161b22] border border-gray-800 rounded-xl text-center py-12 text-gray-500 text-sm">
                No hay jugadores vinculados a {gameLabel} todavía.
            </div>
        );
    }

    return (
        <div className="bg-[#161b22] border border-gray-800 rounded-xl overflow-hidden shadow-xl">
            <div className="px-4 py-3 border-b border-gray-800 bg-black/20 text-xs text-gray-400 uppercase tracking-wider flex flex-wrap items-center justify-between gap-2">
                <span>Ranking de jugadores · {gameLabel}</span>
                <span className="normal-case tracking-normal text-[11px] text-gray-500">
                    {sortOrder === 'asc' ? '↑ menor a mayor' : '↓ mayor a menor'} · la posición # es el puesto real
                </span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-800 bg-black/40 text-xs uppercase tracking-wider text-gray-400">
                            <th className="py-3 px-4 text-center w-16">#</th>
                            <th className="py-3 px-4">Jugador</th>
                            <th className="py-3 px-4 text-center">Puntos web</th>
                            <th className="py-3 px-4 text-center">Rango in-game</th>
                            <th className="py-3 px-4 text-center">Torneos (G / J)</th>
                            <th className="py-3 px-4 text-center">Partidas (G / P)</th>
                            <th className="py-3 px-4 text-center">Winrate</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/60 text-sm">
                        {players.map(player => {
                            const isMe = currentUser && player.userId === currentUser.id;
                            const position = player.position || 0;
                            const games = player.games || [];

                            return (
                                <tr
                                    key={player.userId}
                                    className={`transition hover:bg-gray-800/30 ${isMe ? 'bg-purple-950/20' : ''}`}
                                >
                                    <td className={`py-4 px-4 text-center ${rankBadge(position)}`}>
                                        {rankIcon(position)}
                                    </td>
                                    <td className="py-4 px-4">
                                        <Link
                                            to={isMe ? '/profile' : `/users/${player.userId}`}
                                            className="font-semibold text-white hover:text-purple-400 transition inline-flex items-center gap-2"
                                        >
                                            {player.username}
                                            {isMe && (
                                                <span className="text-[10px] bg-purple-900 text-purple-200 px-1.5 py-0.5 rounded">Tú</span>
                                            )}
                                        </Link>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {games.slice(0, 4).map(game => (
                                                <span
                                                    key={game.gameName}
                                                    className="text-[10px] bg-gray-900 border border-gray-800 text-gray-400 px-1.5 py-0.5 rounded"
                                                    title={game.rank ? `Rango in-game: ${game.rank}` : 'Sin rango declarado'}
                                                >
                                                    {game.gameName}: <span className="text-purple-300 font-mono">{game.points} pts</span>
                                                    {game.rank ? ` · ${game.rank}` : ''}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-center font-mono font-bold text-purple-400">
                                        {player.points} pts
                                    </td>
                                    <td className="py-4 px-4 text-center text-xs">
                                        <div className="text-gray-200 font-medium">{player.rank || '—'}</div>
                                        {player.inGameName && <div className="text-gray-500 font-mono">{player.inGameName}</div>}
                                    </td>
                                    <td className="py-4 px-4 text-center font-mono text-gray-300">
                                        <span className="text-amber-300">{player.tournamentsWon}</span>
                                        <span className="text-gray-600"> / </span>
                                        <span>{player.tournamentsPlayed}</span>
                                    </td>
                                    <td className="py-4 px-4 text-center font-mono text-gray-300 text-xs">
                                        <span className="text-emerald-400">{player.matchesWon}</span>
                                        <span className="text-gray-600"> / </span>
                                        <span className="text-red-400">{player.matchesLost}</span>
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
        </div>
    );
}

function TeamsTable({ teams, gameLabel, sortOrder }) {
    if (teams.length === 0) {
        return (
            <div className="bg-[#161b22] border border-gray-800 rounded-xl text-center py-12 text-gray-500 text-sm">
                No hay equipos vinculados a {gameLabel} todavía.
            </div>
        );
    }

    return (
        <div className="bg-[#161b22] border border-gray-800 rounded-xl overflow-hidden shadow-xl">
            <div className="px-4 py-3 border-b border-gray-800 bg-black/20 text-xs text-gray-400 uppercase tracking-wider flex flex-wrap items-center justify-between gap-2">
                <span>Ranking de equipos · {gameLabel}</span>
                <span className="normal-case tracking-normal text-[11px] text-gray-500">
                    {sortOrder === 'asc' ? '↑ menor a mayor' : '↓ mayor a menor'} · la posición # es el puesto real
                </span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-800 bg-black/40 text-xs uppercase tracking-wider text-gray-400">
                            <th className="py-3 px-4 text-center w-16">#</th>
                            <th className="py-3 px-4">Equipo</th>
                            <th className="py-3 px-4 text-center">Juego</th>
                            <th className="py-3 px-4 text-center">Puntos web</th>
                            <th className="py-3 px-4 text-center">Torneos (G / J)</th>
                            <th className="py-3 px-4 text-center">Partidas (G / P)</th>
                            <th className="py-3 px-4 text-center">Winrate</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/60 text-sm">
                        {teams.map(team => {
                            const position = team.position || 0;
                            return (
                                <tr key={team.teamId} className="transition hover:bg-gray-800/30">
                                    <td className={`py-4 px-4 text-center ${rankBadge(position)}`}>
                                        {rankIcon(position)}
                                    </td>
                                    <td className="py-4 px-4">
                                        <Link to={`/teams/${team.teamId}`} className="font-semibold text-white hover:text-purple-400 transition flex items-center gap-3">
                                            <img
                                                src={team.logoUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop'}
                                                alt={team.name}
                                                className="w-9 h-9 rounded-full object-cover border border-purple-500/40 bg-gray-900"
                                            />
                                            <span>
                                                {team.name}
                                                <span className="ml-2 text-[10px] text-purple-300 font-mono">[{team.tag}]</span>
                                            </span>
                                        </Link>
                                        <div className="text-[10px] text-gray-500 mt-1 ml-12">{team.memberCount} integrantes</div>
                                    </td>
                                    <td className="py-4 px-4 text-center text-xs text-gray-300">{team.gameName}</td>
                                    <td className="py-4 px-4 text-center font-mono font-bold text-purple-400">
                                        {team.points} pts
                                    </td>
                                    <td className="py-4 px-4 text-center font-mono text-gray-300">
                                        <span className="text-amber-300">{team.tournamentsWon}</span>
                                        <span className="text-gray-600"> / </span>
                                        <span>{team.tournamentsPlayed}</span>
                                    </td>
                                    <td className="py-4 px-4 text-center font-mono text-gray-300 text-xs">
                                        <span className="text-emerald-400">{team.matchesWon}</span>
                                        <span className="text-gray-600"> / </span>
                                        <span className="text-red-400">{team.matchesLost}</span>
                                    </td>
                                    <td className="py-4 px-4 text-center font-mono text-xs text-gray-300">
                                        {team.winRate}%
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function MyProgress({ progress }) {
    if (!progress) {
        return (
            <div className="bg-[#161b22] border border-gray-800 rounded-xl text-center py-12 text-gray-500 text-sm">
                Iniciá sesión para ver tu progreso.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-950/60 to-[#161b22] border border-purple-800/40 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <p className="text-xs uppercase tracking-wider text-purple-300 font-semibold">Tu puntaje en la plataforma</p>
                    <p className="text-4xl font-black text-white mt-1">
                        {progress.totalPoints} <span className="text-lg font-mono text-purple-300">pts</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                        Empezaste en 0 y este es el progreso acumulado por tus torneos jugados en la web.
                    </p>
                </div>
                <div className="text-sm text-gray-300">
                    <span className="font-semibold text-white">{progress.username}</span>
                    {progress.games?.length > 0 && (
                        <span className="block text-xs text-gray-500 mt-1">{progress.games.length} juego(s) vinculado(s)</span>
                    )}
                </div>
            </div>

            {(!progress.games || progress.games.length === 0) ? (
                <div className="bg-[#161b22] border border-gray-800 rounded-xl text-center py-12 text-gray-500 text-sm">
                    Vinculá un videojuego en tu perfil para empezar a aparecer en el ranking.
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {progress.games.map(game => (
                        <div key={game.gameName} className="bg-[#161b22] border border-gray-800 rounded-xl p-5 space-y-4">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="text-lg font-bold text-white">{game.gameName}</h3>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Rango in-game: <span className="text-emerald-400">{game.rank || '—'}</span>
                                        {game.inGameName ? ` · ${game.inGameName}` : ''}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black text-purple-400">{game.points}</p>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">puntos web</p>
                                    {game.position > 0 && (
                                        <p className="text-xs text-gray-400 mt-1">Posición #{game.position}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                <div className="bg-[#0d1117] border border-gray-800 rounded-lg py-2">
                                    <span className="block font-bold text-white">{game.tournamentsPlayed}</span>
                                    <span className="text-gray-500">Torneos</span>
                                </div>
                                <div className="bg-[#0d1117] border border-gray-800 rounded-lg py-2">
                                    <span className="block font-bold text-emerald-400">{game.matchesWon}</span>
                                    <span className="text-gray-500">Victorias</span>
                                </div>
                                <div className="bg-[#0d1117] border border-gray-800 rounded-lg py-2">
                                    <span className="block font-bold text-red-400">{game.matchesLost}</span>
                                    <span className="text-gray-500">Derrotas</span>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">Historial de puntos</h4>
                                {game.history?.length ? (
                                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                                        {game.history.map(tx => (
                                            <div key={tx.id} className="flex items-start justify-between gap-3 bg-[#0d1117] border border-gray-800/80 rounded-lg px-3 py-2">
                                                <div className="min-w-0">
                                                    <p className="text-xs text-gray-200 truncate">{tx.tournamentTitle || 'Torneo'}</p>
                                                    <p className="text-[10px] text-gray-500">
                                                        {TX_LABELS[tx.type] || tx.type} · {formatDate(tx.createdAt)}
                                                    </p>
                                                </div>
                                                <span className="font-mono text-sm font-bold text-emerald-400 whitespace-nowrap">
                                                    +{tx.points}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-500">Todavía no hay movimientos en este juego.</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
