import { useState } from 'react';
import { Link } from '../../routing/navigation.js';
import { useOwnProfile } from '../../hooks/useOwnProfile.js';
import CurrentEloPanel from '../../components/rankings/CurrentEloPanel.jsx';
import { ProfileIdentity, ProfileEditors, ProfileGames, ProfileTeams } from '../../components/profile/OwnProfileSections.jsx';
import ProfileGameDialog from '../../components/profile/ProfileGameDialog.jsx';
import './profile.css';

export default function ProfilePage() {
  const data = useOwnProfile();
  const [editing, setEditing] = useState('');
  const [gameEditor, setGameEditor] = useState(null);
  function edit(section) { data.clearFeedback(); setEditing(section); }
  function editGame(game = null) { data.clearFeedback(); setGameEditor({ game }); }
  async function removeGame(name) {
    if (window.confirm(`¿Estás seguro de eliminar ${name} de tu perfil?`)) await data.removeGame(name);
  }
  if (data.loading) return <div className="arena-profile"><p role="status" className="arena-state">Cargando perfil…</p></div>;
  if (data.error || !data.profile) return <div className="arena-profile"><div role="alert" className="arena-state"><p>{data.error || 'No se pudo cargar el perfil.'}</p><button type="button" onClick={data.retry} className="arena-button">Reintentar perfil</button></div></div>;
  return <div className="arena-profile">
    <ProfileIdentity profile={data.profile} onEdit={edit} busy={data.busy} />
    {data.message && <p role="status" className="arena-profile-feedback">{data.message}</p>}
    {data.actionError && !gameEditor && <p role="alert" className="arena-profile-error">{data.actionError}</p>}
    <ProfileEditors key={editing} profile={data.profile} editing={editing} busy={data.busy} onAvatar={data.saveAvatar} onStats={data.saveStats} onClose={() => setEditing('')} />
    <div className="arena-profile-columns">
      <div className="arena-profile-main">
        <ProfileGames games={data.profile.games} busy={data.busy} onAdd={() => editGame()} onEdit={editGame} onDelete={removeGame} />
        <CurrentEloPanel prototype entityId={data.profile.id} games={data.profile.games ?? []} />
      </div>
      <div className="arena-profile-side">
        <ProfileTeams profile={data.profile} resource={data.teams} />
        <section className="arena-profile-panel"><h2>Mi actividad</h2><p className="arena-muted">Revisá tus solicitudes y el saldo disponible para participar o canjear recompensas.</p><div className="arena-profile-actions"><Link to="/tournament-enrollments" className="arena-detail-link">Mis inscripciones</Link><Link to="/rewards" className="arena-detail-link">Recompensas y saldo</Link></div></section>
      </div>
    </div>
    {gameEditor && <ProfileGameDialog game={gameEditor.game} busy={data.busy} error={data.actionError} onSave={data.saveGame} onClose={() => setGameEditor(null)} />}
  </div>;
}
