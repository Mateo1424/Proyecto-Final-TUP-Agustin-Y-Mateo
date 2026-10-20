import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../config';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [userTeam, setUserTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados de control para editar perfil (estadísticas y avatar)
  const [isEditing, setIsEditing] = useState(false);
  const [statsForm, setStatsForm] = useState({ wins: 0, losses: 0, draws: 0 });
  const [avatarUrlInput, setAvatarUrlInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Estados para gestionar Juegos (RF-06, RF-07, RF-08)
  const [showGameModal, setShowGameModal] = useState(false);
  const [gameForm, setGameForm] = useState({ gameName: 'League of Legends', inGameName: '', rank: '' });
  const [isEditingGame, setIsEditingGame] = useState(false);

  const fetchProfileAndTeam = async () => {
    try {
      const profileResponse = await apiFetch('/profile/me');

      if (profileResponse.status === 401) {
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }

      if (!profileResponse.ok) {
        throw new Error('No se pudo cargar la información del perfil.');
      }

      const profileData = await profileResponse.json();
      setProfile(profileData);

      setStatsForm({
        wins: profileData.stats?.wins || 0,
        losses: profileData.stats?.losses || 0,
        draws: profileData.stats?.draws || 0
      });
      setAvatarUrlInput(profileData.avatarUrl || '');

      const teamsResponse = await apiFetch('/teams');

      if (teamsResponse.ok) {
        const teamsData = await teamsResponse.json();
        const foundTeam = teamsData.find(team => 
          team.members?.some(m => m.userId === profileData.id || m.UserId === profileData.id || m.username === profileData.username)
        );
        setUserTeam(foundTeam || null);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndTeam();
  }, []);

  // Actualizar Estadísticas y Avatar
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const statsResponse = await apiFetch('/profile/stats', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wins: Number(statsForm.wins),
          losses: Number(statsForm.losses),
          draws: Number(statsForm.draws)
        })
      });

      if (!statsResponse.ok) throw new Error('Error al actualizar las estadísticas.');
      const statsData = await statsResponse.json();

      const avatarResponse = await apiFetch('/profile/avatar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ AvatarUrl: avatarUrlInput })
      });

      if (!avatarResponse.ok) throw new Error('Error al actualizar el avatar.');
      const avatarData = await avatarResponse.json();
     
      setProfile(prev => ({
        ...prev,
        stats: statsData.stats,
        avatarUrl: avatarData.avatarUrl
      }));
     
      setIsEditing(false);
      alert('¡Perfil actualizado con éxito!');
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Guardar o Actualizar Videojuego (RF-06 y RF-07)
  const handleSaveGame = async (e) => {
    e.preventDefault();
    try {
      const method = isEditingGame ? 'PUT' : 'POST';
      const response = await apiFetch('/profile/games', {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameForm)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al guardar el videojuego.');

      setProfile(prev => ({ ...prev, games: data.games }));
      setShowGameModal(false);
      setGameForm({ gameName: 'League of Legends', inGameName: '', rank: '' });
      setIsEditingGame(false);
      alert(data.message);
    } catch (err) {
      alert(err.message);
    }
  };

  // Eliminar Videojuego (RF-08)
  const handleDeleteGame = async (gameName) => {
    if (!window.confirm(`¿Estás seguro de eliminar ${gameName} de tu perfil?`)) return;

    try {
      const response = await apiFetch(`/profile/games/${encodeURIComponent(gameName)}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al eliminar el videojuego.');

      setProfile(prev => ({ ...prev, games: data.games }));
      alert('Videojuego eliminado con éxito.');
    } catch (err) {
      alert(err.message);
    }
  };

  // Abrir modal para editar juego existente
  const openEditGame = (game) => {
    setGameForm({ gameName: game.gameName, inGameName: game.inGameName, rank: game.rank });
    setIsEditingGame(true);
    setShowGameModal(true);
  };

  if (loading) return <div className="p-8 text-white">Cargando perfil...</div>;
  if (error) return <div className="p-8 text-red-400">{error}</div>;

  const username = profile?.username || 'Usuario';
  const userInitial = username.charAt(0).toUpperCase();
  const joinDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    : 'Reciente';

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Cabecera del Perfil */}
      <header className="bg-[#161b22] p-8 rounded-2xl border border-gray-800 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-5 font-black text-8xl text-purple-500 pointer-events-none">
          PERFIL
        </div>

        <div className="w-24 h-24 rounded-full bg-purple-600 flex items-center justify-center font-black text-4xl text-white shadow-lg shadow-purple-900/40 uppercase border-2 border-purple-400 overflow-hidden flex-shrink-0">
          {profile?.avatarUrl && profile.avatarUrl.trim() !== '' ? (
            <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span>{userInitial}</span>
          )}
        </div>

        <div className="flex-1 text-center md:text-left space-y-2">
          <h1 className="text-3xl font-extrabold text-white tracking-wide">{username}</h1>
          <p className="text-gray-400 text-sm">
            Miembro desde <span className="text-gray-200 font-medium capitalize">{joinDate}</span>
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto justify-between">
          <div className="flex gap-4 border-t md:border-t-0 md:border-l border-gray-800 pt-4 md:pt-0 md:pl-6">
            <div className="text-center">
              <span className="block text-2xl font-bold text-purple-400">{profile?.stats?.matchesPlayed || 0}</span>
              <span className="text-xs text-gray-400 uppercase tracking-wider">Partidas</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl font-bold text-emerald-400">{profile?.stats?.winrate || 0}%</span>
              <span className="text-xs text-gray-400 uppercase tracking-wider">Winrate</span>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-all shadow-md cursor-pointer"
          >
            {isEditing ? 'Cancelar' : 'Editar Perfil'}
          </button>
        </div>
      </header>

      {/* Panel de Edición Desplegable */}
      {isEditing && (
        <section className="bg-[#161b22] rounded-xl p-6 border border-purple-500/50 shadow-xl space-y-4">
          <h3 className="text-lg font-semibold text-white">Editar Información del Perfil</h3>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Ganadas (Wins)</label>
                <input
                  type="number" min="0"
                  value={statsForm.wins}
                  onChange={(e) => setStatsForm({ ...statsForm, wins: e.target.value })}
                  className="w-full bg-[#0d1117] border border-gray-800 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Perdidas (Losses)</label>
                <input
                  type="number" min="0"
                  value={statsForm.losses}
                  onChange={(e) => setStatsForm({ ...statsForm, losses: e.target.value })}
                  className="w-full bg-[#0d1117] border border-gray-800 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Empatadas (Draws)</label>
                <input
                  type="number" min="0"
                  value={statsForm.draws}
                  onChange={(e) => setStatsForm({ ...statsForm, draws: e.target.value })}
                  className="w-full bg-[#0d1117] border border-gray-800 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">URL de Foto de Perfil (Avatar)</label>
              <input
                type="text"
                placeholder="https://images.unsplash.com/photo-..."
                value={avatarUrlInput}
                onChange={(e) => setAvatarUrlInput(e.target.value)}
                className="w-full bg-[#0d1117] border border-gray-800 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              type="submit" disabled={submitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-lg text-sm transition-all shadow-md disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Guardando cambios...' : 'Guardar Cambios'}
            </button>
          </form>
        </section>
      )}

      {/* Grid de Secciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Sección: Videojuegos (RF-05, RF-06, RF-07, RF-08) */}
        <section className="bg-[#161b22] rounded-xl p-6 border border-gray-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Videojuegos Asociados</h3>
            <button
              onClick={() => {
                setGameForm({ gameName: 'League of Legends', inGameName: '', rank: '' });
                setIsEditingGame(false);
                setShowGameModal(true);
              }}
              className="bg-purple-600 hover:bg-purple-500 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition cursor-pointer"
            >
              + Vincular Juego
            </button>
          </div>

          <div className="space-y-3">
            {profile?.games && profile.games.length > 0 ? (
              profile.games.map((game, index) => (
                <div key={index} className="bg-[#0d1117] p-4 rounded-lg border border-gray-800/80 flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white text-sm">{game.gameName}</h4>
                    <p className="text-xs text-purple-400 mt-0.5">
                      In-Game: <span className="text-gray-200 font-medium">{game.inGameName || 'N/A'}</span> | Rango: <span className="text-emerald-400 font-medium">{game.rank || 'Unranked'}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditGame(game)}
                      className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-2.5 py-1 rounded transition"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteGame(game.gameName)}
                      className="text-xs bg-red-950/60 hover:bg-red-900 text-red-300 px-2.5 py-1 rounded border border-red-800/40 transition"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400">No hay videojuegos vinculados en tu cuenta.</p>
            )}
          </div>
        </section>

        {/* Sección: Mi Equipo */}
        <section className="bg-[#161b22] rounded-xl p-6 border border-gray-800 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Mi Equipo</h3>
            {userTeam ? (
              <div className="bg-[#0d1117] p-4 rounded-lg border border-gray-800/80 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img src={userTeam.logoUrl} alt={userTeam.name} className="w-12 h-12 object-cover rounded-full border border-purple-500/50 bg-gray-900" />
                  <div>
                    <h4 className="font-bold text-white text-sm">{userTeam.name}</h4>
                    <span className="text-xs bg-purple-950 text-purple-400 px-2 py-0.5 rounded font-mono border border-purple-800">
                      [{userTeam.tag}]
                    </span>
                  </div>
                </div>
                <Link 
                  to={`/teams/${userTeam.id}`} 
                  className="bg-purple-600 hover:bg-purple-500 text-white text-xs px-3 py-2 rounded-lg font-medium transition shadow"
                >
                  Ver Equipo
                </Link>
              </div>
            ) : (
              <div className="text-center py-6 bg-[#0d1117] rounded-lg border border-gray-800/80 space-y-3">
                <p className="text-xs text-gray-400">No estás en ningún equipo actualmente.</p>
                <div className="flex justify-center gap-3 pt-2">
                  <Link 
                    to="/teams" 
                    className="bg-purple-600 hover:bg-purple-500 text-white text-xs px-4 py-2 rounded-lg font-bold transition shadow"
                  >
                    Explorar Equipos
                  </Link>
                  <Link 
                    to="/teams/create" 
                    className="bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs px-4 py-2 rounded-lg font-bold transition border border-gray-700"
                  >
                    + Crear mi Equipo
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

      </div>

      {/* Modal para Vincular/Modificar Videojuego */}
      {showGameModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#161b22] border border-gray-800 rounded-xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-white">
              {isEditingGame ? 'Modificar Videojuego' : 'Vincular Nuevo Videojuego'}
            </h3>
            <form onSubmit={handleSaveGame} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Videojuego</label>
                <select
                  disabled={isEditingGame}
                  value={gameForm.gameName}
                  onChange={(e) => setGameForm({ ...gameForm, gameName: e.target.value })}
                  className="w-full bg-[#0d1117] border border-gray-800 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-purple-500 disabled:opacity-50"
                >
                  <option value="League of Legends">League of Legends</option>
                  <option value="Valorant">Valorant</option>
                  <option value="CS:GO">CS:GO</option>
                  <option value="Rocket League">Rocket League</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Nombre de Usuario en el Juego (In-Game Name)</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: PlayerOne#EUW"
                  value={gameForm.inGameName}
                  onChange={(e) => setGameForm({ ...gameForm, inGameName: e.target.value })}
                  className="w-full bg-[#0d1117] border border-gray-800 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Rango o Nivel</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Diamante II / Immortal"
                  value={gameForm.rank}
                  onChange={(e) => setGameForm({ ...gameForm, rank: e.target.value })}
                  className="w-full bg-[#0d1117] border border-gray-800 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGameModal(false)}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
                >
                  {isEditingGame ? 'Guardar Cambios' : 'Vincular'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProfilePage;