import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import InvitationList from '../../components/team/InvitationList';
import { teamRequest } from '../../utils/teamInvitations';

export default function TeamInvitationsPage() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [acceptedTeam, setAcceptedTeam] = useState(null);
  const actionLock = useRef(false);

  async function load() {
    setLoading(true);
    try { setInvitations(await teamRequest('/team-invitations')); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => {
    let active = true;
    teamRequest('/team-invitations')
      .then(data => { if (active) setInvitations(data); })
      .catch(err => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function act(invitation, action) {
    if (actionLock.current) return;
    actionLock.current = true;
    setBusy(invitation.id); setError(''); setSuccess(''); setAcceptedTeam(null);
    try {
      await teamRequest(`/team-invitations/${invitation.id}/${action}`, { method: 'POST' });
      setSuccess(action === 'accept' ? `Te uniste a ${invitation.teamName}.` : 'Invitación rechazada.');
      if (action === 'accept') setAcceptedTeam(invitation.teamId);
    } catch (err) { setError(err.message); }
    finally {
      await load();
      actionLock.current = false; setBusy('');
    }
  }

  return <div className="p-6 text-white max-w-5xl mx-auto space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-3xl font-extrabold">Mis invitaciones a equipos</h1>
      <button disabled={loading || Boolean(busy)} onClick={() => { setError(''); load(); }} className="px-4 py-2 rounded bg-purple-600 disabled:opacity-50">{loading ? 'Cargando...' : 'Actualizar'}</button>
    </div>
    <p className="text-gray-400">Las invitaciones vencen a los siete días. Para aceptar, necesitás el videojuego y rango en tu perfil y no pertenecer a otro equipo.</p>
    {error && <p role="alert" className="text-red-400">{error}</p>}
    {success && <p role="status" className="text-emerald-400">{success} {acceptedTeam && <Link to={`/teams/${acceptedTeam}`} className="underline">Ver equipo</Link>}</p>}
    {loading ? <p role="status">Cargando invitaciones...</p> : <InvitationList invitations={invitations} busy={busy} onAction={act} />}
    <Link to="/teams" className="inline-block text-purple-300 hover:underline">← Volver a equipos</Link>
  </div>;
}
