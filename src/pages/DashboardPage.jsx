import { useCallback, useEffect, useState } from 'react';
import { Link } from '../routing/navigation.js';
import { request } from '../api/client.js';
import { GAMES, getCurrentElo } from '../api/rankings.js';
import { getMyEnrollments } from '../api/tournaments.js';
import { useEloRequest } from '../hooks/useEloRequest.js';
import { useSessionStore } from '../store/session.js';
import { useWalletStore } from '../store/wallet.js';
import { ActivityPreview, EloValue, ResourceState, WalletSummary } from '../components/dashboard/DashboardSections.jsx';
import './dashboard.css';

const loadProfile = signal => request('/profile/me', { signal });
const loadInvitations = signal => request('/team-invitations', { signal });
const loadPending = signal => getMyEnrollments({ status: 'Pending', page: 1, pageSize: 6 }, signal);
const loadAdmitted = signal => getMyEnrollments({ status: 'Admitted', page: 1, pageSize: 6 }, signal);

function GameSummary({ userId, game }) {
  const load = useCallback(signal => getCurrentElo('players', userId, game, signal), [userId, game]);
  const current = useEloRequest(load, `${userId}:${game}`);
  return <li><h3>{game}</h3><ResourceState resource={current}><EloValue current={current.data} /></ResourceState></li>;
}

export default function DashboardPage() {
  const user = useSessionStore(state => state.user);
  const wallet = useWalletStore();
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);
  const profile = useEloRequest(loadProfile, `${user?.id}:profile`);
  const invitations = useEloRequest(loadInvitations, `${user?.id}:invitations`);
  const pending = useEloRequest(loadPending, `${user?.id}:pending`);
  const admitted = useEloRequest(loadAdmitted, `${user?.id}:admitted`);
  const games = GAMES.filter(game => profile.data?.games?.some(value => value.gameName?.trim().toLowerCase() === game.toLowerCase()));

  return <div className="arena-dashboard">
    <header className="arena-page-heading">
      <div><p className="arena-eyebrow">Tu actividad</p><h1 className="arena-title">Hola, {user?.username ?? 'jugador'}</h1><p className="arena-muted">Tus próximas acciones, torneos y clasificación en un solo lugar.</p></div>
      <Link to="/tournaments" className="arena-button arena-button-primary">Buscar torneos</Link>
    </header>
    <div className="arena-dashboard-columns">
      <div className="arena-dashboard-activity">
        <ActivityPreview kind="pending" resource={pending} userId={user?.id} now={now} />
        <ActivityPreview kind="invitations" resource={invitations} now={now} />
        <ActivityPreview kind="active" resource={admitted} now={now} />
        <div className="arena-dashboard-explore"><p className="arena-muted">¿Buscás tu próxima competencia?</p><Link to="/tournaments" className="arena-detail-link">Explorar torneos</Link><Link to="/teams" className="arena-detail-link">Buscar un equipo</Link></div>
      </div>
      <div className="arena-dashboard-summary">
        <WalletSummary {...wallet} onRetry={wallet.refresh} />
        <section className="arena-dashboard-panel">
          <p className="arena-eyebrow">Competitivo</p><h2>Mi Elo por juego</h2>
          <p className="arena-muted">Se actualiza con los resultados elegibles. No es tu saldo de recompensas.</p>
          <ResourceState resource={profile}>
            {games.length && user?.id ? <ul className="arena-activity-list">{games.map(game => <GameSummary key={`${user.id}:${game}`} userId={user.id} game={game} />)}</ul> : <p className="arena-muted">No tenés juegos compatibles asociados. Agregalos en tu perfil para consultar tu Elo.</p>}
          </ResourceState>
          <div className="flex flex-wrap gap-x-5"><Link to="/profile" className="arena-detail-link">Ver mi perfil</Link><Link to="/rankings" className="arena-detail-link">Ver rankings</Link></div>
        </section>
      </div>
    </div>
  </div>;
}
