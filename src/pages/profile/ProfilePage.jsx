import React, { useState, useEffect } from 'react';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estado de control para editar perfil (estadísticas y avatar)
  const [isEditing, setIsEditing] = useState(false);
  const [statsForm, setStatsForm] = useState({ wins: 0, losses: 0, draws: 0 });
  const [avatarUrlInput, setAvatarUrlInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('https://localhost:7039/api/profile/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('No se pudo cargar la información del perfil.');
        }

        const data = await response.json();
        setProfile(data);

        setStatsForm({
          wins: data.stats?.wins || 0,
          losses: data.stats?.losses || 0,
          draws: data.stats?.draws || 0
        });
        setAvatarUrlInput(data.avatarUrl || '');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Actualizar Estadísticas y Avatar
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
     
      const statsResponse = await fetch('https://localhost:7039/api/profile/stats', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wins: Number(statsForm.wins),
          losses: Number(statsForm.losses),
          draws: Number(statsForm.draws)
        })
      });

      if (!statsResponse.ok) throw new Error('Error al actualizar las estadísticas.');
      const statsData = await statsResponse.json();

      const avatarResponse = await fetch('https://localhost:7039/api/profile/avatar', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
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

        {/* Avatar limpio y corregido */}
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          {/* Juegos Registrados (Sincronizados automáticamente desde el registro) */}
          <section className="bg-[#161b22] rounded-xl p-6 border border-gray-800 space-y-4">
            <h3 className="text-lg font-semibold text-white">Juego Principal</h3>
            <div className="space-y-3">
              {profile?.games && profile.games.length > 0 ? (
                profile.games.map((game, index) => (
                  <div key={index} className="bg-[#0d1117] p-4 rounded-lg border border-gray-800/80 flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white text-sm">{game.gameName}</h4>
                      <p className="text-xs text-purple-400 mt-0.5">In-Game: {game.inGameName || 'N/A'} • Rango: {game.rank || 'Unranked'}</p>
                    </div>
                    <span className="text-xs bg-purple-950/60 text-purple-300 px-2.5 py-1 rounded border border-purple-800/40">
                      Vinculado
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400">No hay juegos vinculados en tu cuenta.</p>
              )}
            </div>
          </section>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <section className="bg-[#161b22] rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Historial de Torneos</h3>
            <p className="text-xs text-gray-400">Próximamente podrás ver aquí todas tus participaciones oficiales sincronizadas desde MongoDB.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 