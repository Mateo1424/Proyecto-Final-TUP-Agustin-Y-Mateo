import { useEffect, useRef, useState } from 'react';
import TeamInvitationsInbox from '../../components/teams/TeamInvitationsInbox';
import { teamRequest } from '../../utils/teamInvitations';
import './team-invitations.css';

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

  return <TeamInvitationsInbox invitations={invitations} loading={loading} busy={busy} error={error} success={success} acceptedTeam={acceptedTeam} load={() => { setError(''); load(); }} onAction={act} />;
}
