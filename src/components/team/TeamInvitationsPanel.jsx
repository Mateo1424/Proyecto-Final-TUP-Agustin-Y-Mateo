import { useEffect, useRef, useState } from 'react';
import { invitationStatus, teamRequest } from '../../utils/teamInvitations';
import InvitationList from './InvitationList';

export default function TeamInvitationsPanel({ teamId }) {
  const [invitations, setInvitations] = useState([]);
  const [username, setUsername] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const actionLock = useRef(false);
  const searchVersion = useRef(0);

  async function load() {
    setLoading(true);
    try { setInvitations(await teamRequest(`/teams/${teamId}/invitations`)); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => {
    let active = true;
    teamRequest(`/teams/${teamId}/invitations`)
      .then(data => { if (active) setInvitations(data); })
      .catch(err => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; searchVersion.current += 1; };
  }, [teamId]);

  async function search(event) {
    event.preventDefault();
    const version = ++searchVersion.current;
    setSearching(true); setError(''); setSuccess(''); setUsers([]); setSearched(false);
    try {
      const data = await teamRequest(`/teams/${teamId}/invitees?username=${encodeURIComponent(username.trim())}`);
      if (version === searchVersion.current) { setUsers(data); setSearched(true); }
    } catch (err) { if (version === searchVersion.current) setError(err.message); }
    finally { if (version === searchVersion.current) setSearching(false); }
  }

  async function act(target, action) {
    if (actionLock.current) return;
    actionLock.current = true;
    setBusy(target.id); setError(''); setSuccess('');
    try {
      if (action === 'invite') {
        await teamRequest(`/teams/${teamId}/invitations`, { method: 'POST', body: { recipientId: target.id } });
        setSuccess(`Invitación enviada a ${target.username}. Vence en siete días.`);
      } else {
        await teamRequest(`/team-invitations/${target.id}/cancel`, { method: 'POST' });
        setSuccess('Invitación cancelada.');
      }
    } catch (err) { setError(err.message); }
    finally {
      await load();
      actionLock.current = false; setBusy('');
    }
  }

  return <section className="bg-[#161b22] border border-gray-800 rounded-xl p-6 space-y-4">
    <h2 className="text-xl font-bold">Invitaciones del equipo</h2>
    <p className="text-sm text-gray-400">Buscá por nombre de usuario. El destinatario debe tener el videojuego y rango en su perfil y no pertenecer a otro equipo.</p>
    <form onSubmit={search} className="flex flex-wrap gap-2">
      <label htmlFor="invitee-search" className="sr-only">Nombre de usuario</label>
      <input id="invitee-search" value={username} onChange={event => { searchVersion.current += 1; setSearching(false); setUsername(event.target.value); setUsers([]); setSearched(false); }} minLength={2} maxLength={40} required placeholder="Nombre de usuario (mínimo 2 caracteres)" className="flex-1 min-w-48 p-2 bg-gray-900 border border-gray-700 rounded" />
      <button disabled={searching || Boolean(busy) || username.trim().length < 2} className="px-4 py-2 rounded bg-purple-600 disabled:opacity-50">{searching ? 'Buscando...' : 'Buscar usuarios'}</button>
    </form>
    {error && <p role="alert" className="text-red-400">{error}</p>}
    {success && <p role="status" className="text-emerald-400">{success}</p>}
    {searched && !users.length && <p className="text-gray-400">No se encontraron usuarios disponibles.</p>}
    {users.length > 0 && <ul className="space-y-2">{users.map(user => {
      const pending = invitations.some(invitation => invitation.recipientId === user.id && invitationStatus(invitation) === 'Pending');
      return <li key={user.id} className="flex items-center justify-between gap-3 p-3 bg-gray-900 rounded">
        <span>{user.username}</span>
        <button disabled={Boolean(busy) || pending} onClick={() => act(user, 'invite')} className="px-3 py-2 rounded bg-purple-600 disabled:opacity-50">{pending ? 'Invitación pendiente' : busy === user.id ? 'Enviando...' : 'Invitar'}</button>
      </li>;
    })}</ul>}
    <div className="flex items-center justify-between gap-3">
      <h3 className="font-semibold">Invitaciones enviadas</h3>
      <button onClick={() => { setError(''); load(); }} disabled={loading || Boolean(busy)} className="text-purple-300 disabled:opacity-50">Actualizar</button>
    </div>
    {loading ? <p role="status" className="text-gray-400">Cargando invitaciones...</p> : <InvitationList invitations={invitations} sent busy={busy} onAction={act} />}
  </section>;
}
