import { useCallback } from 'react';
import { Redirect } from 'wouter';
import { Link, useNavigate, useParams } from '../../routing/navigation.js';
import { getPlayerProfile, getProfileTeams } from '../../api/profile.js';
import { useEloRequest } from '../../hooks/useEloRequest.js';
import { useSessionStore } from '../../store/session.js';
import CurrentEloPanel from '../../components/rankings/CurrentEloPanel.jsx';
import { ProfileIdentity, ProfileGames, ProfileTeams } from '../../components/profile/OwnProfileSections.jsx';
import './profile.css';

export function PublicProfileContent({ profile, teams }) {
  return <>
    <ProfileIdentity profile={profile} editable={false} />
    <div className="arena-profile-columns">
      <div className="arena-profile-main"><ProfileGames games={profile.games} editable={false} /><CurrentEloPanel prototype entityId={profile.id} games={profile.games ?? []} /></div>
      <ProfileTeams profile={profile} resource={teams} own={false} />
    </div>
  </>;
}

function PlayerProfile({ id }) {
  const navigate = useNavigate();
  const load = useCallback(async signal => {
    try { return await getPlayerProfile(id, signal); }
    catch (failure) {
      if (failure.status === 401 && !signal.aborted) { localStorage.removeItem('user'); navigate('/login'); }
      throw failure;
    }
  }, [id, navigate]);
  const profile = useEloRequest(load, `player-profile:${id}`);
  const teams = useEloRequest(getProfileTeams, `player-teams:${id}`);
  return <div className="arena-profile">
    <div className="arena-profile-actions mb-6"><button type="button" onClick={() => navigate(-1)} className="arena-detail-link">Volver</button><Link to="/rankings" className="arena-detail-link">Ver rankings</Link></div>
    {profile.loading ? <p role="status" className="arena-state">Cargando perfil…</p> : profile.error || profile.data?.id !== id ? <div role="alert" className="arena-state"><p>{profile.error || 'Perfil no disponible.'}</p><button type="button" onClick={profile.refresh} className="arena-button">Reintentar perfil</button></div> : <PublicProfileContent profile={profile.data} teams={teams} />}
  </div>;
}

export default function UserProfilePage() {
  const { id } = useParams();
  const ownId = useSessionStore(state => state.user?.id);
  if (id === ownId) return <Redirect to="/profile" replace />;
  return <PlayerProfile key={id} id={id} />;
}
