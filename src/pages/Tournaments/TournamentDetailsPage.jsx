import { useState } from 'react';
import { useParams, useNavigate, Link } from '../../routing/navigation.js';
import { request } from '../../api/client.js';
import { cancelEnrollment, cancelTournament, closeTournament, confirmEnrollment } from '../../api/tournaments.js';
import { getStoredUser, isModerator as checkModerator } from '../../utils/Roles';
import { points } from '../../utils/format.js';
import { canEditTournament, registrationState } from '../../utils/tournamentRules.js';
import { useTournamentDetails } from '../../hooks/useTournamentDetails.js';
import EnrollmentCard from '../../components/tournaments/EnrollmentCard.jsx';
import TournamentEconomy from '../../components/tournaments/TournamentEconomy.jsx';
import TournamentBracket from './TournamentBracket';
import DeleteTournament from '../../components/tournaments/DeleteTournament.jsx';

export default function TournamentDetailPage({ onClose }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = getStoredUser();
    const isModerator = checkModerator(user);
    const { tournament, matches, teams: userTeams, enrollments, loading, error, busy, now, load, mutate } = useTournamentDetails(id, user?.id);
    if (loading) return <p role="status" className="p-6 text-white">Cargando detalles...</p>;
    if (error) return <div role="alert" className="p-6 text-red-400">{error}<button className="ml-4 underline" onClick={load}>Reintentar</button></div>;
    if (!tournament) return <p className="p-6 text-white">Torneo no encontrado.</p>;
    return <TournamentContent {...{ tournament, matches, userTeams, enrollments, busy, now, load, mutate, id, navigate, user, isModerator, onClose }} />;
}

function TournamentContent({ tournament, matches, userTeams, enrollments, busy, now, load, mutate, id, navigate, user, isModerator, onClose }) {
    const [actionError, setActionError] = useState('');
    const registering = busy === 'register';
    const cancelling = busy === 'cancel';
    const generating = busy === 'bracket';
    const disqualifyingId = busy.startsWith('disqualify:') ? busy.slice(11) : null;
    const action = async (key, operation, question) => {
        if (busy || question && !window.confirm(question)) return;
        setActionError('');
        try { await mutate(key, operation); } catch (failure) { setActionError(failure.message); }
    };
    const handleRegister = () => {
        if (!user) { navigate('/login'); return; }
        return action('register', () => request(`/tournaments/${id}/register`, { method:'POST', data: { userId:user.id, username:user.username, inGameName:'', rank:'', registeredAt:new Date().toISOString() } }), `Confirmás tu inscripción y el pago de ${tournament.isFree ? '0 puntos' : points(tournament.entryPoints)}?`);
    };
    const handleRegisterTeam = teamId => action('register', () => request(`/tournaments/${id}/register-team`, { method:'POST', data:{teamId} }), `Vas a confirmar tu presencia y pagar tu propia entrada (${tournament.isFree ? 'gratis' : points(tournament.entryPoints)}). Los otros cuatro titulares deben confirmar por su cuenta; no se reserva plaza.`);
    const handleConfirm = requestId => action('confirm', () => confirmEnrollment(id, requestId), `Confirmás tu presencia y tu propio pago (${tournament.isFree ? 'gratis' : points(tournament.entryPoints)})?`);
    const handleCancelRequest = requestId => action('withdraw', () => cancelEnrollment(id, requestId), 'Cancelar esta solicitud devuelve los puntos a todos los titulares que ya pagaron. ¿Continuar?');
    const handleCancelTournament = () => action('cancel', () => cancelTournament(id), `Cancelar "${tournament.title}" conserva el historial y devuelve las entradas cobradas. ¿Continuar?`);
    const handleClose = () => action('close', () => closeTournament(id), 'El cierre definitivo acredita premios y Elo una sola vez y bloquea la edición y cancelación ordinarias. Revisá los resultados antes de continuar.');
    const handleGenerateBracket = () => action('bracket', () => request(`/tournaments/${id}/bracket`, {method:'POST'}), 'Al iniciar se requiere cupo completo: si faltan participantes el backend cancela el torneo y devuelve los puntos. ¿Procesar ahora?');
    const handleDisqualify = participant => {
        const reason = window.prompt(`Motivo de descalificación de ${participant.username}:`, '');
        if (reason !== null) return action(`disqualify:${participant.userId}`, () => request(`/tournaments/${id}/participants/${participant.userId}/disqualify`, {method:'POST',data:{reason}}));
    };
    const handleMatchesUpdated = () => { void load(); };

    const isAlreadyRegistered = tournament.participants.some(p => p.userId === user?.id);
    const phase = registrationState(tournament, now);
    const registrationClosed = phase !== 'open';
    const canManageResults = canEditTournament(tournament, isModerator);
    const canDisqualify = isModerator && !tournament.closedAt && ['Próximo', 'En curso'].includes(tournament.status);
    const canCancelTournament = isModerator && !tournament.closedAt && tournament.status !== 'Cancelado';
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
                    onClick={() => onClose ? onClose() : navigate('/tournaments')}
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
                            <span className="text-3xl font-extrabold text-emerald-400">{tournament.isFree ? "Participación válida" : points(tournament.prizePool)}</span>
                        </div>

                        <div className="flex flex-col gap-2 w-full md:w-auto">
                            {tournament.tournamentType === "Individual" && <button
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
                                            : `Inscribirme · ${tournament.isFree ? 'Gratis' : points(tournament.entryPoints)}`}
                            </button>}
                            {tournament.tournamentType === "Equipo" && userTeams.filter(t => t.captainId === user?.id && t.gameName === tournament.gameName).map(team => <button key={team.id} disabled={registrationClosed || Boolean(busy) || enrollments.some(e => e.teamId === team.id && e.status !== "Cancelled")} onClick={() => handleRegisterTeam(team.id)} className="rounded-lg bg-purple-600 px-4 py-3 font-bold disabled:opacity-50">Solicitar con {team.name} · mi entrada {tournament.isFree ? "gratis" : points(tournament.entryPoints)}</button>)}
                            {tournament.tournamentType === "Equipo" && !userTeams.some(t => t.captainId === user?.id && t.gameName === tournament.gameName) && <p className="max-w-sm text-sm text-gray-400">El capitán debe solicitar la inscripción. Después, cada uno de los cinco titulares confirma su presencia.</p>}
                            <p className="text-sm text-gray-400">{phase === "early" ? "Las inscripciones abren 30 minutos antes del inicio." : phase === "full" ? "Cupo completo." : phase === "closed" ? "Inscripciones cerradas." : "Inscripción abierta."}</p>
                            {canCancelTournament && (
                                <button
                                    onClick={handleCancelTournament}
                                    disabled={cancelling}
                                    className="w-full md:w-auto px-6 py-3 rounded-lg font-bold transition border border-red-800 text-red-400 hover:bg-red-950/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {cancelling ? 'Cancelando...' : 'Cancelar torneo y devolver puntos'}
                                </button>
                            )}
                            {isModerator && tournament.status === 'Finalizado' && !tournament.closedAt && <button disabled={Boolean(busy)} onClick={handleClose} className="rounded-lg border border-emerald-700 px-4 py-3 font-bold text-emerald-300 disabled:opacity-50">Cerrar definitivamente y liquidar premios / Elo</button>}
                            {isModerator && !tournament.closedAt && <DeleteTournament tournament={tournament} disabled={Boolean(busy)} onDeleted={() => onClose ? onClose() : navigate('/tournaments', { replace: true })} />}
                        </div>
                    </div>
                </div>
                {actionError && <p role="alert" className="mb-4 text-red-300">{actionError}</p>}
                <TournamentEconomy tournament={tournament} />
                {enrollments.length > 0 && <div className="mb-6 space-y-3"><h2 className="text-xl font-bold">Mis solicitudes en este torneo</h2>{enrollments.map(item => <EnrollmentCard key={item.id} item={{...item, isFree:tournament.isFree,entryPoints:tournament.entryPoints}} userId={user?.id} busy={Boolean(busy)} confirmationOpen={phase === "open"} frozen={Boolean(tournament.closedAt) || tournament.status==='Cancelado'} onConfirm={handleConfirm} onCancel={handleCancelRequest} />)}</div>}

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
                                disabled={generating || new Date(tournament.startDate).getTime() > now}
                                className="px-4 py-2 rounded-lg font-bold text-sm transition bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/40 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {generating ? 'Generando...' : 'Generar llaves ahora'}
                            </button>
                        )}
                    </div>

                    {matches.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-8">
                            {new Date(tournament.startDate).getTime() > now
                                ? 'Las llaves se generan al iniciar. Se requieren ocho participantes; si faltan se cancela y reembolsa.'
                                : `Las llaves se generan automáticamente cuando comienza el torneo${startDateText ? ` (${startDateText})` : ''}.`}
                        </p>
                    ) : (
                        <TournamentBracket
                            matches={matches}
                            currentUserId={user?.id}
                            canManage={canManageResults}
                            closedAt={tournament.closedAt}
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
