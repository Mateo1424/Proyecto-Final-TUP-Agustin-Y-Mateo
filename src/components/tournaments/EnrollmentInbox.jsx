import { Link } from '../../routing/navigation.js';
import { dateTime } from '../../utils/format.js';
import { registrationState } from '../../utils/tournamentRules.js';
import EnrollmentCard from './EnrollmentCard.jsx';

export default function EnrollmentInbox({userId,filter,items,loading,error,message,hasMore,busy,observedAt,onFilter,onPrevious,onNext,load,act}) {
  return <section className="arena-enrollment-inbox" aria-labelledby="enrollments-heading">
    <header className="arena-page-heading"><div><p className="arena-eyebrow">Tu participación</p><h1 id="enrollments-heading" className="arena-title">Mis inscripciones</h1><p className="inbox-intro">Confirmá tu propia entrada y seguí el estado de cada solicitud. En equipo, cada uno de los cinco titulares confirma por su cuenta.</p></div><Link to="/tournaments" className="arena-detail-link">Ver torneos</Link></header>
    <div className="inbox-toolbar"><div><label htmlFor="enrollments-status">Estado de la solicitud</label><select id="enrollments-status" value={filter.status} disabled={busy} onChange={event => onFilter(event.target.value)}><option value="">Todos</option><option value="Pending">Pendientes</option><option value="Admitted">Inscriptos</option><option value="Cancelled">Cancelados</option></select></div><p>Una solicitud pendiente no reserva plaza.</p></div>
    {!loading && message && !error && <p role="status" className="inbox-feedback">{message}</p>}
    {!loading && error && <div role="alert" className="inbox-error"><p>{error}</p><button type="button" onClick={load} disabled={busy} className="arena-button">Reintentar</button></div>}
    {loading ? <p role="status" className="arena-state">Cargando solicitudes…</p> : items.length === 0 ? !error && <div className="arena-state"><h2>No hay solicitudes con este estado.</h2><p>Podés revisar otro filtro o buscar tu próxima competencia.</p><Link to="/tournaments" className="arena-button mt-4">Ver torneos disponibles</Link></div> : <div className="inbox-requests">{items.map(item => <article key={`${item.tournamentId}:${item.requestId}`} className="inbox-request">
      <header className="inbox-tournament-heading"><div><p className="inbox-caption">{item.gameName}</p><h2><Link to={`/tournaments/${item.tournamentId}`}>{item.title}</Link></h2></div><div className="inbox-start"><span className="inbox-caption">Inicio del torneo</span><time dateTime={item.startDate}>{dateTime(item.startDate)}</time></div></header>
      <EnrollmentCard appearance="inbox" confirmationOpen={registrationState({...item,status:item.tournamentStatus},observedAt) === 'open'} item={item} userId={userId} busy={busy} frozen={Boolean(item.closedAt) || item.tournamentStatus === 'Cancelado'} onConfirm={() => act('confirm',item)} onCancel={() => act('cancel',item)} />
    </article>)}</div>}
    <nav aria-label="Páginas de solicitudes" className="inbox-pagination"><button type="button" disabled={loading || busy || filter.page === 1} onClick={onPrevious} className="arena-button">Anterior</button><span aria-live="polite">Página {filter.page}</span><button type="button" disabled={loading || busy || !hasMore} onClick={onNext} className="arena-button">Siguiente</button></nav>
  </section>;
}
