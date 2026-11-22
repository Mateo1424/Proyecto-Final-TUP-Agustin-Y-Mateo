import { useState } from 'react';
import { useParams, useNavigate, Link } from '../../routing/navigation.js';
import { request } from '../../api/client.js';
import { cancelEnrollment, cancelTournament, closeTournament, confirmEnrollment } from '../../api/tournaments.js';
import { getStoredUser, isModerator as checkModerator } from '../../utils/Roles';
import { points, dateTime } from '../../utils/format.js';
import { canEditTournament, registrationState } from '../../utils/tournamentRules.js';
import { useTournamentDetails } from '../../hooks/useTournamentDetails.js';
import EnrollmentCard from '../../components/tournaments/EnrollmentCard.jsx';
import TournamentEconomy from '../../components/tournaments/TournamentEconomy.jsx';
import TournamentBracket from './TournamentBracket';
import DeleteTournament from '../../components/tournaments/DeleteTournament.jsx';
import './tournament-details.css';

export default function TournamentDetailPage({ onClose }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = getStoredUser();
  const isModerator = checkModerator(user);
  const { tournament, matches, teams:userTeams, enrollments, loading, error, busy, now, load, mutate } = useTournamentDetails(id,user?.id);
  if (loading) return <p role="status" className="arena-state">Cargando detalles...</p>;
  if (error) return <div role="alert" className="arena-state"><p>{error}</p><button className="arena-button mt-4" onClick={load}>Reintentar</button></div>;
  if (!tournament) return <p className="arena-state">Torneo no encontrado.</p>;
  return <TournamentContent key={id} {...{tournament,matches,userTeams,enrollments,busy,now,load,mutate,id,navigate,user,isModerator,onClose}} />;
}

export function TournamentContent({ tournament, matches, userTeams, enrollments, busy, now, load, mutate, id, navigate, user, isModerator, onClose }) {
  const [actionError,setActionError] = useState('');
  const registering = busy === 'register';
  const cancelling = busy === 'cancel';
  const generating = busy === 'bracket';
  const disqualifyingId = busy.startsWith('disqualify:') ? busy.slice(11) : null;
  const action = async (key,operation,question) => {
    if (busy || question && !window.confirm(question)) return;
    setActionError('');
    try { await mutate(key,operation); } catch (failure) { setActionError(failure.message); }
  };
  const handleRegister = () => {
    if (!user) { navigate('/login'); return; }
    return action('register',() => request(`/tournaments/${id}/register`,{method:'POST',data:{userId:user.id,username:user.username,inGameName:'',rank:'',registeredAt:new Date().toISOString()}}),`Confirmás tu inscripción y el pago de ${tournament.isFree ? '0 puntos' : points(tournament.entryPoints)}?`);
  };
  const handleRegisterTeam = teamId => action('register',() => request(`/tournaments/${id}/register-team`,{method:'POST',data:{teamId}}),`Vas a confirmar tu presencia y pagar tu propia entrada (${tournament.isFree ? 'gratis' : points(tournament.entryPoints)}). Los otros cuatro titulares deben confirmar por su cuenta; no se reserva plaza.`);
  const handleConfirm = requestId => action('confirm',() => confirmEnrollment(id,requestId),`Confirmás tu presencia y tu propio pago (${tournament.isFree ? 'gratis' : points(tournament.entryPoints)})?`);
  const handleCancelRequest = requestId => action('withdraw',() => cancelEnrollment(id,requestId),'Cancelar esta solicitud devuelve los puntos a todos los titulares que ya pagaron. ¿Continuar?');
  const handleCancelTournament = () => action('cancel',() => cancelTournament(id),`Cancelar "${tournament.title}" conserva el historial y devuelve las entradas cobradas. ¿Continuar?`);
  const handleClose = () => action('close',() => closeTournament(id),'El cierre definitivo acredita premios y Elo una sola vez y bloquea la edición y cancelación ordinarias. Revisá los resultados antes de continuar.');
  const handleGenerateBracket = () => action('bracket',() => request(`/tournaments/${id}/bracket`,{method:'POST'}),'Al iniciar se requiere cupo completo: si faltan participantes el backend cancela el torneo y devuelve los puntos. ¿Procesar ahora?');
  const handleDisqualify = participant => {
    const reason = window.prompt(`Motivo de descalificación de ${participant.username}:`,'');
    if (reason !== null) return action(`disqualify:${participant.userId}`,() => request(`/tournaments/${id}/participants/${participant.userId}/disqualify`,{method:'POST',data:{reason}}));
  };
  const handleMatchesUpdated = () => { void load(); };
  const isAlreadyRegistered = tournament.participants.some(p => p.userId === user?.id);
  const phase = registrationState(tournament,now);
  const registrationClosed = phase !== 'open';
  const canManageResults = canEditTournament(tournament,isModerator);
  const canDisqualify = isModerator && !tournament.closedAt && ['Próximo','En curso'].includes(tournament.status);
  const canCancelTournament = isModerator && !tournament.closedAt && tournament.status !== 'Cancelado';
  const disqualifiedIds = tournament.participants.filter(p => p.isDisqualified).map(p => p.userId);
  const startDateText = tournament.startDate ? dateTime(tournament.startDate) : null;

  return <article className="arena-tournament-detail">
    <header className="detail-heading">
      <div><p className="arena-eyebrow">{tournament.gameName} · {tournament.tournamentType === 'Equipo' ? 'Por equipos' : 'Individual'}</p>
        <h1 className="arena-title">{tournament.title}</h1>
        <p className="detail-status">{tournament.closedAt ? 'Cerrado definitivamente' : tournament.status} · Formato Playoffs</p>
      </div>
      <dl className="detail-dates"><div><dt>Inicio</dt><dd>{startDateText || 'Sin informar'}</dd></div><div><dt>Fin previsto</dt><dd>{tournament.endDate ? dateTime(tournament.endDate) : 'Sin informar'}</dd></div></dl>
    </header>
    <div className="detail-overview">
      <section className="detail-panel detail-registration" aria-label="Inscripción al torneo">
        <p className="arena-eyebrow">Tu participación</p><h2>Inscripción</h2>
        <p className="detail-entry">{tournament.isFree ? 'Gratis' : points(tournament.entryPoints)}<span> por jugador</span></p>
        {tournament.tournamentType === 'Individual' && <button onClick={handleRegister} disabled={isAlreadyRegistered || registrationClosed || Boolean(busy)} className="arena-button arena-button-primary">
          {isAlreadyRegistered ? 'Inscrito ✓' : registrationClosed ? 'Inscripciones cerradas' : registering ? 'Inscribiendo...' : `Inscribirme · ${tournament.isFree ? 'Gratis' : points(tournament.entryPoints)}`}
        </button>}
        {tournament.tournamentType === 'Equipo' && userTeams.filter(t => t.captainId === user?.id && t.gameName === tournament.gameName).map(team => <button key={team.id} disabled={registrationClosed || Boolean(busy) || enrollments.some(e => e.teamId === team.id && e.status !== 'Cancelled')} onClick={() => handleRegisterTeam(team.id)} className="arena-button arena-button-primary">Solicitar con {team.name} · mi entrada {tournament.isFree ? 'gratis' : points(tournament.entryPoints)}</button>)}
        {tournament.tournamentType === 'Equipo' && !userTeams.some(t => t.captainId === user?.id && t.gameName === tournament.gameName) && <p className="detail-muted">El capitán debe solicitar la inscripción. Después, cada uno de los cinco titulares confirma su presencia.</p>}
        <p className="detail-muted">{phase === 'early' ? 'Las inscripciones abren 30 minutos antes del inicio.' : phase === 'full' ? 'Cupo completo.' : phase === 'closed' ? 'Inscripciones cerradas.' : 'Inscripción abierta.'}</p>
      </section>
      <TournamentEconomy tournament={tournament} />
    </div>
    {actionError && <p role="alert" className="detail-error">{actionError}</p>}
    {enrollments.length > 0 && <section className="detail-section" aria-labelledby="detail-enrollments"><h2 id="detail-enrollments">Mis solicitudes en este torneo</h2><div className="detail-enrollments">{enrollments.map(item => <EnrollmentCard key={item.id} prototype item={{...item,isFree:tournament.isFree,entryPoints:tournament.entryPoints}} userId={user?.id} busy={Boolean(busy)} confirmationOpen={phase === 'open'} frozen={Boolean(tournament.closedAt) || tournament.status === 'Cancelado'} onConfirm={handleConfirm} onCancel={handleCancelRequest} />)}</div></section>}
    <div className="detail-information">
      <div className="detail-rules"><section className="detail-panel"><h2>Reglas clave</h2><p className="whitespace-pre-line detail-muted">{tournament.rules || 'No se especificaron reglas adicionales para este torneo.'}</p></section>
        <section className="detail-panel"><h2>Condiciones de rango</h2><p className="detail-muted">{tournament.rankConditions || 'Abierto a todos los rangos.'}</p></section>
      </div>
      <section className="detail-panel detail-participants" aria-labelledby="detail-participants-heading">
        <div className="detail-section-heading"><h2 id="detail-participants-heading">Inscritos</h2><span className="detail-count">{tournament.participants.length} / {tournament.maxParticipants}</span></div>
        {tournament.participants.length === 0 ? <p className="detail-muted">Aún no hay participantes inscritos.</p> : <ul className="detail-participant-list">{tournament.participants.map((p,index) => <li key={p.userId || index}>
          <Link to={p.userId === user?.id ? '/profile' : `/users/${p.userId}`} className={`detail-player ${p.isDisqualified ? 'is-disqualified' : ''}`} title={`Ver perfil de ${p.username}`}><strong>{p.username}{p.userId === user?.id && ' (vos)'}</strong><small>{p.inGameName || 'Sin nombre de juego'}</small></Link>
          <div className="detail-player-status"><span title={p.isDisqualified ? p.disqualificationReason || 'Sin motivo indicado' : undefined}>{p.isDisqualified ? 'Descalificado' : p.rank || 'Sin rango'}</span>
            {canDisqualify && !p.isDisqualified && <button type="button" onClick={() => handleDisqualify(p)} disabled={Boolean(busy)} className="detail-danger-link">{disqualifyingId === p.userId ? 'Descalificando...' : 'Descalificar'}</button>}
          </div>
        </li>)}</ul>}
      </section>
    </div>
    <section className="detail-section arena-bracket-region" aria-labelledby="detail-bracket-heading">
      <div className="detail-section-heading"><div><p className="arena-eyebrow">Camino al campeonato</p><h2 id="detail-bracket-heading">Llaves del torneo</h2></div>
        {isModerator && matches.length === 0 && tournament.status === 'Próximo' && <button onClick={handleGenerateBracket} disabled={Boolean(busy) || new Date(tournament.startDate).getTime() > now} className="arena-button">{generating ? 'Generando...' : 'Generar llaves ahora'}</button>}
      </div>
      {matches.length === 0 ? <p className="detail-muted">{new Date(tournament.startDate).getTime() > now ? 'Las llaves se generan al iniciar. Se requieren ocho participantes; si faltan se cancela y reembolsa.' : `Las llaves se generan automáticamente cuando comienza el torneo${startDateText ? ` (${startDateText})` : ''}.`}</p> : <TournamentBracket matches={matches} currentUserId={user?.id} canManage={canManageResults} closedAt={tournament.closedAt} gameName={tournament.gameName} disqualifiedIds={disqualifiedIds} onMatchesUpdated={handleMatchesUpdated} />}
    </section>
    {isModerator && !tournament.closedAt && <section className="detail-moderation" aria-label="Moderación del torneo">
      <h2>Moderación del torneo</h2><p className="detail-muted">Cancelar devuelve las entradas y conserva el historial. El cierre definitivo liquida premios y Elo y bloquea los resultados.</p>
      <div className="detail-moderation-actions">
        {canCancelTournament && <button onClick={handleCancelTournament} disabled={Boolean(busy)} className="arena-button detail-danger">{cancelling ? 'Cancelando...' : 'Cancelar torneo y devolver puntos'}</button>}
        {tournament.status === 'Finalizado' && <button disabled={Boolean(busy)} onClick={handleClose} className="arena-button">Cerrar definitivamente y liquidar premios / Elo</button>}
      </div>
      <DeleteTournament tournament={tournament} disabled={Boolean(busy)} onDeleted={() => onClose ? onClose() : navigate('/tournaments',{replace:true})} />
    </section>}
  </article>;
}
