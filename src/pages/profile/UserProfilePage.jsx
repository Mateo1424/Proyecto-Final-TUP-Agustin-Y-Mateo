import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../../config';

const UserProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [userTeam, setUserTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Si el perfil pedido es el propio, llevamos a "Mi Perfil" (que permite editar)
    const storedUser = localStorage.getItem('user');
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    if (currentUser && currentUser.id === id) {
      navigate('/profile', { replace: true });
      return;
    }

    const fetchUserProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await apiFetch(`/profile/${id}`);

        if (response.status === 401) {
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }
        if (response.status === 404) {
          throw new Error('Usuario no encontrado.');
        }
        if (!response.ok) {
          throw new Error('No se pudo cargar el perfil del usuario.');
        }

        const data = await response.json();
        setProfile(data);

        // Equipo del usuario (la lista de equipos es pública)
        const teamsResponse = await apiFetch('/teams');
        if (teamsResponse.ok) {
          const teamsData = await teamsResponse.json();
          const foundTeam = teamsData.find(team =>
            team.members?.some(m => m.userId === data.id || m.UserId === data.id)
          );
          setUserTeam(foundTeam || null);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [id]);

  if (loading) return <div className="p-8 text-white">Cargando perfil...</div>;
  if (error) {
    return (
      <div className="p-8 space-y-4">
        <p className="text-red-400">{error}</p>
        <button onClick={() => navigate(-1)} className="text-sm text-purple-400 hover:underline">
          ← Volver
        </button>
      </div>
    );
  }

  const username = profile?.username || 'Usuario';
  const userInitial = username.charAt(0).toUpperCase();
  const joinDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    : 'Reciente';

  const lastActiveTime = profile?.lastActive ? new Date(profile.lastActive).getTime() : 0;
  const isOnline = (new Date().getTime() - lastActiveTime) < 3 * 60 * 1000;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-purple-400 hover:underline flex items-center gap-1"
      >
        ← Volver
      </button>

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
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-gray-500'}`}></span>
            <span className="text-xs text-gray-400 font-medium">
              {isOnline ? 'En línea' : 'Desconectado'}
            </span>
          </div>
        </div>

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
      </header>

      {/* Grid de Secciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Juegos */}
        <section className="bg-[#161b22] rounded-xl p-6 border border-gray-800 space-y-4">
          <h3 className="text-lg font-semibold text-white">Juegos</h3>
          <div className="space-y-3">
            {profile?.games && profile.games.length > 0 ? (
              profile.games.map((game, index) => (
                <div key={index} className="bg-[#0d1117] p-4 rounded-lg border border-gray-800/80 flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white text-sm">{game.gameName}</h4>
                    <p className="text-xs text-purple-400 mt-0.5">In-Game: {game.inGameName || 'N/A'} • Rango: {game.rank || 'Unranked'}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400">Este usuario no tiene juegos vinculados.</p>
            )}
          </div>
        </section>

        {/* Equipo */}
        <section className="bg-[#161b22] rounded-xl p-6 border border-gray-800 space-y-4">
          <h3 className="text-lg font-semibold text-white">Equipo</h3>
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
            <p className="text-xs text-gray-400">Este usuario no pertenece a ningún equipo.</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default UserProfilePage;