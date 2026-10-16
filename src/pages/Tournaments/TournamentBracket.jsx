import React, { useState } from 'react';
import { apiFetch } from '../../config';
import { getGameRules } from '../../utils/GameRules';
import { Link } from 'react-router-dom';

const roundName = (round, totalRounds) => {
    const fromFinal = totalRounds - round;
    if (fromFinal === 0) return 'Final';
    if (fromFinal === 1) return 'Semifinales';
    if (fromFinal === 2) return 'Cuartos de final';
    return `Ronda ${round}`;
};

const smallBtn =
    'w-6 h-6 flex items-center justify-center rounded border text-xs font-bold transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';

function PlayerRow({ player, score, isWinner, isEliminated, isMe, emptyLabel, isDisqualified, manage }) {
    return (
        <div
            className={`flex items-center justify-between gap-2 px-3 py-2 text-sm ${
                isWinner ? 'bg-purple-600/20 text-white font-semibold' : ''
            } ${isEliminated || isDisqualified ? 'text-gray-500' : 'text-gray-200'}`}
        >
            <span className="min-w-0 flex-1 truncate flex items-center gap-2">
                {player ? (
                    <span className={isDisqualified ? 'line-through' : ''}>{player.username}</span>
                ) : (
                    <span className="italic text-gray-500">{emptyLabel}</span>
                )}
                {isMe && (
                    <span className="text-[10px] bg-purple-900 text-purple-200 px-1.5 py-0.5 rounded">Tú</span>
                )}
                {isDisqualified && (
                    <span className="text-[10px] bg-red-950 text-red-400 border border-red-800/50 px-1.5 py-0.5 rounded">
                        DESC.
                    </span>
                )}
            </span>

            {manage ? (
                <span className="flex items-center gap-1 shrink-0">
                    <button
                        type="button"
                        disabled={manage.busy}
                        onClick={() => manage.onScore(-1)}
                        title="Restar uno"
                        className={`${smallBtn} border-gray-700 text-gray-300 hover:bg-gray-800/60`}
                    >
                        −
                    </button>
                    <span className="w-6 text-center font-mono text-xs text-white">{score ?? 0}</span>
                    <button
                        type="button"
                        disabled={manage.busy}
                        onClick={() => manage.onScore(1)}
                        title="Sumar uno"
                        className={`${smallBtn} border-gray-700 text-gray-300 hover:bg-gray-800/60`}
                    >
                        +
                    </button>

                    <span className="w-px h-5 bg-gray-700 mx-1" />

                    <button
                        type="button"
                        disabled={manage.busy}
                        onClick={manage.onWin}
                        title="Gana el partido y avanza"
                        className={`${smallBtn} border-emerald-700 text-emerald-400 hover:bg-emerald-950/40`}
                    >
                        ✓
                    </button>
                    <button
                        type="button"
                        disabled={manage.busy}
                        onClick={manage.onLose}
                        title="Pierde: avanza el rival"
                        className={`${smallBtn} border-red-800 text-red-400 hover:bg-red-950/50`}
                    >
                        ✕
                    </button>
                </span>
            ) : (
                <span className="font-mono text-xs text-gray-400">{score ?? ''}</span>
            )}
        </div>
    );
}

// Formulario para corregir a mano el resultado de un partido ya terminado
function ResultEditor({ match, busy, onClose, onSubmit }) {
    const [scoreA, setScoreA] = useState(match.scoreA ?? 0);
    const [scoreB, setScoreB] = useState(match.scoreB ?? 0);
    const [winnerId, setWinnerId] = useState('');

    const handleSave = async () => {
        const ok = await onSubmit(Number(scoreA), Number(scoreB), winnerId || null);
        if (ok) onClose();
    };

    const inputClass =
        'w-16 p-1.5 bg-[#161b22] border border-gray-800 rounded text-white text-sm text-center focus:border-purple-500 outline-none';

    return (
        <div className="border-t border-gray-800/80 p-3 space-y-3 bg-black/30">
            <div className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate text-gray-300">{match.playerA.username}</span>
                <input type="number" min={0} value={scoreA} onChange={e => setScoreA(e.target.value)} className={inputClass} />
            </div>
            <div className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate text-gray-300">{match.playerB.username}</span>
                <input type="number" min={0} value={scoreB} onChange={e => setScoreB(e.target.value)} className={inputClass} />
            </div>

            <div>
                <label className="block text-[11px] text-gray-400 mb-1">Ganador</label>
                <select
                    value={winnerId}
                    onChange={e => setWinnerId(e.target.value)}
                    style={{ colorScheme: 'dark' }}
                    className="w-full p-1.5 bg-[#161b22] border border-gray-800 rounded text-white text-xs outline-none focus:border-purple-500"
                >
                    <option value="">Automático (por puntaje)</option>
                    <option value={match.playerA.userId}>{match.playerA.username}</option>
                    <option value={match.playerB.userId}>{match.playerB.username}</option>
                </select>
            </div>

            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={busy}
                    className="flex-1 py-1.5 text-xs font-bold rounded bg-purple-600 hover:bg-purple-500 text-white transition disabled:opacity-50 cursor-pointer"
                >
                    {busy ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                    type="button"
                    onClick={onClose}
                    disabled={busy}
                    className="px-3 py-1.5 text-xs font-semibold rounded border border-gray-700 text-gray-300 hover:bg-gray-800/60 transition cursor-pointer"
                >
                    Cancelar
                </button>
            </div>
        </div>
    );
}

export default function TournamentBracket({
    matches,
    currentUserId,
    canManage = false,
    gameName = '',
    disqualifiedIds = [],
    onMatchesUpdated
}) {
    const [editingId, setEditingId] = useState(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    if (!matches || matches.length === 0) return null;

    const rules = getGameRules(gameName);
    const disqualified = new Set(disqualifiedIds);

    const totalRounds = Math.max(...matches.map(m => m.round));
    const byRound = Array.from({ length: totalRounds }, (_, i) =>
        matches
            .filter(m => m.round === i + 1)
            .sort((a, b) => a.position - b.position)
    );

    // Campeón: ganador de la final
    const finalMatch = matches.find(m => m.round === totalRounds);
    const champion = finalMatch?.winnerUserId
        ? [finalMatch.playerA, finalMatch.playerB].find(p => p?.userId === finalMatch.winnerUserId)
        : null;

    // Llama al backend; si responde con las llaves actualizadas, se las pasa a la página
    const callApi = async (path, options) => {
        setBusy(true);
        setError('');
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

            if (Array.isArray(data) && onMatchesUpdated) onMatchesUpdated(data);
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setBusy(false);
        }
    };

    const adjustScore = (match, side, delta) =>
        callApi(`/tournaments/${match.tournamentId}/matches/${match.id}/score`, {
            method: 'POST',
            body: JSON.stringify({ side, delta })
        });

    const setResult = (match, scoreA, scoreB, winnerUserId) =>
        callApi(`/tournaments/${match.tournamentId}/matches/${match.id}/result`, {
            method: 'PUT',
            body: JSON.stringify({ scoreA, scoreB, winnerUserId })
        });

    // ✓ sobre un jugador: gana él. ✕ sobre un jugador: gana su rival.
    const declareWinner = async (match, winner, loser) => {
        const confirmed = window.confirm(
            `¿Confirmás que ${winner.username} gana el partido y avanza? ${loser.username} queda eliminado.`
        );
        if (!confirmed) return;
        await setResult(match, match.scoreA ?? 0, match.scoreB ?? 0, winner.userId);
    };

    return (
        <div className="space-y-4">
            {champion && (
                <div className="text-center py-3 rounded-lg border border-amber-800/40 bg-amber-950/30">
                    <span className="text-xs uppercase tracking-wider text-amber-400/80 block">Campeón</span>
                    <span className="text-xl font-extrabold text-amber-300">🏆 {champion.username}</span>
                </div>
            )}

            {canManage && (
                <div className="text-xs text-gray-400 border border-gray-800/80 rounded-lg px-3 py-2 bg-gray-900/40">
                    <span className="font-semibold text-purple-300">Modo moderador.</span>{' '}
                    <span className="font-mono">− +</span> ajustan el marcador ({rules.unit.toLowerCase()}
                    {rules.winScore ? `; gana solo al llegar a ${rules.winScore}` : '; en este juego el ganador se declara a mano'}
                    ). <span className="text-emerald-400 font-bold">✓</span> declara ganador y avanza.{' '}
                    <span className="text-red-400 font-bold">✕</span> lo da por perdedor y avanza al rival.
                </div>
            )}

            {error && (
                <div className="text-xs text-red-400 border border-red-800/50 bg-red-950/30 rounded-lg px-3 py-2">
                    {error}
                </div>
            )}

            <div className="flex gap-6 overflow-x-auto pb-2">
                {byRound.map((roundMatches, index) => {
                    const round = index + 1;
                    const emptyLabel = round === 1 ? 'BYE' : 'Por definir';

                    return (
                        <div key={round} className="flex flex-col shrink-0">
                            <h4 className="text-xs uppercase tracking-wider text-purple-400 font-semibold mb-3 text-center">
                                {roundName(round, totalRounds)}
                            </h4>

                            <div className="flex flex-col justify-around gap-4 flex-1">
                                {roundMatches.map(match => {
                                    const hasWinner = !!match.winnerUserId;
                                    const aWins = hasWinner && match.playerA?.userId === match.winnerUserId;
                                    const bWins = hasWinner && match.playerB?.userId === match.winnerUserId;
                                    const bothDefined = !!match.playerA && !!match.playerB;
                                    const editable = canManage && !match.isBye && bothDefined;
                                    const live = editable && !hasWinner;
                                    const isEditing = editingId === match.id;

                                    const manageFor = (side) => {
                                        if (!live) return null;
                                        const me = side === 'A' ? match.playerA : match.playerB;
                                        const rival = side === 'A' ? match.playerB : match.playerA;
                                        return {
                                            busy,
                                            onScore: (delta) => adjustScore(match, side, delta),
                                            onWin: () => declareWinner(match, me, rival),
                                            onLose: () => declareWinner(match, rival, me)
                                        };
                                    };

                                    return (
                                        <div
                                            key={match.id}
                                            className={`${canManage ? 'w-80' : 'w-56'} bg-gray-900/60 border border-gray-800/80 rounded-lg overflow-hidden`}
                                        >
                                            <PlayerRow
                                                player={match.playerA}
                                                score={match.scoreA}
                                                isWinner={aWins}
                                                isEliminated={hasWinner && !!match.playerA && !aWins}
                                                isMe={!!currentUserId && match.playerA?.userId === currentUserId}
                                                isDisqualified={!!match.playerA && disqualified.has(match.playerA.userId)}
                                                emptyLabel={emptyLabel}
                                                manage={manageFor('A')}
                                            />
                                            <div className="border-t border-gray-800/80" />
                                            <PlayerRow
                                                player={match.playerB}
                                                score={match.scoreB}
                                                isWinner={bWins}
                                                isEliminated={hasWinner && !!match.playerB && !bWins}
                                                isMe={!!currentUserId && match.playerB?.userId === currentUserId}
                                                isDisqualified={!!match.playerB && disqualified.has(match.playerB.userId)}
                                                emptyLabel={emptyLabel}
                                                manage={manageFor('B')}
                                            />

                                            {bothDefined && !match.isBye && (
                                                <Link
                                                    to={`/tournaments/${match.tournamentId}/matches/${match.id}`}
                                                    className="block w-full py-1.5 text-center text-[11px] font-semibold text-gray-400 hover:text-purple-300 hover:bg-purple-950/30 border-t border-gray-800/80 transition"
                                                >
                                                    Ver estadísticas →
                                                </Link>
                                            )}

                                            {match.isBye && (
                                                <p className="text-[10px] text-center text-gray-500 py-1 border-t border-gray-800/80">
                                                    Pasa directo a la siguiente ronda
                                                </p>
                                            )}

                                            {match.isWalkover && (
                                                <p className="text-[10px] text-center text-red-400/80 py-1 border-t border-gray-800/80">
                                                    Gana por descalificación del rival
                                                </p>
                                            )}

                                            {editable && hasWinner && !isEditing && (
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingId(match.id)}
                                                    className="w-full py-1.5 text-[11px] font-semibold text-purple-300 hover:bg-purple-950/40 border-t border-gray-800/80 transition cursor-pointer"
                                                >
                                                    Editar resultado
                                                </button>
                                            )}

                                            {editable && hasWinner && isEditing && (
                                                <ResultEditor
                                                    match={match}
                                                    busy={busy}
                                                    onClose={() => setEditingId(null)}
                                                    onSubmit={(a, b, winner) => setResult(match, a, b, winner)}
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}