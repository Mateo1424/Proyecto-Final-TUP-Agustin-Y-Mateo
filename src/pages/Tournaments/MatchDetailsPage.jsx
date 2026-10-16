import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../../config';
import { getStoredUser, isModerator as checkModerator } from '../../utils/Roles';

const roundName = (round, totalRounds) => {
    const fromFinal = totalRounds - round;
    if (fromFinal === 0) return 'Final';
    if (fromFinal === 1) return 'Semifinales';
    if (fromFinal === 2) return 'Cuartos de final';
    return `Ronda ${round}`;
};

// Formato visible de cada estadística según su clave
const formatStat = (key, value) => {
    if (key === 'money') return `$${value.toLocaleString('es-AR')}`;
    if (key === 'credits' || key === 'gold') return value.toLocaleString('es-AR');
    if (key === 'possession') return `${value}%`;
    return String(value);
};

// KDA = (kills + asistencias) / muertes. Solo en juegos que tienen esas estadísticas.
const calcKda = (stats) => {
    if (!stats || !('kills' in stats) || !('deaths' in stats)) return null;
    const ratio = (stats.kills + (stats.assists ?? 0)) / Math.max(1, stats.deaths);
    return ratio.toFixed(2);
};

const stepBtn =
    'w-7 h-7 flex items-center justify-center rounded border border-gray-700 text-gray-300 text-sm font-bold hover:bg-gray-800/60 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';

// Control del moderador para una estadística: − número +
function StatEditor({ value, step, max, disabled, onCommit }) {
    const [draft, setDraft] = useState(String(value));
    const [focused, setFocused] = useState(false);

    // Si el valor cambia desde el servidor y no se está escribiendo, se sincroniza
    useEffect(() => {
        if (!focused) setDraft(String(value));
    }, [value, focused]);

    const clamp = (n) => {
        let v = Math.max(0, Math.round(n));
        if (max != null) v = Math.min(max, v);
        return v;
    };

    const commit = (n) => {
        const next = clamp(n);
        if (next !== value) onCommit(next);
        else setDraft(String(value));
    };

    return (
        <div className="flex items-center gap-1">
            <button type="button" disabled={disabled} onClick={() => commit(value - step)} className={stepBtn}>
                −
            </button>
            <input
                type="number"
                min={0}
                max={max ?? undefined}
                value={draft}
                disabled={disabled}
                onFocus={() => setFocused(true)}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={() => {
                    setFocused(false);
                    const n = Number(draft);
                    commit(Number.isFinite(n) ? n : value);
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur();
                }}
                className="w-20 p-1 bg-[#161b22] border border-gray-800 rounded text-white text-sm text-center focus:border-purple-500 outline-none"
            />
            <button type="button" disabled={disabled} onClick={() => commit(value + step)} className={stepBtn}>
                +
            </button>
        </div>
    );
}

function PlayerBox({ player, score, isWinner, align, kda, profilePath, controls }) {
    const isRight = align === 'right';

    return (
        <div className={`flex flex-col gap-1 min-w-0 ${isRight ? 'items-end text-right' : 'items-start text-left'}`}>
            {player ? (
                <Link
                    to={profilePath}
                    className="text-xl md:text-2xl font-bold text-white hover:text-purple-400 transition truncate max-w-full"
                    title={`Ver perfil de ${player.username}`}
                >
                    {player.username}
                </Link>
            ) : (
                <span className="text-xl text-gray-500 italic">Por definir</span>
            )}
            {isWinner && <span className="text-xs font-semibold text-amber-300">🏆 Ganador</span>}
            <span className="text-5xl md:text-6xl font-extrabold font-mono text-white leading-none">{score ?? 0}</span>
            {kda && <span className="text-xs text-gray-400">KDA {kda}</span>}
            {controls}
        </div>
    );
}

export default function MatchDetailPage() {
    const { id, matchId } = useParams();
    const navigate = useNavigate();
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionError, setActionError] = useState('');
    const [saving, setSaving] = useState(false);

    const user = getStoredUser();
    const moderator = checkModerator(user);

    const load = useCallback((silent = false) => {
        return apiFetch(`/tournaments/${id}/matches/${matchId}`)
            .then(res => {
                if (res.status === 404) throw new Error('Partido no encontrado.');
                if (!res.ok) throw new Error('No se pudo cargar el partido.');
                return res.json();
            })
            .then(data => {
                setDetail(data);
                setError(null);
                setLoading(false);
            })
            .catch(err => {
                // Una actualización silenciosa que falla no tapa lo que ya se está mostrando
                if (!silent) setError(err.message);
                setLoading(false);
            });
    }, [id, matchId]);

    useEffect(() => {
        load();
    }, [load]);

    // Quienes miran (no moderadores) ven el partido actualizarse mientras no termina
    const matchStatus = detail?.match?.status;
    useEffect(() => {
        if (!detail || moderator || matchStatus === 'Finalizado') return;
        const timer = setInterval(() => load(true), 8000);
        return () => clearInterval(timer);
    }, [detail, moderator, matchStatus, load]);

    // Llama al backend con una acción del moderador y vuelve a cargar el partido
    const callApi = async (path, options) => {
        setSaving(true);
        setActionError('');
        try {
            const response = await apiFetch(path, {
                headers: { 'Content-Type': 'application/json' },
                ...options
            });

            const text = await response.text();
            let data = null;
            try {
                data = text ? JSON.parse(text) : null;
            } catch {
                data = null;
            }

            if (response.status === 401) throw new Error('Tu sesión expiró. Volvé a iniciar sesión.');
            if (response.status === 403) throw new Error('Solo los moderadores pueden hacer esto.');
            if (!response.ok) throw new Error(data?.message || `Error (${response.status})`);

            await load(true);
        } catch (err) {
            setActionError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const saveStat = (side, key, value) =>
        callApi(`/tournaments/${id}/matches/${matchId}/stats`, {
            method: 'PUT',
            body: JSON.stringify({ side, key, value })
        });

    const adjustScore = (side, delta) =>
        callApi(`/tournaments/${id}/matches/${matchId}/score`, {
            method: 'POST',
            body: JSON.stringify({ side, delta })
        });

    if (loading) {
        return <div className="flex justify-center items-center h-screen text-white">Cargando partido...</div>;
    }

    if (error || !detail) {
        return (
            <div className="flex flex-col gap-4 justify-center items-center h-screen text-red-400">
                <p>Error: {error || 'No se pudo cargar el partido.'}</p>
                <button
                    onClick={() => navigate(`/tournaments/${id}`)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold transition"
                >
                    Volver al torneo
                </button>
            </div>
        );
    }

    const { match, game } = detail;
    const finished = match.status === 'Finalizado';
    const inPlay = detail.tournamentStatus === 'En curso' || detail.tournamentStatus === 'Finalizado';

    // Solo moderadores editan. Los demás ven todo sin controles (el backend también lo valida).
    const canEditStats = moderator && inPlay;
    const canEditScore = canEditStats && !finished;

    const aWins = !!match.winnerUserId && match.playerA?.userId === match.winnerUserId;
    const bWins = !!match.winnerUserId && match.playerB?.userId === match.winnerUserId;

    const profilePath = (player) =>
        player && user && player.userId === user.id ? '/profile' : `/users/${player?.userId}`;

    const scoreControls = (side) =>
        canEditScore ? (
            <div className={`flex items-center gap-1 mt-2 ${side === 'B' ? '' : 'justify-end'}`}>
                <button type="button" disabled={saving} onClick={() => adjustScore(side, -1)} className={stepBtn} title="Restar uno">
                    −
                </button>
                <span className="text-[11px] text-gray-500 px-1">{game.scoreUnit}</span>
                <button type="button" disabled={saving} onClick={() => adjustScore(side, 1)} className={stepBtn} title="Sumar uno">
                    +
                </button>
            </div>
        ) : null;

    return (
        <div className="p-6 text-white min-h-screen">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate(`/tournaments/${id}`)}
                    className="text-sm text-purple-400 hover:underline mb-6 flex items-center gap-1"
                >
                    ← Volver al torneo
                </button>

                {/* Encabezado y marcador */}
                <div className="bg-[#161b22] border border-gray-800 rounded-xl p-6 mb-6">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="bg-purple-600/20 text-purple-400 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider border border-purple-500/30">
                            {game.name}
                        </span>
                        <span className="text-xs font-semibold text-gray-300 px-3 py-1 rounded-full border border-gray-700">
                            {roundName(match.round, detail.totalRounds)}
                        </span>
                        <span
                            className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                                finished
                                    ? 'text-emerald-400 border-emerald-800/50 bg-emerald-950/30'
                                    : 'text-amber-300 border-amber-800/50 bg-amber-950/30'
                            }`}
                        >
                            {finished ? 'Finalizado' : 'En juego'}
                        </span>
                        {!finished && !moderator && (
                            <span className="flex items-center gap-1.5 text-[11px] text-gray-500">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                Se actualiza solo
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-400 mb-6">{detail.tournamentTitle}</p>

                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                        <PlayerBox
                            player={match.playerA}
                            score={match.scoreA}
                            isWinner={aWins}
                            align="right"
                            kda={calcKda(detail.statsA)}
                            profilePath={profilePath(match.playerA)}
                            controls={scoreControls('A')}
                        />
                        <span className="text-sm font-bold text-gray-500 tracking-widest">VS</span>
                        <PlayerBox
                            player={match.playerB}
                            score={match.scoreB}
                            isWinner={bWins}
                            align="left"
                            kda={calcKda(detail.statsB)}
                            profilePath={profilePath(match.playerB)}
                            controls={scoreControls('B')}
                        />
                    </div>

                    {match.isWalkover && (
                        <p className="text-xs text-red-400/80 text-center mt-4">Ganó por descalificación del rival.</p>
                    )}

                    {game.winScore && !finished && (
                        <p className="text-xs text-gray-500 text-center mt-4">
                            Gana el primero en llegar a {game.winScore} {game.scoreUnit.toLowerCase()}.
                        </p>
                    )}
                </div>

                {actionError && (
                    <div className="text-xs text-red-400 border border-red-800/50 bg-red-950/30 rounded-lg px-3 py-2 mb-4">
                        {actionError}
                    </div>
                )}

                {/* Estadísticas */}
                <div className="bg-[#161b22] border border-gray-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-xl font-bold text-white">Estadísticas de la partida</h3>
                        {canEditStats && (
                            <span className="text-[11px] font-semibold text-purple-300 border border-purple-800/50 bg-purple-950/30 px-2 py-1 rounded">
                                Modo moderador
                            </span>
                        )}
                    </div>

                    {game.stats.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-6">
                            Este juego todavía no tiene estadísticas configuradas.
                        </p>
                    ) : (
                        <div className="space-y-5">
                            {/* Nombres de cada lado */}
                            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-xs uppercase tracking-wider text-gray-400">
                                <span className="text-right truncate">{match.playerA?.username}</span>
                                <span className="w-28 md:w-40" />
                                <span className="text-left truncate">{match.playerB?.username}</span>
                            </div>

                            {game.stats.map((stat) => {
                                const a = detail.statsA[stat.key] ?? 0;
                                const b = detail.statsB[stat.key] ?? 0;
                                const total = a + b;
                                const shareA = total > 0 ? (a / total) * 100 : 0;

                                return (
                                    <div key={stat.key} className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                                        <div className="flex justify-end">
                                            {canEditStats ? (
                                                <StatEditor
                                                    value={a}
                                                    step={stat.step}
                                                    max={stat.max}
                                                    disabled={saving}
                                                    onCommit={(v) => saveStat('A', stat.key, v)}
                                                />
                                            ) : (
                                                <span className="text-lg font-bold font-mono text-white">
                                                    {formatStat(stat.key, a)}
                                                </span>
                                            )}
                                        </div>

                                        <div className="w-28 md:w-40 text-center">
                                            <p className="text-sm font-semibold text-gray-200">{stat.label}</p>
                                            <div className="mt-1.5 h-1.5 rounded bg-gray-800 overflow-hidden flex">
                                                {total > 0 && (
                                                    <>
                                                        <div style={{ width: `${shareA}%` }} className="bg-purple-500" />
                                                        <div className="flex-1 bg-gray-500" />
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex justify-start">
                                            {canEditStats ? (
                                                <StatEditor
                                                    value={b}
                                                    step={stat.step}
                                                    max={stat.max}
                                                    disabled={saving}
                                                    onCommit={(v) => saveStat('B', stat.key, v)}
                                                />
                                            ) : (
                                                <span className="text-lg font-bold font-mono text-white">
                                                    {formatStat(stat.key, b)}
                                                </span>
                                            )}
                                        </div>
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