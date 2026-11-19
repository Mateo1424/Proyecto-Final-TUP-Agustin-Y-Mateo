import { useState } from 'react';
import { Link } from '../../routing/navigation.js';
import { getStoredUser } from '../../utils/Roles.js';
import { dateTime } from '../../utils/format.js';
import { useTournamentInbox } from '../../hooks/useTournamentInbox.js';
import { registrationState } from '../../utils/tournamentRules.js';
import EnrollmentCard from '../../components/tournaments/EnrollmentCard.jsx';
export default function MyEnrollmentsPage() {
  const user=getStoredUser(); const [filter,setFilter]=useState({status:'',page:1});
  const {items,loading,error,message,hasMore,busy,load,act,observedAt}=useTournamentInbox(user?.id,filter.status,filter.page);
  return <main className="min-h-screen bg-[#0b0e0d] px-5 py-8 text-[#eef1e9] md:px-9">
    <div className="mx-auto max-w-4xl"><p className="text-xs font-semibold uppercase tracking-[.2em] text-[#c4e988]">Competir en equipo</p><h1 className="mt-3 text-3xl font-bold">Mis inscripciones</h1>
      <p className="mb-6 mt-3 max-w-2xl text-[#a9b0a5]">Confirmá tu propia entrada y seguí las cinco confirmaciones. Una solicitud pendiente no reserva plaza.</p>
      <label className="mb-5 flex items-center gap-3">Estado <select value={filter.status} onChange={event=>setFilter({status:event.target.value,page:1})} className="rounded-lg border border-[#424a40] bg-[#151b17] p-2 text-white"><option value="">Todos</option><option value="Pending">Pendientes</option><option value="Admitted">Inscriptos</option><option value="Cancelled">Cancelados</option></select></label>
      {message&&<p role="status" className="mb-4 text-[#c4e988]">{message}</p>}
      {error&&<p role="alert" className="mb-4 text-[#ff988f]">{error} <button onClick={load} className="underline">Reintentar</button></p>}
      {loading?<p role="status">Cargando solicitudes…</p>:items.length===0?<p className="border-t border-[#424a40] py-8 text-[#a9b0a5]">No hay solicitudes con este estado.</p>:<div className="space-y-5">{items.map(item=><article key={`${item.tournamentId}:${item.requestId}`} className="border-t border-[#424a40] pt-5"><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><Link to={`/tournaments/${item.tournamentId}`} className="text-lg font-semibold text-[#ff988f] underline-offset-4 hover:underline">{item.title}</Link><span className="text-sm text-[#a9b0a5]">{item.gameName} · {dateTime(item.startDate)}</span></div><EnrollmentCard prototype confirmationOpen={registrationState({...item,status:item.tournamentStatus},observedAt) === "open"} item={item} userId={user?.id} busy={busy} frozen={Boolean(item.closedAt)||item.tournamentStatus==='Cancelado'} onConfirm={()=>act('confirm',item)} onCancel={()=>act('cancel',item)} /></article>)}</div>}
      <nav aria-label="Páginas de solicitudes" className="mt-7 flex items-center justify-between gap-4"><button disabled={loading||busy||filter.page===1} onClick={()=>setFilter(old=>({...old,page:old.page-1}))} className="rounded-lg border border-[#424a40] px-4 py-2 disabled:opacity-40">Anterior</button><span>Página {filter.page}</span><button disabled={loading||busy||!hasMore} onClick={()=>setFilter(old=>({...old,page:old.page+1}))} className="rounded-lg bg-[#c4e988] px-4 py-2 font-semibold text-[#151b17] disabled:opacity-40">Siguiente</button></nav>
    </div>
  </main>;
}
