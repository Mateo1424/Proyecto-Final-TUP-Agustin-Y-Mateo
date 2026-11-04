import { Link } from 'react-router-dom';
import { invitationLabels, invitationStatus } from '../../utils/teamInvitations';

export default function InvitationList({ invitations, sent = false, busy, onAction }) {
  if (!invitations.length) return <p className="text-gray-400">No hay invitaciones {sent ? 'enviadas' : 'recibidas'}.</p>;
  return <ul className="space-y-3">
    {invitations.map(invitation => {
      const status = invitationStatus(invitation);
      return <li key={invitation.id} className="p-4 bg-gray-900/60 border border-gray-800 rounded-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-bold">{sent ? invitation.recipientUsername : <Link className="text-purple-300 hover:underline" to={`/teams/${invitation.teamId}`}>{invitation.teamName}</Link>}</p>
          {!sent && <p className="text-sm text-gray-400">Invitado por {invitation.senderUsername}</p>}
          <p className="text-sm text-gray-400">{invitationLabels[status] || status} · Vence: {new Date(invitation.expiresAt).toLocaleString('es-AR')}</p>
        </div>
        {status === 'Pending' && <div className="flex gap-2">
          {sent ? <button disabled={Boolean(busy)} onClick={() => onAction(invitation, 'cancel')} className="px-3 py-2 rounded bg-gray-800 disabled:opacity-50">{busy === invitation.id ? 'Procesando...' : 'Cancelar invitación'}</button>
            : <>
              <button disabled={Boolean(busy)} onClick={() => onAction(invitation, 'accept')} className="px-3 py-2 rounded bg-purple-600 disabled:opacity-50">{busy === invitation.id ? 'Procesando...' : 'Aceptar'}</button>
              <button disabled={Boolean(busy)} onClick={() => onAction(invitation, 'reject')} className="px-3 py-2 rounded bg-gray-800 disabled:opacity-50">Rechazar</button>
            </>}
        </div>}
      </li>;
    })}
  </ul>;
}
